// Top-level error handler
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

try {
    require('dotenv').config();
} catch (error) {
    console.error('Error loading dotenv:', error);
}

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const https = require('https');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Stripe (only if key is provided)
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
    try {
        stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    } catch (error) {
        console.error('Error initializing Stripe:', error);
    }
}

// Sales API Configuration
const SALES_API_URL = process.env.SALES_API_URL || 'http://localhost:3020';
const SALES_API_KEY = process.env.SALES_API_KEY;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS, images)
// In Vercel, files are in the same directory as server.js
const staticPath = __dirname;
app.use(express.static(staticPath, {
    extensions: ['html', 'css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico'],
    index: false
}));

// Explicit routes for static files (for Vercel)
const fs = require('fs');

app.get('/styles.css', (req, res) => {
    const cssPath = path.join(__dirname, 'styles.css');
    console.log('Serving styles.css from:', cssPath);
    console.log('File exists:', fs.existsSync(cssPath));
    res.type('text/css');
    res.sendFile(cssPath, (err) => {
        if (err) {
            console.error('Error serving styles.css:', err);
            console.error('__dirname:', __dirname);
            console.error('Files in __dirname:', fs.readdirSync(__dirname));
            res.status(404).send('/* CSS file not found */');
        }
    });
});

app.get('/script.js', (req, res) => {
    const jsPath = path.join(__dirname, 'script.js');
    console.log('Serving script.js from:', jsPath);
    console.log('File exists:', fs.existsSync(jsPath));
    res.type('application/javascript');
    res.sendFile(jsPath, (err) => {
        if (err) {
            console.error('Error serving script.js:', err);
            console.error('__dirname:', __dirname);
            console.error('Files in __dirname:', fs.readdirSync(__dirname));
            res.status(404).send('// JS file not found');
        }
    });
});

// Serve images
app.use('/images', express.static(path.join(__dirname, 'images')));

// Debug route to check file structure
app.get('/debug/files', (req, res) => {
    try {
        const files = fs.readdirSync(__dirname);
        res.json({
            __dirname: __dirname,
            files: files,
            stylesExists: fs.existsSync(path.join(__dirname, 'styles.css')),
            scriptExists: fs.existsSync(path.join(__dirname, 'script.js')),
            imagesExists: fs.existsSync(path.join(__dirname, 'images'))
        });
    } catch (error) {
        res.json({ error: error.message });
    }
});

// Route for home page
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Error serving index.html:', err);
            res.status(500).send('Error loading page');
        }
    });
});

// Helper function to send order to sales API
async function sendOrderToSales(orderData) {
    // Only send if API key is configured
    if (!SALES_API_KEY) {
        console.log('Sales API key not configured. Skipping order sync to sales website.');
        return { success: false, error: 'Sales API not configured' };
    }

    try {
        // Map order status from astryxnodes format to sales format
        const statusMap = {
            'pending_payment': 'Pending',
            'completed': 'Paid'
        };
        
        // Map payment method names
        const paymentMethodMap = {
            'stripe': 'Stripe',
            'gcash': 'GCash',
            'maya': 'Maya',
            'bank': 'Bank Transfer'
        };

        // Get current date in YYYY-MM-DD format
        const today = new Date();
        const dateBought = today.toISOString().split('T')[0];
        
        // Calculate expiry date (default to 1 month)
        const expiryDate = new Date(today);
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        const dateExpiry = expiryDate.toISOString().split('T')[0];

        // Prepare sales data
        const salesData = {
            date_bought: dateBought,
            duration: '1 month', // Default duration
            date_expiry: dateExpiry,
            customer_name: orderData.customer.name,
            plan: orderData.plan,
            cpu: orderData.specs.cpu,
            ram: orderData.specs.ram,
            disk: orderData.specs.disk,
            amount: parseFloat(orderData.price),
            payment_method: paymentMethodMap[orderData.paymentMethod] || orderData.paymentMethod,
            status: statusMap[orderData.status] || 'Pending'
        };

        // Make HTTP request to sales API
        const url = new URL(`${SALES_API_URL}/api/sales/auto`);
        const requestModule = url.protocol === 'https:' ? https : http;
        
        const postData = JSON.stringify(salesData);
        
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'X-API-Key': SALES_API_KEY
            }
        };

        return new Promise((resolve, reject) => {
            const req = requestModule.request(url, options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            const response = JSON.parse(data);
                            console.log('Order successfully sent to sales API:', response);
                            resolve({ success: true, response });
                        } catch (e) {
                            console.error('Error parsing sales API response:', e);
                            resolve({ success: false, error: 'Invalid response from sales API' });
                        }
                    } else {
                        console.error('Sales API returned error status:', res.statusCode, data);
                        resolve({ success: false, error: `Sales API error: ${res.statusCode}` });
                    }
                });
            });
            
            req.on('error', (error) => {
                console.error('Error sending order to sales API:', error);
                resolve({ success: false, error: error.message });
            });
            
            req.write(postData);
            req.end();
        });
    } catch (error) {
        console.error('Error preparing order for sales API:', error);
        return { success: false, error: error.message };
    }
}

// Payment Configuration (Update these with your actual payment details)
const PAYMENT_CONFIG = {
    gcash: {
        number: process.env.GCASH_NUMBER || '09123456789', // Replace with your GCash number
    },
    maya: {
        number: process.env.MAYA_NUMBER || '09123456789', // Replace with your Maya number
    },
    bank: {
        name: process.env.BANK_NAME || 'Bank Name', // Replace with your bank name
        accountName: process.env.BANK_ACCOUNT_NAME || 'Account Name', // Replace with account name
        accountNumber: process.env.BANK_ACCOUNT_NUMBER || '1234567890', // Replace with account number
    }
};

// API: Create Stripe Payment Intent
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        if (!stripe) {
            return res.status(500).json({ error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.' });
        }
        
        const { amount, currency, customer, order } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
        
        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount), // Amount in cents
            currency: currency || 'php',
            metadata: {
                plan: order.plan,
                customer_name: customer.name,
                customer_email: customer.email,
            },
            description: `Minecraft Server - ${order.plan}`,
        });
        
        res.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('Stripe error:', error);
        res.status(500).json({ error: error.message || 'Stripe payment intent creation failed' });
    }
});

// API: Create Order (for manual payment methods)
app.post('/api/create-order', async (req, res) => {
    try {
        const { name, email, phone, discord, paymentMethod, order, orderNumber, status } = req.body;
        
        // Validate required fields
        if (!name || !email || !phone || !paymentMethod || !order) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Here you would typically save the order to a database
        // For now, we'll just log it and return success
        const orderData = {
            orderNumber,
            customer: {
                name,
                email,
                phone,
                discord: discord || null,
            },
            plan: order.plan,
            price: order.price,
            specs: {
                ram: order.ram,
                cpu: order.cpu,
                disk: order.disk,
            },
            paymentMethod,
            status: status || 'pending_payment',
            createdAt: new Date().toISOString(),
        };
        
        // TODO: Save to database
        console.log('New order created:', orderData);
        
        // Send order to sales API
        await sendOrderToSales(orderData);
        
        // TODO: Send confirmation email to customer
        // TODO: Send notification to admin
        
        res.json({
            success: true,
            orderNumber,
            order: orderData,
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// API: Complete Order (for successful Stripe payments)
app.post('/api/complete-order', async (req, res) => {
    try {
        const { name, email, phone, discord, paymentMethod, order, orderNumber, paymentId, status } = req.body;
        
        const orderData = {
            orderNumber,
            customer: {
                name,
                email,
                phone,
                discord: discord || null,
            },
            plan: order.plan,
            price: order.price,
            specs: {
                ram: order.ram,
                cpu: order.cpu,
                disk: order.disk,
            },
            paymentMethod: paymentMethod || 'stripe',
            paymentId,
            status: status || 'completed',
            createdAt: new Date().toISOString(),
        };
        
        // TODO: Save to database
        console.log('Order completed:', orderData);
        
        // Send order to sales API
        await sendOrderToSales(orderData);
        
        // TODO: Send confirmation email
        // TODO: Provision server
        // TODO: Send server details to customer
        
        res.json({
            success: true,
            orderNumber,
            order: orderData,
        });
    } catch (error) {
        console.error('Order completion error:', error);
        res.status(500).json({ error: error.message });
    }
});

// API: Get Payment Configuration (for frontend)
app.get('/api/payment-config', (req, res) => {
    res.json(PAYMENT_CONFIG);
});

// API: Get Stripe Publishable Key (for frontend)
app.get('/api/stripe-key', (req, res) => {
    res.json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || ''
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.VERCEL ? 'vercel' : 'local'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
    });
});

// Handle 404
app.use((req, res) => {
    res.status(404).send('404 - Page Not Found');
});

// Start server (only if not in serverless environment)
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`
    ╔══════════════════════════════════════════════╗
    ║                                              ║
    ║        🌌 AstryxNodes Server Running 🌌      ║
    ║                                              ║
    ║     Server: http://localhost:${PORT}          ║
    ║     Status: ✓ Online                         ║
    ║     Theme:  Nebula UI                        ║
    ║                                              ║
    ╚══════════════════════════════════════════════╝
    `);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM signal received: closing HTTP server');
        process.exit(0);
    });
}

// Export for Vercel serverless
module.exports = app;
