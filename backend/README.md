# Crispy Club Backend API

A Laravel-based REST API for the Crispy Club e-commerce platform.

## Features

- **Authentication**: User registration, login, logout, and profile management
- **Products Management**: CRUD operations for products with filtering and search
- **Order Management**: Complete order lifecycle with status tracking
- **Role-based Access**: Admin and customer roles with appropriate permissions
- **Stock Management**: Automatic stock updates on orders
- **Free Shipping**: Automatic free shipping for orders over $50

## API Endpoints

### Authentication
- `POST /api/v1/register` - User registration
- `POST /api/v1/login` - User login
- `POST /api/v1/logout` - User logout (protected)
- `GET /api/v1/profile` - Get user profile (protected)
- `PUT /api/v1/profile` - Update user profile (protected)

### Products
- `GET /api/v1/products` - List all products (public)
- `GET /api/v1/products/{id}` - Get product details (public)
- `GET /api/v1/products/popular` - Get popular products (public)
- `GET /api/v1/products/new-arrivals` - Get new arrivals (public)
- `GET /api/v1/products/on-sale` - Get products on sale (public)
- `POST /api/v1/products` - Create product (admin only)
- `PUT /api/v1/products/{id}` - Update product (admin only)
- `DELETE /api/v1/products/{id}` - Delete product (admin only)

### Orders
- `GET /api/v1/orders` - List user orders (protected)
- `GET /api/v1/orders/{id}` - Get order details (protected)
- `POST /api/v1/orders` - Create order (protected)
- `PUT /api/v1/orders/{id}/status` - Update order status (admin only)
- `POST /api/v1/orders/{id}/cancel` - Cancel order (protected)

### Health Check
- `GET /api/health` - API health check

## Installation

1. Clone the repository
2. Install dependencies: `composer install`
3. Copy environment file: `cp .env.example .env`
4. Generate application key: `php artisan key:generate`
5. Configure your database in `.env`
6. Run migrations: `php artisan migrate`
7. Seed the database: `php artisan db:seed`
8. Start the development server: `php artisan serve`

## Default Admin User

- **Email**: admin@crispyclub.com
- **Password**: password

## Database Schema

### Users
- Basic user information with role-based access (customer/admin)
- Includes phone and address fields for shipping

### Products
- Product catalog with pricing, ratings, and stock management
- Badge system for popular/new/sale items
- Active status for product availability

### Orders
- Order tracking with unique order numbers
- Status management (pending, processing, shipped, delivered, cancelled)
- Shipping cost calculation with free shipping over $50

### Order Items
- Detailed order line items with product relationships
- Automatic subtotal calculation

## API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

Error responses include detailed error messages and validation errors.

## Security Features

- Token-based authentication using Laravel Sanctum
- Role-based access control
- Input validation and sanitization
- SQL injection protection
- CORS support

## Development

The API follows RESTful conventions and includes comprehensive error handling, validation, and security features.
