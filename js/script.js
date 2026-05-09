// ============================================
// CRISPY CLUB - Main JavaScript File
// ============================================

// Shopping Cart Array
let cart = JSON.parse(localStorage.getItem('crispyCart')) || [];

// Wishlist Array
let wishlist = JSON.parse(localStorage.getItem('crispyWishlist')) || [];

// Initialize page on load
document.addEventListener('DOMContentLoaded', function() {
    initializeCart();
    initializeSearch();
    initializeSort();
    initializeFormValidation();
    updateCartDisplay();
    initializeScrollAnimations();
    initializeTouchAnimations();
    initializeLazyLoading();
    initializeCartPage();
    initializeWishlistPage();
    initializeOrderTracking();
    loadProductsFromAPI();
    updateAuthState();
});

// ============================================
// SCROLL ANIMATIONS
// ============================================

function initializeScrollAnimations() {
    const elements = document.querySelectorAll('.shipping-card, .special-card, .value-card, .team-card, .reason-card, .story-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    elements.forEach(element => {
        element.classList.add('reveal');
        observer.observe(element);
    });
}

// ============================================
// TOUCH ANIMATIONS FOR MOBILE
// ============================================

function initializeTouchAnimations() {
    const touchElements = document.querySelectorAll('.btn, .product-card, .card, .shipping-card, .special-card');
    
    touchElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });

        element.addEventListener('touchend', function() {
            this.style.transform = '';
        });

        element.addEventListener('mousedown', function() {
            if (window.innerWidth > 768) {
                this.style.transform = 'scale(0.98)';
            }
        });

        element.addEventListener('mouseup', function() {
            this.style.transform = '';
        });
    });
}

// ============================================
// LAZY LOADING IMAGES
// ============================================

function initializeLazyLoading() {
    if ('IntersectionObserver' in window) {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
}

// ============================================
// SHOPPING CART FUNCTIONALITY
// ============================================

// Add to cart function
function addToCart(productName, productPrice) {
    const product = {
        id: Date.now(),
        name: productName,
        price: productPrice,
        quantity: 1
    };

    // Check if product already exists in cart
    const existingProduct = cart.find(item => item.name === productName);
    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push(product);
    }

    // Save to localStorage
    localStorage.setItem('crispyCart', JSON.stringify(cart));
    
    // Show notification with animation
    showNotification(`${productName} added to cart!`);
    updateCartDisplay();
    
    // Add ripple effect
    addRippleEffect(event.target);
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('crispyCart', JSON.stringify(cart));
    updateCartDisplay();
}

// Update cart quantity
function updateCartQuantity(productId, newQuantity) {
    const product = cart.find(item => item.id === productId);
    if (product) {
        product.quantity = newQuantity > 0 ? newQuantity : 1;
        localStorage.setItem('crispyCart', JSON.stringify(cart));
        updateCartDisplay();
    }
}

// Initialize cart
function initializeCart() {
    const addToCartButtons = document.querySelectorAll('.btn-product');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('.product-name').textContent;
            const productPrice = productCard.querySelector('.price').textContent.replace('$', '');
            addToCart(productName, productPrice);
        });
    });
}

// Update cart display
function updateCartDisplay() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartBadges = document.querySelectorAll('.cart-count');
    cartBadges.forEach(cartBadge => {
        if (cartBadge) {
            cartBadge.textContent = cartCount;
            cartBadge.style.display = cartCount > 0 ? 'block' : 'none';
            cartBadge.classList.add('pulse');
            setTimeout(() => cartBadge.classList.remove('pulse'), 600);
        }
    });

    // Update wishlist display
    const wishlistCount = wishlist.length;
    const wishlistBadges = document.querySelectorAll('.wishlist-count');
    wishlistBadges.forEach(badge => {
        if (badge) {
            badge.textContent = wishlistCount;
            badge.style.display = wishlistCount > 0 ? 'block' : 'none';
        }
    });

    // Update cart page if on cart page
    if (window.location.pathname.includes('cart.html')) {
        renderCartItems();
        updateCartSummary();
    }

    // Update wishlist page if on wishlist page
    if (window.location.pathname.includes('wishlist.html')) {
        renderWishlistItems();
        updateWishlistSummary();
    }
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('keyup', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                filterProducts(this.value.toLowerCase());
            }, 300);
        });
    }

    const searchButton = document.querySelector('.btn-search');
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            const searchValue = document.querySelector('.search-input').value.toLowerCase();
            filterProducts(searchValue);
        });
    }
}

function filterProducts(searchTerm) {
    const productCards = document.querySelectorAll('.product-card');
    let visibleCount = 0;
    
    productCards.forEach(card => {
        const productName = card.querySelector('.product-name').textContent.toLowerCase();
        const productDescription = card.querySelector('.product-description').textContent.toLowerCase();
        
        if (productName.includes(searchTerm) || productDescription.includes(searchTerm)) {
            card.parentElement.style.display = 'block';
            card.parentElement.style.animation = 'fadeIn 0.4s ease-out';
            visibleCount++;
        } else {
            card.parentElement.style.display = 'none';
        }
    });

    if (visibleCount === 0) {
        showNotification('No products found. Try different keywords.');
    }
}

// ============================================
// SORT FUNCTIONALITY
// ============================================

function initializeSort() {
    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortProducts(this.value);
        });
    }
}

function sortProducts(sortType) {
    const productsContainer = document.querySelector('.products-section .row');
    if (!productsContainer) return;

    const productCards = Array.from(document.querySelectorAll('.products-section .product-card'));

    productCards.sort((a, b) => {
        const priceA = parseFloat(a.querySelector('.price').textContent.replace('$', ''));
        const priceB = parseFloat(b.querySelector('.price').textContent.replace('$', ''));
        const nameA = a.querySelector('.product-name').textContent;
        const nameB = b.querySelector('.product-name').textContent;

        switch(sortType) {
            case 'price-low':
                return priceA - priceB;
            case 'price-high':
                return priceB - priceA;
            case 'popular':
                return Math.random() - 0.5;
            case 'new':
                return Math.random() - 0.5;
            default:
                return 0;
        }
    });

    // Re-append sorted products with animation
    productCards.forEach((card, index) => {
        card.style.animation = `fadeIn 0.4s ease-out ${index * 0.05}s`;
        productsContainer.appendChild(card.parentElement);
    });
}

// ============================================
// FORM VALIDATION
// ============================================

function initializeFormValidation() {
    // Login form validation
    const authForms = document.querySelectorAll('.auth-form');
    authForms.forEach(form => {
        if (window.location.pathname.includes('login')) {
            form.addEventListener('submit', handleLoginSubmit);
        } else if (window.location.pathname.includes('register')) {
            form.addEventListener('submit', handleRegisterSubmit);
        }
    });

    // Contact form validation
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }

    // Add focus animations to form inputs
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.animation = 'glow 0.3s ease';
        });
    });
}

async function handleLoginSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }

    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }

    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }

    try {
        showNotification('Logging in...');
        const response = await loginUser({ email, password });
        
        if (response.success) {
            showNotification('Login successful!');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    } catch (error) {
        handleApiError(error, 'Login failed. Please check your credentials and try again.');
    }
}

async function handleRegisterSubmit(e) {
    e.preventDefault();
    
    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();
    const terms = document.getElementById('terms').checked;

    if (!fullname || !email || !phone || !password || !confirmPassword) {
        showError('Please fill in all fields');
        return;
    }

    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }

    if (phone.length < 10) {
        showError('Please enter a valid phone number');
        return;
    }

    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }

    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }

    if (!terms) {
        showError('Please agree to the terms and conditions');
        return;
    }

    try {
        showNotification('Creating your account...');
        
        // Debug: Log the user data being sent
        console.log('Registration data:', {
            name: fullname,
            email: email,
            password: password,
            password_confirmation: confirmPassword,
            phone: phone,
            address: ''
        });
        
        const userData = {
            name: fullname,
            email: email,
            password: password,
            password_confirmation: confirmPassword,
            phone: phone,
            address: '' // Optional field
        };
        
        const response = await registerUser(userData);
        
        if (response.success) {
            showNotification('Registration successful! You are now logged in.');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    } catch (error) {
        console.error('Registration error:', error);
        
        // Show more specific error messages
        if (error.message && error.message.includes('email')) {
            showError('Email already exists or is invalid. Please use a different email.');
        } else if (error.message && error.message.includes('password')) {
            showError('Password must be at least 8 characters and match confirmation.');
        } else {
            handleApiError(error, 'Registration failed. Please check all fields and try again.');
        }
    }
}

function handleContactSubmit(e) {
    e.preventDefault();
    
    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phonenumber').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!fullname || !email || !phone || !message) {
        showError('Please fill in all fields');
        return;
    }

    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }

    localStorage.setItem('crispyContact', JSON.stringify({
        fullname: fullname,
        email: email,
        phone: phone,
        message: message,
        timestamp: new Date().toISOString()
    }));

    showNotification('Message sent successfully! We will get back to you soon.');
    document.querySelector('.contact-form').reset();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function addRippleEffect(element) {
    const ripple = document.createElement('span');
    ripple.style.cssText = `
        position: absolute;
        pointer-events: none;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
    `;
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
        max-width: calc(100vw - 40px);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f44336;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
        max-width: calc(100vw - 40px);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ============================================
// DROPDOWN MENU CLOSE ON CLICK
// ============================================

document.addEventListener('click', function(event) {
    const navbar = document.querySelector('.navbar');
    if (navbar && !navbar.contains(event.target)) {
        const collapse = document.querySelector('.collapse.show');
        if (collapse) {
            collapse.classList.remove('show');
        }
    }
});

// ============================================
// ACTIVE NAV LINK
// ============================================

function setActiveNavLink() {
    const currentLocation = location.pathname;
    const navLinks = document.querySelectorAll('.nav-link:not(.dropdown-toggle)');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href && currentLocation.includes(href)) {
            link.classList.add('active');
        }
    });
}

setActiveNavLink();

// ============================================
// SMOOTH SCROLL
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// WINDOW RESIZE HANDLER FOR RESPONSIVE ANIMATIONS
// ============================================

let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        // Re-initialize animations on resize if needed
        if (window.innerWidth < 768) {
            // Mobile optimizations
        } else {
            // Desktop optimizations
        }
    }, 250);
});

// ============================================
// EXPORT FUNCTIONS FOR GLOBAL ACCESS
// ============================================

// ============================================
// AUTHENTICATION STATE MANAGEMENT
// ============================================

// Update authentication state in navigation
function updateAuthState() {
    const user = JSON.parse(localStorage.getItem('crispyUser'));
    const accountDropdown = document.getElementById('accountDropdown');
    
    if (accountDropdown && user && user.loggedIn) {
        const dropdownMenu = accountDropdown.nextElementSibling;
        if (dropdownMenu) {
            dropdownMenu.innerHTML = `
                <li><a href="#" class="dropdown-item" onclick="showUserProfile()">Profile</a></li>
                <li><a href="#" class="dropdown-item" onclick="logout()">Logout</a></li>
            `;
        }
        
        // Update dropdown text to show user name
        accountDropdown.innerHTML = `<i class="fa fa-user"></i> ${user.name || user.email}`;
    }
}

// Show user profile
async function showUserProfile() {
    try {
        const response = await getUserProfile();
        if (response.success) {
            const user = response.data.user;
            showNotification(`Welcome, ${user.name}! Email: ${user.email}`);
        }
    } catch (error) {
        handleApiError(error, 'Failed to load profile');
    }
}

// Logout user
async function logout() {
    try {
        await logoutUser();
        showNotification('Logged out successfully');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        // Even if API logout fails, clear local storage
        localStorage.removeItem('crispyUser');
        showNotification('Logged out successfully');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// ============================================
// SOCIAL AUTHENTICATION
// ============================================

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = '123456789-abcdef.apps.googleusercontent.com'; // Replace with actual Google Client ID
const GOOGLE_REDIRECT_URI = window.location.origin;

// Facebook OAuth Configuration
const FACEBOOK_APP_ID = '9876543210987654321'; // Replace with actual Facebook App ID
const FACEBOOK_API_VERSION = 'v18.0';

// Initialize Google OAuth
function initGoogleAuth() {
    // Initialize when gapi is available
    if (typeof gapi !== 'undefined') {
        gapi.load('auth2', function() {
            gapi.auth2.init({
                client_id: GOOGLE_CLIENT_ID,
                scope: 'email profile',
                ux_mode: 'popup'
            });
        });
    }
}

// Simplified Google Sign In using OAuth 2.0 flow
async function signInWithGoogle() {
    try {
        showNotification('Connecting to Google...');
        
        // Use OAuth 2.0 flow with popup
        const authUrl = `https://accounts.google.com/oauth/authorize?` +
            `client_id=${GOOGLE_CLIENT_ID}&` +
            `redirect_uri=${encodeURIComponent(window.location.origin)}&` +
            `response_type=code&` +
            `scope=email profile&` +
            `access_type=offline`;
        
        const popup = window.open(authUrl, 'google_auth', 'width=500,height=600');
        
        return new Promise((resolve, reject) => {
            const checkPopup = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkPopup);
                    reject(new Error('Authentication cancelled'));
                }
            }, 1000);
            
            // Listen for messages from popup
            const messageHandler = (event) => {
                if (event.source === popup && event.data.type === 'google_auth_success') {
                    clearInterval(checkPopup);
                    window.removeEventListener('message', messageHandler);
                    popup.close();
                    
                    // Send auth code to backend
                    handleGoogleAuthCode(event.data.code);
                }
            };
            
            window.addEventListener('message', messageHandler);
        });
    } catch (error) {
        console.error('Google auth error:', error);
        showError('Google authentication failed. Please try again.');
    }
}

// Handle Google OAuth code from popup
async function handleGoogleAuthCode(code) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/google/callback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ code: code })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            localStorage.setItem('crispyUser', JSON.stringify({
                ...data.data.user,
                token: data.data.token,
                loggedIn: true
            }));
            
            showNotification('Successfully logged in with Google!');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            throw new Error(data.message || 'Google authentication failed');
        }
    } catch (error) {
        console.error('Google auth error:', error);
        showError('Google authentication failed. Please try again.');
    }
}

// Facebook Sign In
async function signInWithFacebook() {
    try {
        showNotification('Connecting to Facebook...');
        
        if (typeof FB !== 'undefined') {
            FB.login(function(response) {
                if (response.authResponse) {
                    FB.api('/me', { fields: 'name,email,picture' }, async (profile) => {
                        await handleSocialAuth('facebook', {
                            id: profile.id,
                            name: profile.name,
                            email: profile.email,
                            avatar: profile.picture?.data?.url,
                            token: response.authResponse.accessToken
                        });
                    });
                } else {
                    showError('Facebook authentication cancelled');
                }
            }, { scope: 'email,public_profile' });
        } else {
            // Fallback to popup method
            const popup = window.open(
                `https://www.facebook.com/${FACEBOOK_API_VERSION}/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(window.location.origin)}&response_type=token&scope=email,public_profile`,
                'facebook_auth',
                'width=600,height=600'
            );
            
            const checkPopup = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkPopup);
                    showError('Facebook authentication cancelled');
                }
            }, 1000);
        }
    } catch (error) {
        console.error('Facebook auth error:', error);
        showError('Facebook authentication failed. Please try again.');
    }
}

// Handle Social Authentication Response
async function handleSocialAuth(provider, userData) {
    try {
        showNotification(`Creating account with ${provider}...`);
        
        const response = await fetch(`${API_BASE_URL}/auth/${provider}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: userData.name,
                email: userData.email,
                provider: provider,
                provider_id: userData.id,
                avatar: userData.avatar,
                token: userData.token
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Store user data and token
            localStorage.setItem('crispyUser', JSON.stringify({
                ...data.data.user,
                token: data.data.token,
                loggedIn: true
            }));
            
            showNotification(`Successfully logged in with ${provider}!`);
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            throw new Error(data.message || `${provider} authentication failed`);
        }
    } catch (error) {
        console.error('Social auth error:', error);
        showError(`${provider} authentication failed. Please try again.`);
    }
}

// Load Google OAuth SDK
function loadGoogleSDK() {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/platform.js';
    script.onload = initGoogleAuth;
    document.head.appendChild(script);
}

// Load Facebook SDK
function loadFacebookSDK() {
    window.fbAsyncInit = function() {
        FB.init({
            appId: FACEBOOK_APP_ID,
            cookie: true,
            xfbml: true,
            version: FACEBOOK_API_VERSION
        });
    };
    
    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = `https://connect.facebook.net/en_US/sdk.js`;
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
}

// ============================================
// API INTEGRATION
// ============================================

// Load products from API
async function loadProductsFromAPI() {
    if (!window.location.pathname.includes('products.html')) return;
    
    try {
        const response = await getProducts();
        if (response.success && response.data.products) {
            renderProducts(response.data.products);
        }
    } catch (error) {
        console.error('Failed to load products:', error);
        // Fallback to static products if API fails
        showNotification('Using offline mode - products loaded from cache');
    }
}

// Render products from API
function renderProducts(products) {
    const productsContainer = document.querySelector('.products-section .row');
    if (!productsContainer) return;

    let productsHTML = '';
    products.forEach(product => {
        const badge = product.badge ? `<span class="product-badge ${product.badge}">${product.badge.charAt(0).toUpperCase() + product.badge.slice(1)}</span>` : '';
        const originalPrice = product.original_price ? `<span class="original-price">$${product.original_price}</span>` : '';
        const stars = generateStarRating(product.rating);
        
        productsHTML += `
            <div class="col-lg-3 col-md-6 mb-4">
                <div class="product-card">
                    <div class="product-image">
                        <i class="fa fa-image"></i>
                        ${badge}
                    </div>
                    <div class="product-info">
                        <h5 class="product-name">${product.name}</h5>
                        <p class="product-description">${product.description}</p>
                        <div class="product-rating">
                            ${stars}
                            <span class="rating-count">(${product.review_count} reviews)</span>
                        </div>
                        <div class="product-price mb-3">
                            ${originalPrice}
                            <span class="price">$${product.price}</span>
                        </div>
                        <button class="btn btn-product w-100" onclick="addToCartFromAPI(${product.id}, '${product.name}', ${product.price})">
                            <i class="fa fa-shopping-cart"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    productsContainer.innerHTML = productsHTML;
    
    // Re-initialize cart functionality for new buttons
    initializeCart();
}

// Generate star rating HTML
function generateStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fa fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fa fa-star-half-o"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="fa fa-star-o"></i>';
    }
    
    return stars;
}

// Add to cart from API product
function addToCartFromAPI(productId, productName, productPrice) {
    const product = {
        id: productId,
        name: productName,
        price: productPrice,
        quantity: 1
    };

    // Check if product already exists in cart
    const existingProduct = cart.find(item => item.id === productId);
    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push(product);
    }

    // Save to localStorage
    localStorage.setItem('crispyCart', JSON.stringify(cart));
    
    // Show notification with animation
    showNotification(`${productName} added to cart!`);
    updateCartDisplay();
    
    // Add ripple effect
    if (event && event.target) {
        addRippleEffect(event.target);
    }
}

// ============================================
// CART PAGE FUNCTIONS
// ============================================

// Render cart items on cart page
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart text-center py-5">
                <i class="fa fa-shopping-cart fa-3x mb-3"></i>
                <h4>Your cart is empty</h4>
                <p class="text-muted">Looks like you haven't added any delicious treats yet!</p>
                <a href="products.html" class="btn btn-primary btn-lg mt-3">
                    <i class="fa fa-shopping-basket"></i> Start Shopping
                </a>
            </div>
        `;
        return;
    }

    let cartHTML = '';
    cart.forEach(item => {
        const subtotal = (item.price * item.quantity).toFixed(2);
        cartHTML += `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <i class="fa fa-image"></i>
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="decreaseQuantity(${item.id})">
                            <i class="fa fa-minus"></i>
                        </button>
                        <input type="number" class="quantity-input" value="${item.quantity}" 
                               onchange="updateQuantityFromInput(${item.id}, this.value)" min="1">
                        <button class="quantity-btn" onclick="increaseQuantity(${item.id})">
                            <i class="fa fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="cart-item-subtotal">
                    <div class="cart-item-subtotal-price">$${subtotal}</div>
                    <button class="remove-item" onclick="removeFromCart(${item.id})">
                        <i class="fa fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `;
    });

    cartItemsContainer.innerHTML = cartHTML;
}

// Update cart summary
function updateCartSummary() {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal >= 50 ? 0 : 5.99;
    const total = subtotal + shipping;

    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingElement) shippingElement.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
    if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;
}

// Increase quantity
function increaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity++;
        localStorage.setItem('crispyCart', JSON.stringify(cart));
        updateCartDisplay();
    }
}

// Decrease quantity
function decreaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item && item.quantity > 1) {
        item.quantity--;
        localStorage.setItem('crispyCart', JSON.stringify(cart));
        updateCartDisplay();
    }
}

// Update quantity from input
function updateQuantityFromInput(productId, newQuantity) {
    const quantity = parseInt(newQuantity);
    if (quantity > 0) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            localStorage.setItem('crispyCart', JSON.stringify(cart));
            updateCartDisplay();
        }
    }
}

// Initialize cart page
function initializeCartPage() {
    if (window.location.pathname.includes('cart.html')) {
        renderCartItems();
        updateCartSummary();
        
        // Initialize promo code
        const promoBtn = document.querySelector('.promo-btn');
        if (promoBtn) {
            promoBtn.addEventListener('click', function() {
                const promoInput = document.querySelector('.promo-input');
                if (promoInput && promoInput.value.trim()) {
                    showNotification('Promo code applied successfully!');
                    promoInput.value = '';
                } else {
                    showError('Please enter a promo code');
                }
            });
        }

        // Initialize checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', async function() {
                if (cart.length > 0) {
                    await processCheckout();
                }
            });
        }
    }
}

// Initialize wishlist page
function initializeWishlistPage() {
    if (window.location.pathname.includes('wishlist.html')) {
        renderWishlistItems();
        updateWishlistSummary();
        
        // Initialize clear wishlist button
        const clearWishlistBtn = document.querySelector('.btn-outline-secondary');
        if (clearWishlistBtn) {
            clearWishlistBtn.addEventListener('click', function() {
                clearWishlist();
            });
        }

        // Initialize add all to cart button
        const addAllBtn = document.getElementById('add-all-to-cart-btn');
        if (addAllBtn) {
            addAllBtn.addEventListener('click', function() {
                addAllWishlistToCart();
            });
        }
    }
}

// Clear cart function
function clearCart() {
    cart = [];
    localStorage.setItem('crispyCart', JSON.stringify(cart));
    updateCartDisplay();
    showNotification('Cart cleared successfully');
}

// Render wishlist items on wishlist page
function renderWishlistItems() {
    const wishlistItemsContainer = document.getElementById('wishlist-items');
    if (!wishlistItemsContainer) return;

    if (wishlist.length === 0) {
        wishlistItemsContainer.innerHTML = `
            <div class="empty-wishlist text-center py-5">
                <i class="fa fa-heart fa-3x mb-3"></i>
                <h4>Your wishlist is empty</h4>
                <p class="text-muted">Start adding your favorite crispy treats to your wishlist!</p>
                <a href="products.html" class="btn btn-primary btn-lg mt-3">
                    <i class="fa fa-shopping-basket"></i> Browse Products
                </a>
            </div>
        `;
        return;
    }

    let wishlistHTML = '';
    wishlist.forEach(item => {
        wishlistHTML += `
            <div class="wishlist-item" data-id="${item.id}">
                <div class="wishlist-item-image">
                    <i class="fa fa-image"></i>
                </div>
                <div class="wishlist-item-details">
                    <div class="wishlist-item-name">${item.name}</div>
                    <div class="wishlist-item-price">$${item.price}</div>
                    <div class="wishlist-item-actions">
                        <button class="btn btn-outline-primary btn-sm" onclick="addToCartFromWishlist(${item.id})">
                            <i class="fa fa-shopping-cart"></i> Add to Cart
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="removeFromWishlist(${item.id})">
                            <i class="fa fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    wishlistItemsContainer.innerHTML = wishlistHTML;
}

// Update wishlist summary
function updateWishlistSummary() {
    const totalItems = document.getElementById('wishlist-total-items');
    const totalValue = document.getElementById('wishlist-total-value');
    const addAllBtn = document.getElementById('add-all-to-cart-btn');
    
    if (totalItems) totalItems.textContent = wishlist.length;
    if (totalValue) totalValue.textContent = '$' + wishlist.reduce((total, item) => total + item.price, 0).toFixed(2);
    
    if (addAllBtn) addAllBtn.disabled = wishlist.length === 0;
}

// Add item from wishlist to cart
function addToCartFromWishlist(itemId) {
    const wishlistItem = wishlist.find(item => item.id === itemId);
    if (wishlistItem) {
        // Add to cart
        const existingItem = cart.find(item => item.id === itemId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: wishlistItem.id,
                name: wishlistItem.name,
                price: wishlistItem.price,
                quantity: 1
            });
        }
        
        // Remove from wishlist
        wishlist = wishlist.filter(item => item.id !== itemId);
        localStorage.setItem('crispyWishlist', JSON.stringify(wishlist));
        
        // Update displays
        updateCartDisplay();
        if (window.location.pathname.includes('wishlist.html')) {
            renderWishlistItems();
            updateWishlistSummary();
        }
        
        showNotification(`${wishlistItem.name} added to cart!`);
    }
}

// Remove from wishlist
function removeFromWishlist(itemId) {
    wishlist = wishlist.filter(item => item.id !== itemId);
    localStorage.setItem('crispyWishlist', JSON.stringify(wishlist));
    
    // Update displays
    if (window.location.pathname.includes('wishlist.html')) {
        renderWishlistItems();
        updateWishlistSummary();
    }
    
    showNotification('Item removed from wishlist');
}

// Clear wishlist
function clearWishlist() {
    wishlist = [];
    localStorage.setItem('crispyWishlist', JSON.stringify(wishlist));
    
    if (window.location.pathname.includes('wishlist.html')) {
        renderWishlistItems();
        updateWishlistSummary();
    }
    
    showNotification('Wishlist cleared successfully');
}

// Process checkout with backend API
async function processCheckout() {
    if (!isAuthenticated()) {
        showNotification('Please login to continue with checkout');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    try {
        showNotification('Processing your order...');
        
        const orderItems = cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity
        }));

        const orderData = {
            items: orderItems,
            shipping_address: '123 Default Address, Default City, USA', // You can make this dynamic
            notes: 'Order from web frontend'
        };

        const response = await createOrder(orderData);
        
        if (response.success) {
            // Clear cart after successful order
            cart = [];
            localStorage.setItem('crispyCart', JSON.stringify(cart));
            updateCartDisplay();
            
            showNotification('Order placed successfully! Order #' + response.data.order.order_number);
            
            // Redirect to order confirmation or orders page
            setTimeout(() => {
                window.location.href = 'index.html'; // Change to order confirmation page when available
            }, 2000);
        }
    } catch (error) {
        handleApiError(error, 'Failed to place order. Please try again.');
    }
}

// ============================================
// EXPORT FUNCTIONS FOR GLOBAL ACCESS
// ============================================

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.updateQuantityFromInput = updateQuantityFromInput;
window.updateAuthState = updateAuthState;
window.showUserProfile = showUserProfile;
window.logout = logout;
window.signInWithGoogle = signInWithGoogle;
window.signInWithFacebook = signInWithFacebook;
window.handleSocialAuth = handleSocialAuth;
window.loadGoogleSDK = loadGoogleSDK;
window.loadFacebookSDK = loadFacebookSDK;
