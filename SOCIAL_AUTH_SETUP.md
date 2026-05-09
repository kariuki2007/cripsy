# Social Authentication Setup Guide

## Overview
Google and Facebook OAuth authentication has been integrated into the Crispy Club frontend and backend. Users can now sign up/login using their social media accounts.

## Features Implemented

### 1. Google OAuth Integration
- **Frontend**: Google Sign-In JavaScript SDK integration
- **Backend**: Google OAuth token validation and user creation
- **Flow**: Google popup → User consent → Token exchange → User creation/login

### 2. Facebook OAuth Integration
- **Frontend**: Facebook Login JavaScript SDK integration
- **Backend**: Facebook OAuth token validation and user creation
- **Flow**: Facebook popup → User consent → Token exchange → User creation/login

## Setup Instructions

### Google OAuth Setup

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing one
   - Enable "Google Sign-In API" and "People API"

2. **Create OAuth Credentials**
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Select "Web application"
   - Add authorized JavaScript origins: `http://localhost:3000` (your frontend URL)
   - Add authorized redirect URIs: `http://localhost:3000` (your frontend URL)

3. **Get Client ID**
   - Copy the "Client ID" from the credentials page
   - Replace `YOUR_GOOGLE_CLIENT_ID` in `js/script.js`

### Facebook OAuth Setup

1. **Create Facebook App**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create new app or select existing one
   - Add "Facebook Login" product

2. **Configure OAuth**
   - Go to "Facebook Login" → "Settings"
   - Add "Valid OAuth Redirect URIs": `http://localhost:3000` (your frontend URL)
   - Enable "Web OAuth Login"

3. **Get App ID**
   - Copy the "App ID" from the dashboard
   - Replace `YOUR_FACEBOOK_APP_ID` in `js/script.js`

## Configuration Files

### Frontend Configuration
Update the following constants in `js/script.js`:

```javascript
// Google OAuth Configuration
const GOOGLE_CLIENT_ID = 'your-actual-google-client-id.apps.googleusercontent.com';
const GOOGLE_REDIRECT_URI = window.location.origin + '/auth/google/callback';

// Facebook OAuth Configuration
const FACEBOOK_APP_ID = 'your-actual-facebook-app-id';
const FACEBOOK_API_VERSION = 'v18.0';
```

### Backend Database Migration
Run the migration to add social authentication fields:

```bash
php artisan migrate
```

This will add the following columns to the `users` table:
- `provider` (string, nullable) - OAuth provider (google, facebook)
- `provider_id` (string, nullable) - OAuth provider user ID
- `avatar` (string, nullable) - User avatar URL from social provider
- `email_verified_at` (timestamp, nullable) - Email verification timestamp

## Usage Instructions

### For Users
1. **Login with Google**: Click "Login with Google" button
2. **Login with Facebook**: Click "Login with Facebook" button
3. **Registration**: Same buttons work on registration page
4. **Account Creation**: New accounts are automatically created if they don't exist

### For Developers

### Frontend Integration
The social authentication is automatically initialized on pages that include the SDKs:

```html
<!-- Google OAuth SDK -->
<script src="https://apis.google.com/js/platform.js?onload=initGoogleAuth" async defer></script>

<!-- Facebook SDK -->
<div id="fb-root"></div>
<script async defer crossorigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js"></script>
```

### Backend API Endpoints

#### Google Authentication
- **Endpoint**: `POST /api/v1/auth/google`
- **Request Body**:
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "provider": "google",
    "provider_id": "google-user-id",
    "avatar": "https://lh3.googleusercontent.com/...",
    "token": "google-oauth-token"
  }
  ```

#### Facebook Authentication
- **Endpoint**: `POST /api/v1/auth/facebook`
- **Request Body**:
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "provider": "facebook",
    "provider_id": "facebook-user-id",
    "avatar": "https://graph.facebook.com/...",
    "token": "facebook-oauth-token"
  }
  ```

#### Response Format
```json
{
  "success": true,
  "message": "Google/Facebook authentication successful",
  "data": {
    "user": { ...user_data },
    "token": "jwt-token",
    "token_type": "Bearer"
  }
}
```

## Security Considerations

1. **Environment Variables**: Store OAuth credentials in `.env` file for production
2. **HTTPS**: Use HTTPS URLs for production OAuth redirects
3. **Token Validation**: Backend validates OAuth tokens before creating accounts
4. **Email Verification**: Social accounts are marked as email verified automatically
5. **Rate Limiting**: Implement rate limiting for OAuth endpoints

## Testing

### Local Development
1. Update client IDs in `js/script.js`
2. Start Laravel backend: `php artisan serve`
3. Start frontend development server
4. Test Google and Facebook login flows

### Production
1. Update OAuth redirect URIs to production domain
2. Configure proper HTTPS
3. Test with real Facebook/Google accounts
4. Monitor OAuth logs for issues

## Troubleshooting

### Common Issues
1. **"Invalid Client" Error**: Check Google Client ID configuration
2. **"Invalid App ID" Error**: Check Facebook App ID configuration
3. **"Redirect URI Mismatch"**: Update authorized origins in OAuth console
4. **Popup Blocked**: Check browser popup blockers
5. **CORS Issues**: Ensure backend CORS is properly configured

### Debug Mode
Enable console logging to see detailed OAuth flow:
```javascript
// Console will show OAuth requests and responses
```

## Next Steps
1. Add email verification for manual registration
2. Implement social account linking
3. Add user avatar upload functionality
4. Create OAuth callback handlers for server-side flow
5. Add social login analytics and tracking
