// ============================================
// API SERVICE MODULE
// ============================================

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Get authentication token from localStorage
function getAuthToken() {
    const user = JSON.parse(localStorage.getItem('crispyUser'));
    return user && user.token ? user.token : null;
}

// Generic API request function
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        ...options
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ============================================
// AUTHENTICATION API
// ============================================

// Register user
async function registerUser(userData) {
    return await apiRequest('/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
}

// Login user
async function loginUser(credentials) {
    const response = await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    });
    
    // Store user data and token
    if (response.success && response.data.token) {
        localStorage.setItem('crispyUser', JSON.stringify({
            ...response.data.user,
            token: response.data.token,
            loggedIn: true
        }));
    }
    
    return response;
}

// Logout user
async function logoutUser() {
    try {
        await apiRequest('/logout', { method: 'POST' });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('crispyUser');
    }
}

// Get user profile
async function getUserProfile() {
    return await apiRequest('/profile');
}

// Update user profile
async function updateUserProfile(userData) {
    return await apiRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify(userData)
    });
}

// ============================================
// PRODUCTS API
// ============================================

// Get all products
async function getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    return await apiRequest(endpoint);
}

// Get single product
async function getProduct(productId) {
    return await apiRequest(`/products/${productId}`);
}

// Get popular products
async function getPopularProducts() {
    return await apiRequest('/products/popular');
}

// Get new arrivals
async function getNewArrivals() {
    return await apiRequest('/products/new-arrivals');
}

// Get products on sale
async function getOnSaleProducts() {
    return await apiRequest('/products/on-sale');
}

// Create product (admin only)
async function createProduct(productData) {
    return await apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify(productData)
    });
}

// Update product (admin only)
async function updateProduct(productId, productData) {
    return await apiRequest(`/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
    });
}

// Delete product (admin only)
async function deleteProduct(productId) {
    return await apiRequest(`/products/${productId}`, {
        method: 'DELETE'
    });
}

// ============================================
// ORDERS API
// ============================================

// Get user orders
async function getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/orders?${queryString}` : '/orders';
    return await apiRequest(endpoint);
}

// Get single order
async function getOrder(orderId) {
    return await apiRequest(`/orders/${orderId}`);
}

// Create order
async function createOrder(orderData) {
    return await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
    });
}

// Update order status (admin only)
async function updateOrderStatus(orderId, status) {
    return await apiRequest(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    });
}

// Cancel order
async function cancelOrder(orderId) {
    return await apiRequest(`/orders/${orderId}/cancel`, {
        method: 'POST'
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Check if user is authenticated
function isAuthenticated() {
    const user = JSON.parse(localStorage.getItem('crispyUser'));
    return user && user.token && user.loggedIn;
}

// Check if user is admin
function isAdmin() {
    const user = JSON.parse(localStorage.getItem('crispyUser'));
    return user && user.role === 'admin';
}

// Handle API errors
function handleApiError(error, customMessage = null) {
    const message = customMessage || error.message || 'An error occurred. Please try again.';
    console.error('API Error:', error);
    
    // Show error notification
    if (typeof showError === 'function') {
        showError(message);
    }
    
    // Redirect to login if authentication error
    if (error.message && error.message.includes('Unauthorized')) {
        localStorage.removeItem('crispyUser');
        window.location.href = 'login.html';
    }
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

// Auth
window.registerUser = registerUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.getUserProfile = getUserProfile;
window.updateUserProfile = updateUserProfile;

// Products
window.getProducts = getProducts;
window.getProduct = getProduct;
window.getPopularProducts = getPopularProducts;
window.getNewArrivals = getNewArrivals;
window.getOnSaleProducts = getOnSaleProducts;
window.createProduct = createProduct;
window.updateProduct = updateProduct;
window.deleteProduct = deleteProduct;

// Orders
window.getOrders = getOrders;
window.getOrder = getOrder;
window.createOrder = createOrder;
window.updateOrderStatus = updateOrderStatus;
window.cancelOrder = cancelOrder;

// Utilities
window.isAuthenticated = isAuthenticated;
window.isAdmin = isAdmin;
window.handleApiError = handleApiError;
