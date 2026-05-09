<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@crispyclub.com',
            'password' => Hash::make('password'),
            'phone' => '+1234567890',
            'address' => '123 Admin Street, Admin City, USA',
            'role' => 'admin',
        ]);

        // Create sample customer users
        User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => Hash::make('password'),
            'phone' => '+1234567891',
            'address' => '456 Customer Ave, Customer City, USA',
            'role' => 'customer',
        ]);

        User::create([
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'password' => Hash::make('password'),
            'phone' => '+1234567892',
            'address' => '789 Shopper Lane, Shopper Town, USA',
            'role' => 'customer',
        ]);
    }
}
