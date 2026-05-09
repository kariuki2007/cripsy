# Authentication Integration Guide

## Overview
The frontend authentication has been fully integrated with the Laravel backend API. Users can now register, login, and manage their accounts through the web interface.

## Features Implemented

### 1. User Registration
- **Endpoint**: `POST /api/v1/register`
- **Fields**: Name, Email, Phone, Password, Password Confirmation
- **Validation**: Client-side and server-side validation
- **Auto-login**: Users are automatically logged in after successful registration

### 2. User Login
- **Endpoint**: `POST /api/v1/login`
- **Fields**: Email, Password
- **Token Management**: JWT tokens stored in localStorage
- **Session Persistence**: Users remain logged in across browser sessions

### 3. User Logout
- **Endpoint**: `POST /api/v1/logout`
- **Token Revocation**: Server-side token invalidation
- **Local Cleanup**: localStorage cleared on logout

### 4. Profile Management
- **Endpoint**: `GET /api/v1/profile` - View user profile
- **Endpoint**: `PUT /api/v1/profile` - Update user profile
- **Navigation**: Dynamic menu updates based on auth state

## Testing Instructions

### Prerequisites
1. Laravel backend server running on `http://localhost:8000`
2. Database migrations completed: `php artisan migrate`
3. Database seeded: `php artisan db:seed`

### Test Registration
1. Navigate to `register.html`
2. Fill in the registration form:
   - Full Name: Test User
   - Email: test@example.com
   - Phone: 1234567890
   - Password: password123
   - Confirm Password: password123
   - Check terms and conditions
3. Click "Register"
4. **Expected**: Success message and redirect to home page
5. **Check**: Navigation shows user name and Profile/Logout options

### Test Login
1. Navigate to `login.html`
2. Enter credentials:
   - Email: test@example.com (or any registered user)
   - Password: password123
3. Click "Login"
4. **Expected**: Success message and redirect to home page
5. **Check**: Navigation updates to show logged-in state

### Test Logout
1. Click on account dropdown in navigation
2. Click "Logout"
3. **Expected**: Success message and redirect to home page
4. **Check**: Navigation returns to Login/Register options

### Test Cart Integration
1. Login with a valid account
2. Add products to cart from `products.html`
3. Navigate to `cart.html`
4. Click "Proceed to Checkout"
5. **Expected**: Order creation success (requires authentication)

## API Integration Details

### Authentication Flow
1. **Registration**: `registerUser()` → API → Token storage → Auto-login
2. **Login**: `loginUser()` → API → Token storage → State update
3. **Logout**: `logoutUser()` → API → Token cleanup → State reset

### Token Management
- **Storage**: localStorage under key `crispyUser`
- **Format**: `{ user_data, token, loggedIn: true }`
- **Usage**: Automatic inclusion in API headers via `getAuthToken()`

### Error Handling
- **Network Errors**: Fallback to offline mode with notifications
- **Validation Errors**: Server errors displayed to user
- **Authentication Errors**: Auto-redirect to login page

## File Structure

### Frontend Files
- `js/api.js` - API service module
- `js/script.js` - Main JavaScript with auth handlers
- `login.html` - Login page
- `register.html` - Registration page
- `cart.html` - Cart page (auth required for checkout)

### Backend Integration
- All API endpoints configured for `http://localhost:8000/api/v1`
- Automatic token-based authentication
- Role-based access control (customer/admin)

## Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure Laravel CORS is properly configured
2. **401 Unauthorized**: Check token storage and API base URL
3. **422 Validation**: Review form validation rules
4. **Network Errors**: Verify backend server is running

### Debug Tools
- Browser DevTools → Network tab to see API calls
- Console logs for authentication state
- localStorage inspection for token storage

## Security Notes
- Passwords are hashed on the backend
- JWT tokens have expiration (configurable in Laravel)
- HTTPS recommended for production
- Input validation on both client and server side

## Next Steps
1. Add password reset functionality
2. Implement social login (Google/Facebook)
3. Add email verification
4. Create user dashboard/profile page
5. Implement order history page
