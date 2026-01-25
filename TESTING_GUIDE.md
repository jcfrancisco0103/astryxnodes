# Testing Guide - Payment System

## 🚀 Quick Test Steps

### Step 1: Start the Server
```bash
npm start
```

You should see:
```
🌌 AstryxNodes Server Running 🌌
Server: http://localhost:5000
Status: ✓ Online
```

### Step 2: Open Your Website
Open your browser and go to:
```
http://localhost:5000
```

### Step 3: Test the Checkout Flow

1. **Scroll to Pricing Section**
   - You should see all 6 plans with "Buy Now" buttons

2. **Click "Buy Now" on Any Plan**
   - A checkout modal should open
   - You should see:
     - Order summary with plan details
     - Customer information form
     - Payment method selection

3. **Fill Out the Form**
   - Name: `Test User`
   - Email: `test@example.com`
   - Phone: `+63 912 345 6789`
   - Discord: `testuser#1234` (optional)

4. **Test Each Payment Method:**

   **A. GCash:**
   - Select "GCash"
   - You should see your GCash number: `09764473888`
   - Amount should match the plan price
   - Click "Complete Purchase"
   - You should see a success message with order number

   **B. Maya:**
   - Select "Maya (PayMaya)"
   - You should see your Maya number: `09568370169`
   - Amount should match the plan price
   - Click "Complete Purchase"
   - You should see a success message with order number

   **C. Bank Transfer:**
   - Select "Bank Transfer"
   - You should see:
     - Bank: `GoTyme`
     - Account Name: `Jan Christopher Reyes Francisco`
     - Account Number: `014369021940`
   - Amount should match the plan price
   - Click "Complete Purchase"
   - You should see a success message with order number

   **D. Stripe (Credit/Debit Card):**
   - Select "Credit/Debit Card (Stripe)"
   - A card input field should appear
   - Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)
   - Click "Complete Purchase"
   - Payment should process successfully
   - You should see a success message

### Step 4: Check Server Logs

After completing a purchase, check your terminal. You should see:
```
New order created: { orderNumber: 'AST-...', ... }
```

## ✅ What to Verify

### Frontend Checks:
- [ ] "Buy Now" buttons appear on all plans
- [ ] Checkout modal opens when clicking "Buy Now"
- [ ] Order summary shows correct plan details
- [ ] Payment method selection works
- [ ] Payment instructions show correct account numbers
- [ ] Stripe card input appears when selecting Stripe
- [ ] Form validation works (try submitting empty form)
- [ ] Success messages appear after purchase

### Backend Checks:
- [ ] Server starts without errors
- [ ] Orders are logged to console
- [ ] API endpoints respond correctly
- [ ] Stripe payment intent is created (check Stripe dashboard)

### Stripe Test Cards:

**Success:**
- Card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC

**Decline:**
- Card: `4000 0000 0000 0002`
- This will show a declined payment error

**3D Secure (requires authentication):**
- Card: `4000 0025 0000 3155`
- Will require additional authentication

## 🐛 Troubleshooting

### Issue: Checkout modal doesn't open
- **Check:** Browser console for JavaScript errors
- **Fix:** Make sure `script.js` is loaded correctly

### Issue: Stripe card input doesn't appear
- **Check:** Browser console for Stripe errors
- **Check:** Network tab - is `/api/stripe-key` returning the key?
- **Fix:** Verify `STRIPE_PUBLISHABLE_KEY` in `.env` starts with `pk_test_`

### Issue: Payment fails with Stripe
- **Check:** Server logs for error messages
- **Check:** Stripe Dashboard → Logs for API errors
- **Fix:** Verify `STRIPE_SECRET_KEY` in `.env` is correct

### Issue: Payment instructions show placeholder text
- **Check:** Server logs - is `/api/payment-config` being called?
- **Fix:** Verify payment details in `.env` are correct

### Issue: Form submission doesn't work
- **Check:** Browser console for errors
- **Check:** Network tab - are API calls being made?
- **Fix:** Make sure server is running and accessible

## 📊 Testing Checklist

Run through this checklist:

- [ ] Test all 6 plans (Pig, Sheep, Cow, Creeper, Zombie, Skeleton)
- [ ] Test GCash payment method
- [ ] Test Maya payment method
- [ ] Test Bank Transfer payment method
- [ ] Test Stripe with successful card
- [ ] Test Stripe with declined card
- [ ] Test form validation (empty fields)
- [ ] Test cancel button
- [ ] Test modal close (X button)
- [ ] Test on mobile/responsive view
- [ ] Check server logs for order creation
- [ ] Verify order numbers are unique

## 🎯 Expected Results

### Successful Manual Payment (GCash/Maya/Bank):
```
Alert: "Order created successfully!

Order Number: AST-1234567890-ABC123

Please send ₱85 to the GCash number provided above. Include order number: AST-1234567890-ABC123

You will receive a confirmation email once payment is verified."
```

### Successful Stripe Payment:
```
Alert: "Payment successful! Your order has been processed."
```

### Server Console Output:
```
New order created: {
  orderNumber: 'AST-1234567890-ABC123',
  customer: { name: 'Test User', email: 'test@example.com', ... },
  plan: 'Pig-Plan',
  price: '85',
  paymentMethod: 'gcash',
  status: 'pending_payment',
  ...
}
```

## 🔍 Advanced Testing

### Test API Endpoints Directly:

1. **Get Payment Config:**
   ```bash
   curl http://localhost:5000/api/payment-config
   ```

2. **Get Stripe Key:**
   ```bash
   curl http://localhost:5000/api/stripe-key
   ```

3. **Create Test Order:**
   ```bash
   curl -X POST http://localhost:5000/api/create-order \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "phone": "+63 912 345 6789",
       "paymentMethod": "gcash",
       "order": {
         "plan": "Pig-Plan",
         "price": "85",
         "ram": "2GB",
         "cpu": "100%",
         "disk": "5GB"
       }
     }'
   ```

## 📝 Notes

- All test payments are in **test mode** - no real money is charged
- Orders are currently logged to console - integrate a database for production
- Email notifications are not set up yet - add them for production
- Stripe test mode uses test cards - real cards won't work in test mode
