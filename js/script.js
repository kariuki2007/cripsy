// ============================================
// CRISPY CLUB - Main JavaScript File
// ============================================

// Shopping Cart Array
let cart = JSON.parse(localStorage.getItem('crispyCart')) || [];

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
});

// ============================================
// SCROLL ANIMATIONS
// ============================================

function initializeScrollAnimations() {
    const elements = document.querySelectorAll('.shipping-card, .special-card, .value-card, .team-card, .reason-card, .product-card, .story-card');
    
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
    const cartCount = cart.length;
    const cartBadge = document.querySelector('.cart-count');
    if (cartBadge) {
        cartBadge.textContent = cartCount;
        cartBadge.style.display = cartCount > 0 ? 'block' : 'none';
        cartBadge.classList.add('pulse');
        setTimeout(() => cartBadge.classList.remove('pulse'), 600);
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

function handleLoginSubmit(e) {
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

    localStorage.setItem('crispyUser', JSON.stringify({
        email: email,
        loggedIn: true
    }));

    showNotification('Login successful!');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

function handleRegisterSubmit(e) {
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

    localStorage.setItem('crispyUser', JSON.stringify({
        fullname: fullname,
        email: email,
        phone: phone,
        loggedIn: true
    }));

    showNotification('Registration successful!');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
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

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
