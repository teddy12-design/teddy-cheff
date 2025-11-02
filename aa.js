// Cart Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Authentication check - redirect to login if not authenticated
function checkAuthentication() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentPage = window.location.pathname.split('/').pop() || window.location.href.split('/').pop() || 'index.html';
    
    // If user is not logged in and trying to access menu or payment pages
    if (!isLoggedIn && (currentPage.includes('index.html') || currentPage === '' || currentPage.includes('confirm.html'))) {
        if (currentPage !== 'login.html') {
            window.location.href = 'login.html';
            return false;
        }
    }
    
    // If user is logged in and trying to access login page, redirect to menu
    if (isLoggedIn && currentPage.includes('login.html')) {
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    if (!checkAuthentication()) {
        return;
    }
    
    if (document.querySelector('.add-to-cart')) {
        initializeCart();
        setupAddToCartButtons();
        setupCartIcon();
        updateCartDisplay();
    }
    
    if (document.getElementById('loginForm')) {
        setupLoginForm();
    }
    
    if (document.getElementById('paymentForm')) {
        setupPaymentForm();
        loadOrderSummary();
    }
});

// Initialize cart functionality
function initializeCart() {
    const cartIcon = document.getElementById('cartIcon');
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCart = document.getElementById('closeCart');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (cartIcon) {
        cartIcon.addEventListener('click', function() {
            cartSidebar.classList.add('open');
        });
    }
    
    if (closeCart) {
        closeCart.addEventListener('click', function() {
            cartSidebar.classList.remove('open');
        });
    }
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length > 0) {
                window.location.href = 'confirm.html';
            } else {
                alert('Your cart is empty!');
            }
        });
    }
}

// Setup add to cart buttons
function setupAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const name = this.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price'));
            
            addToCart(name, price);
            
            // Show cart sidebar when item is added
            const cartSidebar = document.getElementById('cartSidebar');
            if (cartSidebar) {
                cartSidebar.classList.add('open');
            }
        });
    });
}

// Add item to cart
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartDisplay();
}

// Remove item from cart
function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    saveCart();
    updateCartDisplay();
}

// Update item quantity
function updateQuantity(name, change) {
    const item = cart.find(item => item.name === name);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(name);
        } else {
            saveCart();
            updateCartDisplay();
        }
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Update cart display
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartCount = document.getElementById('cartCount');
    
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>${item.price} BIRR × ${item.quantity}</p>
                    </div>
                    <div class="cart-item-controls">
                        <button onclick="updateQuantity('${item.name}', -1)">−</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity('${item.name}', 1)">+</button>
                    </div>
                </div>
            `).join('');
        }
    }
    
    if (cartTotal) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `${total} BIRR`;
    }
    
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Setup cart icon
function setupCartIcon() {
    updateCartDisplay();
}

// Setup login form
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Simple validation (in real app, would check with server)
            if (email && password) {
                // Store user info and set authentication
                localStorage.setItem('userEmail', email);
                localStorage.setItem('isLoggedIn', 'true');
                alert('Login successful! Redirecting to menu...');
                window.location.href = 'index.html';
            } else {
                alert('Please fill in all fields');
            }
        });
    }
}

// Load order summary on confirmation page
function loadOrderSummary() {
    const orderItems = document.getElementById('orderItems');
    const subtotal = document.getElementById('subtotal');
    const finalTotal = document.getElementById('finalTotal');
    
    if (cart.length === 0) {
        // Redirect to home if cart is empty
        alert('Your cart is empty! Redirecting to home...');
        window.location.href = 'index.html';
        return;
    }
    
    if (orderItems) {
        orderItems.innerHTML = cart.map(item => `
            <div class="order-item">
                <div class="order-item-info">
                    <h4>${item.name}</h4>
                    <p>Quantity: ${item.quantity}</p>
                </div>
                <div class="order-item-price">${(item.price * item.quantity)} BIRR</div>
            </div>
        `).join('');
    }
    
    if (subtotal && finalTotal) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = 50;
        const finalTotalAmount = total + deliveryFee;
        
        subtotal.textContent = `${total} BIRR`;
        finalTotal.textContent = `${finalTotalAmount} BIRR`;
    }
}

// Setup payment form
function setupPaymentForm() {
    const paymentForm = document.getElementById('paymentForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    const telebirrFields = document.getElementById('telebirrFields');
    const bankFields = document.getElementById('bankFields');
    const cardFields = document.querySelector('.form-row');
    
    // Handle payment method selection
    paymentOptions.forEach(option => {
        option.addEventListener('change', function() {
            const selectedMethod = this.value;
            
            // Hide all fields first
            if (telebirrFields) telebirrFields.style.display = 'none';
            if (bankFields) bankFields.style.display = 'none';
            if (cardFields) cardFields.style.display = 'none';
            if (document.getElementById('cardName')) {
                document.getElementById('cardName').parentElement.style.display = 'none';
            }
            
            // Show relevant fields based on selection
            if (selectedMethod === 'telebirr') {
                if (telebirrFields) {
                    telebirrFields.style.display = 'block';
                    const phoneInput = document.getElementById('telebirrPhone');
                    if (phoneInput) phoneInput.required = true;
                }
            } else if (selectedMethod === 'cash') {
                // No additional fields needed for cash
            } else {
                // Bank transfer
                if (bankFields) {
                    bankFields.style.display = 'block';
                    const bankNameInput = document.getElementById('bankName');
                    const accountInput = document.getElementById('accountNumber');
                    if (bankNameInput) {
                        // Set bank name based on selection
                        const bankNames = {
                            'cbe': 'Commercial Bank of Ethiopia',
                            'awash': 'Awash Bank',
                            'abyssinia': 'Bank of Abyssinia',
                            'dashen': 'Dashen Bank',
                            'nib': 'NIB Bank'
                        };
                        bankNameInput.value = bankNames[selectedMethod] || '';
                    }
                    if (accountInput) accountInput.required = true;
                }
            }
        });
    });
    
    // Format Telebirr phone number
    const telebirrPhone = document.getElementById('telebirrPhone');
    if (telebirrPhone) {
        telebirrPhone.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 10);
        });
    }
    
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const address = document.getElementById('address').value;
            const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
            let paymentInfo = '';
            
            // Validate based on payment method
            if (!address) {
                alert('Please enter your delivery address');
                return;
            }
            
            if (paymentMethod === 'telebirr') {
                const phone = document.getElementById('telebirrPhone').value;
                if (!phone || phone.length !== 10) {
                    alert('Please enter a valid Telebirr phone number (10 digits)');
                    return;
                }
                paymentInfo = `Telebirr: ${phone}`;
            } else if (paymentMethod === 'cash') {
                paymentInfo = 'Cash on Delivery';
            } else {
                const accountNumber = document.getElementById('accountNumber').value;
                const bankName = document.getElementById('bankName').value;
                if (!accountNumber) {
                    alert('Please enter your account number');
                    return;
                }
                paymentInfo = `${bankName}: ${accountNumber}`;
            }
            
            // In a real application, you would send this to a payment processor
            // For now, we'll simulate a successful payment
            const confirmed = confirm(`Confirm your order?\n\nPayment Method: ${paymentInfo}\nDelivery Address: ${address}`);
            
            if (confirmed) {
                // Clear cart
                cart = [];
                saveCart();
                
                alert('Order confirmed! Your payment will be processed. You will receive a confirmation email shortly.');
                window.location.href = 'index.html';
            }
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            const confirmed = confirm('Are you sure you want to cancel your order?');
            
            if (confirmed) {
                // Clear cart
                cart = [];
                saveCart();
                
                alert('Order cancelled. Redirecting to menu...');
                window.location.href = 'index.html';
            }
        });
    }
}

// Logout functionality
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const confirmed = confirm('Are you sure you want to logout?');
            if (confirmed) {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userEmail');
                cart = [];
                saveCart();
                window.location.href = 'login.html';
            }
        });
    }
}

// Setup logout on pages that have it
document.addEventListener('DOMContentLoaded', function() {
    setupLogout();
});

// Make functions globally available
window.updateQuantity = updateQuantity;

const order_create = ()=>{
    const address = document.getElementById('address').value;
    if (address && address=== "Ethiopia"){
        alert('order accepted')
    }
}