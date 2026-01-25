# Payment Setup Guide for AstryxNodes

This guide will help you set up payment methods for your Minecraft server hosting business.

## Prerequisites

1. Node.js and npm installed
2. A Stripe account (for credit/debit card payments)
3. GCash, Maya, and/or Bank account details

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your actual payment details:

   **Stripe Setup:**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
   - Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)
   - Add them to your `.env` file

   **Payment Methods:**
   - Add your GCash number
   - Add your Maya number
   - Add your bank account details

### 3. Update Frontend Stripe Key

1. Open `script.js`
2. Find the line: `let STRIPE_PUBLISHABLE_KEY = null;`
3. You can either:
   - Set it directly: `const STRIPE_PUBLISHABLE_KEY = 'pk_test_...';`
   - Or create an API endpoint to serve it securely (recommended for production)

### 4. Update Payment Instructions in HTML

The payment instructions are automatically populated from your `.env` file via the `/api/payment-config` endpoint. Make sure your server is reading the environment variables correctly.

### 5. Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

## Payment Flow

### For Stripe (Credit/Debit Cards):
1. User clicks "Buy Now" on a plan
2. User fills out checkout form
3. User selects "Credit/Debit Card (Stripe)"
4. User enters card details (handled securely by Stripe)
5. Payment is processed immediately
6. Order is created and confirmed

### For Manual Payment Methods (GCash, Maya, Bank Transfer):
1. User clicks "Buy Now" on a plan
2. User fills out checkout form
3. User selects payment method (GCash, Maya, or Bank Transfer)
4. User sees payment instructions with your account details
5. User completes payment externally
6. Order is created with "pending_payment" status
7. You manually verify payment and update order status

## Database Integration (TODO)

Currently, orders are logged to the console. For production, you should:

1. Set up a database (MongoDB, PostgreSQL, MySQL, etc.)
2. Update the `/api/create-order` and `/api/complete-order` endpoints to save orders
3. Create an admin panel to view and manage orders
4. Set up email notifications for new orders

## Email Notifications (TODO)

Consider integrating email services like:
- SendGrid
- Mailgun
- AWS SES
- Nodemailer with SMTP

Send confirmation emails to customers and notification emails to yourself when new orders are created.

## Security Considerations

1. **Never commit `.env` file** - It contains sensitive keys
2. **Use HTTPS in production** - Required for Stripe
3. **Validate all inputs** - Server-side validation is crucial
4. **Rate limiting** - Implement rate limiting to prevent abuse
5. **CSRF protection** - Add CSRF tokens for form submissions

## Testing

### Test Stripe Payments:
1. Use Stripe test mode (keys starting with `pk_test_` and `sk_test_`)
2. Use test card numbers from [Stripe Testing](https://stripe.com/docs/testing)
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`

### Test Manual Payments:
1. Create a test order
2. Verify order details are correct
3. Check that payment instructions display correctly

## Production Deployment

1. Switch to Stripe live keys (`pk_live_` and `sk_live_`)
2. Set up proper error handling and logging
3. Implement order management system
4. Set up automated server provisioning (if applicable)
5. Configure SSL/HTTPS
6. Set up monitoring and alerts

## Support

For issues or questions:
- Check Stripe documentation: https://stripe.com/docs
- Review server logs for errors
- Test payment flow in test mode first
