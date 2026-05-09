<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\OrderStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Twilio\Rest\Client;
use Validator;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = $user->orders()->with(['orderItems.product']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Sort by
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $orders = $query->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => [
                'orders' => $orders->items(),
                'pagination' => [
                    'current_page' => $orders->currentPage(),
                    'last_page' => $orders->lastPage(),
                    'per_page' => $orders->perPage(),
                    'total' => $orders->total(),
                ]
            ]
        ]);
    }

    public function show(Order $order): JsonResponse
    {
        $user = request()->user();
        
        if ($order->user_id !== $user->id && !$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $order->load(['orderItems.product', 'user']);

        return response()->json([
            'success' => true,
            'data' => [
                'order' => $order
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_address' => 'required|string|max:500',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $user = $request->user();
            $totalAmount = 0;
            $orderItems = [];

            // Check stock and calculate total
            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['product_id']);
                
                if (!$product->is_active) {
                    throw new \Exception("Product {$product->name} is not available");
                }

                if ($product->stock_quantity < $item['quantity']) {
                    throw new \Exception("Insufficient stock for {$product->name}. Available: {$product->stock_quantity}");
                }

                $subtotal = $product->price * $item['quantity'];
                $totalAmount += $subtotal;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $product->price,
                    'subtotal' => $subtotal,
                ];
            }

            // Calculate shipping (free shipping over $50)
            $shippingCost = $totalAmount >= 50 ? 0 : 5.99;

            // Create order
            $order = Order::create([
                'user_id' => $user->id,
                'total_amount' => $totalAmount,
                'shipping_cost' => $shippingCost,
                'status' => 'pending',
                'shipping_address' => $request->shipping_address,
                'notes' => $request->notes,
            ]);

            // Create order items and update stock
            foreach ($orderItems as $item) {
                $orderItem = $order->orderItems()->create($item);
                
                // Update product stock
                $product = Product::find($item['product_id']);
                $product->decrement('stock_quantity', $item['quantity']);
            }

            DB::commit();

            // Load order with relationships for response
            $order->load(['orderItems.product', 'user']);

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => [
                    'order' => $order
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create order: ' . $e->getMessage()
            ], 400);
        }
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $order->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully',
            'data' => [
                'order' => $order
            ]
        ]);
    }

    public function cancel(Order $order): JsonResponse
    {
        $user = request()->user();
        
        if ($order->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        if ($order->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Order cannot be cancelled'
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Restore stock
            foreach ($order->orderItems as $item) {
                $product = Product::find($item->product_id);
                $product->increment('stock_quantity', $item->quantity);
            }

            // Update order status
            $order->update(['status' => 'cancelled']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order cancelled successfully',
                'data' => [
                    'order' => $order
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel order: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Send SMS notification for order status update
     */
    public function sendOrderStatusSMS(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'order_number' => 'required|string',
            'status' => 'required|string',
            'message' => 'nullable|string',
            'phone_number' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Create order status record
            $orderStatus = OrderStatus::create([
                'order_number' => $request->order_number,
                'status' => $request->status,
                'message' => $request->message,
                'phone_number' => $request->phone_number,
                'sent_at' => now()
            ]);

            // Send SMS using Twilio
            $this->sendSMSNotification(
                $request->phone_number,
                "Order {$request->order_number}: {$request->status}"
            );

            return response()->json([
                'success' => true,
                'message' => 'SMS notification sent successfully',
                'data' => [
                    'order_status' => $orderStatus
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send SMS notification: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send SMS notification using Twilio
     */
    private function sendSMSNotification($phoneNumber, $message)
    {
        try {
            $twilio = new Client(
                env('TWILIO_SID'),
                env('TWILIO_TOKEN'),
                env('TWILIO_PHONE_NUMBER')
            );

            $twilio->messages->create([
                'from' => env('TWILIO_PHONE_NUMBER'),
                'to' => $phoneNumber,
                'body' => $message
            ]);

            \Log::info('SMS sent to ' . $phoneNumber . ': ' . $message);

        } catch (\Exception $e) {
            \Log::error('SMS sending failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update order status and send SMS
     */
    public function updateOrderStatus(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'order_number' => 'required|string',
            'status' => 'required|string',
            'message' => 'nullable|string',
            'send_sms' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Find the order
            $order = Order::where('order_number', $request->order_number)->first();
            
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Update order status
            $order->update([
                'status' => $request->status,
                'updated_at' => now()
            ]);

            // Create status record
            $orderStatus = OrderStatus::create([
                'order_number' => $request->order_number,
                'status' => $request->status,
                'message' => $request->message,
                'phone_number' => $order->user->phone ?? null,
                'sent_at' => now()
            ]);

            // Create Sanctum token
            $token = $user->createToken('auth_token')->plainTextToken;

            // Send SMS notification for new order
            if ($user->phone) {
                $this->sendSMSNotification(
                    $user->phone,
                    "Order {$order->order_number}: Confirmed! Your order has been placed successfully."
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully',
                'data' => [
                    'order' => $order->load(['orderItems.product']),
                    'order_number' => $order->order_number
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to place order: ' . $e->getMessage()
            ], 500);
        }
    }
}
