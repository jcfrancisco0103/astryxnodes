# Quick Start Guide - Payment Setup

## 🚀 Quick Setup (5 minutes)

### Step 1: Create `.env` file
```bash
cp .env.example .env
```

### Step 2: Add Your Payment Details
Edit `.env` and add:
- Your Stripe keys (get from https://dashboard.stripe.com/apikeys)
- Your GCash number
- Your Maya number  
- Your bank account details

### Step 3: Start the Server
```bash
npm start
```

### Step 4: Test It!
1. Open http://localhost:5000
2. Click "Buy Now" on any plan
3. Fill out the form
4. Select a payment method
5. Complete the purchase!

## 📋 What's Included

✅ **Buy Now buttons** on all pricing plans  
✅ **Checkout modal** with customer information form  
✅ **4 Payment methods:**
   - GCash
   - Maya (PayMaya)
   - Bank Transfer
   - Stripe (Credit/Debit Cards)

✅ **Backend API endpoints** for payment processing  
✅ **Order management** (currently logs to console)  
✅ **Responsive design** that works on mobile

## 🔧 Next Steps

1. **Set up a database** to store orders (see PAYMENT_SETUP.md)
2. **Add email notifications** for new orders
3. **Create admin panel** to manage orders
4. **Set up SSL/HTTPS** for production
5. **Switch to Stripe live keys** when ready

## 📚 Full Documentation

See `PAYMENT_SETUP.md` for detailed setup instructions and production deployment guide.
