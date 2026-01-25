// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Modal functionality
const policyLinks = document.querySelectorAll('.policy-link');
const modals = document.querySelectorAll('.modal');
const closeButtons = document.querySelectorAll('.modal-close');

policyLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const modalId = link.getAttribute('data-modal');
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    });
});

closeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const modal = btn.closest('.modal');
        if (modal) {
            modal.classList.remove('active');
        }
    });
});

modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(10, 1, 24, 0.95)';
    } else {
        navbar.style.background = 'rgba(10, 1, 24, 0.8)';
    }
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .pricing-card, .contact-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Add glow effect to buttons on hover
document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
        this.style.boxShadow = '0 0 30px rgba(139, 92, 246, 0.8), 0 0 60px rgba(139, 92, 246, 0.4)';
    });
    
    btn.addEventListener('mouseleave', function() {
        this.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.4)';
    });
});

// Pricing card hover effect
document.querySelectorAll('.pricing-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.boxShadow = '0 0 40px rgba(139, 92, 246, 0.6), 0 0 80px rgba(236, 72, 153, 0.3)';
    });
    
    card.addEventListener('mouseleave', function() {
        if (this.classList.contains('featured')) {
            this.style.boxShadow = '0 0 40px rgba(139, 92, 246, 0.3)';
        } else {
            this.style.boxShadow = '';
        }
    });
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
    }
});

// FAQ Accordion functionality
document.querySelectorAll('.faq-button').forEach(button => {
    button.addEventListener('click', () => {
        const faqItem = button.closest('.faq-item');
        
        // Close all other FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            if (item !== faqItem) {
                item.classList.remove('active');
            }
        });
        
        // Toggle current FAQ item
        faqItem.classList.toggle('active');
    });
});

// Checkout Modal Functionality
let stripe = null;
let stripeElements = null;
let cardElement = null;
let currentOrder = null;
let paymentConfig = null;

// Initialize Stripe (will be set from server config)
let STRIPE_PUBLISHABLE_KEY = null;

// Fetch payment configuration from server
async function loadPaymentConfig() {
    try {
        // Load payment config
        const configResponse = await fetch('/api/payment-config');
        paymentConfig = await configResponse.json();
        
        // Update payment instruction fields
        if (paymentConfig.gcash) {
            document.getElementById('gcash-number').textContent = paymentConfig.gcash.number;
        }
        if (paymentConfig.maya) {
            document.getElementById('maya-number').textContent = paymentConfig.maya.number;
        }
        if (paymentConfig.bank) {
            document.getElementById('bank-name').textContent = paymentConfig.bank.name;
            document.getElementById('bank-account-name').textContent = paymentConfig.bank.accountName;
            document.getElementById('bank-account-number').textContent = paymentConfig.bank.accountNumber;
        }
        
        // Load Stripe publishable key
        const stripeResponse = await fetch('/api/stripe-key');
        const stripeData = await stripeResponse.json();
        STRIPE_PUBLISHABLE_KEY = stripeData.publishableKey;
        
        // Initialize Stripe if key is available
        if (STRIPE_PUBLISHABLE_KEY && typeof Stripe !== 'undefined') {
            stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
            stripeElements = stripe.elements();
        }
    } catch (error) {
        console.error('Failed to load payment config:', error);
    }
}

// Load payment config on page load
document.addEventListener('DOMContentLoaded', loadPaymentConfig);

// Buy Now button handlers
document.querySelectorAll('.btn-buy').forEach(btn => {
    btn.addEventListener('click', function() {
        const plan = this.getAttribute('data-plan');
        const price = this.getAttribute('data-price');
        const ram = this.getAttribute('data-ram');
        const cpu = this.getAttribute('data-cpu');
        const disk = this.getAttribute('data-disk');
        
        openCheckoutModal({
            plan,
            price,
            ram,
            cpu,
            disk
        });
    });
});

// Open checkout modal
function openCheckoutModal(orderData) {
    currentOrder = orderData;
    const modal = document.getElementById('checkoutModal');
    
    // Populate order summary
    document.getElementById('checkout-plan-name').textContent = orderData.plan;
    document.getElementById('checkout-ram').textContent = orderData.ram;
    document.getElementById('checkout-cpu').textContent = orderData.cpu;
    document.getElementById('checkout-disk').textContent = orderData.disk;
    document.getElementById('checkout-price').textContent = orderData.price;
    
    // Update payment instruction amounts
    document.getElementById('gcash-amount').textContent = orderData.price;
    document.getElementById('maya-amount').textContent = orderData.price;
    document.getElementById('bank-amount').textContent = orderData.price;
    
    // Reset form
    document.getElementById('checkout-form').reset();
    document.getElementById('payment-instructions').style.display = 'none';
    document.querySelectorAll('.payment-details').forEach(el => el.style.display = 'none');
    document.querySelectorAll('input[name="payment-method"]').forEach(radio => radio.checked = false);
    
    // Show modal
    modal.classList.add('active');
    
    // Initialize Stripe card element if Stripe is available
    if (stripe && stripeElements) {
        // Create or recreate card element
        if (cardElement) {
            cardElement.unmount();
        }
        cardElement = stripeElements.create('card');
        cardElement.mount('#stripe-card-element');
        
        // Handle card errors
        cardElement.on('change', ({error}) => {
            const displayError = document.getElementById('stripe-card-errors');
            if (error) {
                displayError.textContent = error.message;
            } else {
                displayError.textContent = '';
            }
        });
    } else if (STRIPE_PUBLISHABLE_KEY) {
        console.warn('Stripe not initialized. Make sure Stripe.js is loaded and publishable key is set.');
    }
}

// Close checkout modal
function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    modal.classList.remove('active');
    if (cardElement) {
        cardElement.unmount();
        cardElement = null;
    }
}

// Cancel checkout button
document.getElementById('cancel-checkout')?.addEventListener('click', closeCheckoutModal);

// Payment method selection handler
document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const method = this.value;
        const instructions = document.getElementById('payment-instructions');
        const allDetails = document.querySelectorAll('.payment-details');
        
        // Hide all payment details
        allDetails.forEach(el => el.style.display = 'none');
        
        // Show selected payment method instructions
        if (method === 'gcash') {
            document.getElementById('gcash-instructions').style.display = 'block';
            instructions.style.display = 'block';
        } else if (method === 'maya') {
            document.getElementById('maya-instructions').style.display = 'block';
            instructions.style.display = 'block';
        } else if (method === 'bank') {
            document.getElementById('bank-instructions').style.display = 'block';
            instructions.style.display = 'block';
        } else if (method === 'stripe') {
            document.getElementById('stripe-instructions').style.display = 'block';
            instructions.style.display = 'block';
        }
    });
});

// Form submission handler
document.getElementById('checkout-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submit-checkout');
    const loadingDiv = document.getElementById('checkout-loading');
    const form = this;
    
    // Get form data
    const formData = {
        name: document.getElementById('customer-name').value,
        email: document.getElementById('customer-email').value,
        phone: document.getElementById('customer-phone').value,
        discord: document.getElementById('customer-discord').value,
        paymentMethod: document.querySelector('input[name="payment-method"]:checked')?.value,
        order: currentOrder
    };
    
    // Validate
    if (!formData.paymentMethod) {
        showMessageModal('error', 'Payment Method Required', 'Please select a payment method to continue.');
        return;
    }
    
    // Show loading
    submitBtn.disabled = true;
    loadingDiv.style.display = 'block';
    
    try {
        if (formData.paymentMethod === 'stripe') {
            // Handle Stripe payment
            await handleStripePayment(formData);
        } else {
            // Handle manual payment methods (GCash, Maya, Bank Transfer)
            await handleManualPayment(formData);
        }
    } catch (error) {
        console.error('Payment error:', error);
        showMessageModal('error', 'Payment Error', error.message || 'An error occurred. Please try again or contact support.');
        submitBtn.disabled = false;
        loadingDiv.style.display = 'none';
    }
});

// Handle Stripe payment
async function handleStripePayment(formData) {
    if (!stripe || !cardElement) {
        throw new Error('Stripe not initialized');
    }
    
    // Create payment intent on server
    const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount: parseFloat(formData.order.price) * 100, // Convert to cents
            currency: 'php',
            customer: {
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            },
            order: formData.order
        })
    });
    
    const {clientSecret, error} = await response.json();
    
    if (error) {
        throw new Error(error);
    }
    
    // Confirm payment with Stripe
    const {error: stripeError, paymentIntent} = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
            card: cardElement,
            billing_details: {
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            }
        }
    });
    
    if (stripeError) {
        throw new Error(stripeError.message);
    }
    
    if (paymentIntent.status === 'succeeded') {
        // Payment successful
        const orderResult = await completeOrder(formData, paymentIntent.id);
        const orderNumber = orderResult.orderNumber || 'N/A';
        
        closeCheckoutModal();
        
        const successDetails = `
            <div class="order-info">
                <div class="info-row">
                    <span class="info-label">Order Number:</span>
                    <span class="info-value">${orderNumber}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Plan:</span>
                    <span class="info-value">${formData.order.plan}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Amount:</span>
                    <span class="info-value">₱${formData.order.price}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Payment ID:</span>
                    <span class="info-value">${paymentIntent.id}</span>
                </div>
            </div>
            <p class="message-note">Your order has been processed successfully! Please message us on Discord or on our Facebook page to confirm your payment.</p>
            <div class="social-links">
                <p>Contact us here:</p>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <a href="https://discord.gg/YXeznZmaNe" target="_blank" rel="noopener noreferrer" class="social-link discord">
                        <span>💬</span>
                        <span>AstryxNodes</span>
                    </a>
                    <a href="https://www.facebook.com/people/AstryxNodes/61586214250034/" target="_blank" rel="noopener noreferrer" class="social-link facebook">
                        <span>📘</span>
                        <span>AstryxNodes</span>
                    </a>
                </div>
            </div>
        `;
        
        showMessageModal('success', 'Payment Successful!', 'Your order has been processed successfully.', successDetails);
    }
}

// Handle manual payment methods
async function handleManualPayment(formData) {
    // Generate order number
    const orderNumber = 'AST-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    // Send order to server
    const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...formData,
            orderNumber,
            status: 'pending_payment'
        })
    });
    
    const result = await response.json();
    
    if (result.error) {
        throw new Error(result.error);
    }
    
    // Show success message with payment instructions
    const paymentMethod = formData.paymentMethod;
    let paymentDetails = '';
    let paymentMethodName = '';
    
    if (paymentMethod === 'gcash') {
        paymentMethodName = 'GCash';
        paymentDetails = `
            <div class="payment-info">
                <p><strong>GCash Number:</strong> ${paymentConfig?.gcash?.number || 'N/A'}</p>
                <p><strong>Amount to Send:</strong> ₱${formData.order.price}</p>
            </div>
        `;
    } else if (paymentMethod === 'maya') {
        paymentMethodName = 'Maya';
        paymentDetails = `
            <div class="payment-info">
                <p><strong>Maya Number:</strong> ${paymentConfig?.maya?.number || 'N/A'}</p>
                <p><strong>Amount to Send:</strong> ₱${formData.order.price}</p>
            </div>
        `;
    } else if (paymentMethod === 'bank') {
        paymentMethodName = 'Bank Transfer';
        paymentDetails = `
            <div class="payment-info">
                <p><strong>Bank:</strong> ${paymentConfig?.bank?.name || 'N/A'}</p>
                <p><strong>Account Name:</strong> ${paymentConfig?.bank?.accountName || 'N/A'}</p>
                <p><strong>Account Number:</strong> ${paymentConfig?.bank?.accountNumber || 'N/A'}</p>
                <p><strong>Amount to Transfer:</strong> ₱${formData.order.price}</p>
            </div>
        `;
    }
    
    closeCheckoutModal();
    
    const successDetails = `
        <div class="order-info">
            <div class="info-row">
                <span class="info-label">Order Number:</span>
                <span class="info-value">${orderNumber}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Plan:</span>
                <span class="info-value">${formData.order.plan}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Amount:</span>
                <span class="info-value">₱${formData.order.price}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Payment Method:</span>
                <span class="info-value">${paymentMethodName}</span>
            </div>
        </div>
        ${paymentDetails}
        <div class="payment-instructions-box">
            <p class="instructions-title">📋 Payment Instructions:</p>
            <p class="instructions-text">Please send the exact amount (₱${formData.order.price}) using ${paymentMethodName}.</p>
            <p class="instructions-text"><strong>Important:</strong> Include your order number <strong>${orderNumber}</strong> in the payment reference/message.</p>
            <p class="instructions-text">Please message us on Discord or on our Facebook page to confirm your payment.</p>
        </div>
        <div class="social-links" style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(139, 92, 246, 0.3); text-align: center;">
            <p style="margin-bottom: 1rem; color: var(--text-secondary);">Contact us here:</p>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <a href="https://discord.gg/YXeznZmaNe" target="_blank" rel="noopener noreferrer" class="social-link discord" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #5865F2, #7289DA); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; transition: all 0.3s ease;">
                    <span>💬</span>
                    <span>AstryxNodes</span>
                </a>
                <a href="https://www.facebook.com/people/AstryxNodes/61586214250034/" target="_blank" rel="noopener noreferrer" class="social-link facebook" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #1877F2, #42A5F5); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; transition: all 0.3s ease;">
                    <span>📘</span>
                    <span>AstryxNodes</span>
                </a>
            </div>
        </div>
    `;
    
    showMessageModal('success', 'Order Created Successfully!', 'Your order has been created. Please complete the payment using the instructions below.', successDetails);
}

// Complete order (for successful payments)
async function completeOrder(formData, paymentId) {
    const orderNumber = 'AST-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    const response = await fetch('/api/complete-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...formData,
            orderNumber,
            paymentId,
            status: 'completed'
        })
    });
    
    const result = await response.json();
    // Ensure orderNumber is returned
    return {
        ...result,
        orderNumber: result.order?.orderNumber || orderNumber
    };
}

// Message Modal Functions
function showMessageModal(type, title, message, details = null) {
    const modal = document.getElementById('messageModal');
    const icon = document.getElementById('message-icon');
    const titleEl = document.getElementById('message-title');
    const bodyEl = document.getElementById('message-body');
    
    // Set icon based on type
    if (type === 'success') {
        icon.innerHTML = '✅';
        icon.className = 'message-icon success';
    } else if (type === 'error') {
        icon.innerHTML = '❌';
        icon.className = 'message-icon error';
    } else {
        icon.innerHTML = 'ℹ️';
        icon.className = 'message-icon info';
    }
    
    titleEl.textContent = title;
    
    // Format message body
    if (details) {
        bodyEl.innerHTML = `<p class="message-text">${message}</p><div class="message-details">${details}</div>`;
    } else {
        bodyEl.innerHTML = `<p class="message-text">${message}</p>`;
    }
    
    // Show modal
    modal.classList.add('active');
    
    // Close on OK button click
    document.getElementById('message-ok-btn').onclick = () => {
        modal.classList.remove('active');
    };
    
    // Close on X button click
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.onclick = () => {
        modal.classList.remove('active');
    };
}

console.log('🌌 AstryxNodes - Nebula UI Loaded Successfully');

