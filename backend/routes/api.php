<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::prefix('v1')->group(function () {
    // Authentication routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Social authentication routes
    Route::post('/auth/google', [AuthController::class, 'googleAuth']);
    Route::post('/auth/facebook', [AuthController::class, 'facebookAuth']);
    Route::post('/auth/google/callback', [AuthController::class, 'googleCallback']);

    // Product routes (public)
    Route::apiResource('products', ProductController::class)->only(['index', 'show']);
    Route::get('/products/popular', [ProductController::class, 'popular']);
    Route::get('/products/new-arrivals', [ProductController::class, 'newArrivals']);
    Route::get('/products/on-sale', [ProductController::class, 'onSale']);
});

// Protected routes
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    // Authentication routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Product management routes (admin only)
    Route::apiResource('products', ProductController::class)->only(['store', 'update', 'destroy'])
        ->middleware('admin');

    // Order routes
    Route::apiResource('orders', OrderController::class);
    Route::put('/orders/{order}/status', [OrderController::class, 'updateStatus'])
        ->middleware('admin');
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel']);
    Route::post('/orders/sms', [OrderController::class, 'sendOrderStatusSMS']);
});

// Health check route
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toISOString(),
        'version' => '1.0.0'
    ]);
});
