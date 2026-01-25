# How to Get Your Stripe Keys

## You have a Restricted Key - Here's what you need:

You provided a **Restricted API Key** (`rk_test_...`). This can work as your secret key, but you also need a **Publishable Key** for the frontend.

## Steps to Get Your Publishable Key:

### Option 1: Use Existing Publishable Key (Recommended)
If you already have a publishable key in your `.env` file, you can use that. The restricted key you provided will work as the secret key.

### Option 2: Get New Keys from Stripe Dashboard

1. **Go to Stripe Dashboard:**
   - Visit: https://dashboard.stripe.com/test/apikeys
   - Make sure you're in **Test mode** (toggle in top right)

2. **Find Your Publishable Key:**
   - Look for the key that starts with `pk_test_...`
   - This is safe to use in frontend code
   - Copy this key

3. **Update Your `.env` File:**
   ```env
   STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
   STRIPE_SECRET_KEY=rk_test_YOUR_RESTRICTED_KEY_HERE
   ```
   
   **⚠️ Important:** Never commit your actual API keys to GitHub! Always use placeholders in documentation files.

## About Restricted Keys

- ✅ **Can be used** as secret keys in your backend
- ✅ **More secure** - they have limited permissions
- ⚠️ **May have restrictions** - check your Stripe dashboard to see what permissions it has
- ⚠️ **Still need publishable key** - required for frontend Stripe.js integration

## Verify Your Keys Work

1. Start your server: `npm start`
2. Open the checkout modal
3. Select "Credit/Debit Card (Stripe)"
4. If the card input field appears, your publishable key is working!

## Troubleshooting

**If Stripe card element doesn't appear:**
- Check browser console for errors
- Verify publishable key starts with `pk_test_` or `pk_live_`
- Make sure Stripe.js is loaded (check Network tab)

**If payment fails:**
- Check server logs for errors
- Verify restricted key has "Payment Intents" permission
- Test with Stripe test card: `4242 4242 4242 4242`
