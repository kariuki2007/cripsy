<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'name' => 'Classic Potato Crisps',
                'description' => 'Golden, crispy potato chips with a touch of sea salt. Perfectly seasoned and irresistibly crunchy.',
                'price' => 4.99,
                'original_price' => null,
                'image_url' => null,
                'badge' => 'popular',
                'rating' => 4.5,
                'review_count' => 128,
                'is_active' => true,
                'stock_quantity' => 100,
            ],
            [
                'name' => 'Spicy Jalapeño Crisps',
                'description' => 'Bold and spicy chips with real jalapeño flavor. For those who like it hot!',
                'price' => 5.49,
                'original_price' => null,
                'image_url' => null,
                'badge' => 'new',
                'rating' => 5.0,
                'review_count' => 95,
                'is_active' => true,
                'stock_quantity' => 75,
            ],
            [
                'name' => 'Cheesy Cheddar Crisps',
                'description' => 'Rich cheddar cheese flavor in every crispy bite. A cheese lover\'s dream!',
                'price' => 4.99,
                'original_price' => 6.99,
                'image_url' => null,
                'badge' => 'sale',
                'rating' => 4.5,
                'review_count' => 112,
                'is_active' => true,
                'stock_quantity' => 50,
            ],
            [
                'name' => 'Sour Cream & Onion',
                'description' => 'Tangy sour cream with savory onion seasoning. A classic combination that never disappoints.',
                'price' => 4.49,
                'original_price' => null,
                'image_url' => null,
                'badge' => 'popular',
                'rating' => 4.0,
                'review_count' => 89,
                'is_active' => true,
                'stock_quantity' => 120,
            ],
            [
                'name' => 'Barbecue BBQ Crisps',
                'description' => 'Smoky and sweet barbecue flavor that will transport you to summer cookouts.',
                'price' => 5.29,
                'original_price' => null,
                'image_url' => null,
                'badge' => 'popular',
                'rating' => 4.7,
                'review_count' => 156,
                'is_active' => true,
                'stock_quantity' => 85,
            ],
            [
                'name' => 'Salt & Vinegar',
                'description' => 'The perfect balance of tangy vinegar and sea salt. Sharp, crisp, and addictive.',
                'price' => 4.79,
                'original_price' => null,
                'image_url' => null,
                'badge' => null,
                'rating' => 4.2,
                'review_count' => 67,
                'is_active' => true,
                'stock_quantity' => 90,
            ],
            [
                'name' => 'Honey Mustard Crisps',
                'description' => 'Sweet honey combined with tangy mustard for a unique flavor experience.',
                'price' => 5.99,
                'original_price' => null,
                'image_url' => null,
                'badge' => 'new',
                'rating' => 4.3,
                'review_count' => 42,
                'is_active' => true,
                'stock_quantity' => 60,
            ],
            [
                'name' => 'Ranch Seasoned Crisps',
                'description' => 'Creamy ranch flavor with herbs and spices. The ultimate comfort chip.',
                'price' => 4.89,
                'original_price' => 5.89,
                'image_url' => null,
                'badge' => 'sale',
                'rating' => 4.6,
                'review_count' => 103,
                'is_active' => true,
                'stock_quantity' => 70,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
