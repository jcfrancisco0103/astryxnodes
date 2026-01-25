# Vercel Deployment Guide for AstryxNodes

This guide will help you deploy your AstryxNodes website to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Your project pushed to GitHub
3. All environment variables ready

## Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

## Step 2: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Click "Add New Project"

2. **Import Your Repository:**
   - Connect your GitHub account if not already connected
   - Select the `astryxnodes` repository
   - Click "Import"

3. **Configure Project:**
   - **Framework Preset:** Other
   - **Root Directory:** `astryxnodes` (if in monorepo) or leave blank if root
   - **Build Command:** Leave blank (no build needed)
   - **Output Directory:** Leave blank

4. **Add Environment Variables:**
   Click "Environment Variables" and add all variables from your `.env` file:
   
   ```
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   GCASH_NUMBER=your_gcash_number
   MAYA_NUMBER=your_maya_number
   BANK_NAME=your_bank_name
   BANK_ACCOUNT_NAME=your_account_name
   BANK_ACCOUNT_NUMBER=your_account_number
   SALES_API_URL=your_sales_api_url
   SALES_API_KEY=your_sales_api_key
   ```
   
   **Important:** 
   - For `SALES_API_URL`, use your production sales API URL (not localhost)
   - If your sales website is also on Vercel, use the Vercel URL
   - Make sure to add these for all environments (Production, Preview, Development)

5. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your site will be live at `https://your-project-name.vercel.app`

## Step 3: Deploy via CLI (Alternative)

1. **Login to Vercel:**
   ```bash
   cd /home/ubuntu/astryx/astryxnodes
   vercel login
   ```

2. **Deploy:**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project? (if first time, say No)
   - Project name: `astryxnodes` (or your preferred name)
   - Directory: `./`
   - Override settings? No

3. **Add Environment Variables:**
   ```bash
   vercel env add STRIPE_SECRET_KEY
   vercel env add STRIPE_PUBLISHABLE_KEY
   vercel env add GCASH_NUMBER
   vercel env add MAYA_NUMBER
   vercel env add BANK_NAME
   vercel env add BANK_ACCOUNT_NAME
   vercel env add BANK_ACCOUNT_NUMBER
   vercel env add SALES_API_URL
   vercel env add SALES_API_KEY
   ```
   
   For each variable, enter the value when prompted.

4. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

## Step 4: Update Sales API URL

After deploying, update your `SALES_API_URL` environment variable in Vercel:

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Update `SALES_API_URL` to point to your production sales API
   - If sales is on Vercel: `https://your-sales-project.vercel.app`
   - If sales is on another server: `https://your-sales-domain.com`

## Step 5: Configure Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Important Notes

### Environment Variables
- **Never commit `.env` file** - All secrets should be in Vercel environment variables
- **Update for all environments** - Make sure to add variables for Production, Preview, and Development
- **Sales API URL** - Must be accessible from Vercel (not localhost)

### File Structure
- Static files (HTML, CSS, JS, images) are served automatically
- API routes go through `server.js`
- The `vercel.json` file handles routing

### Testing
- After deployment, test all payment methods
- Verify Stripe integration works
- Check that orders sync to sales API
- Test on mobile devices

## Troubleshooting

### Build Errors
- Check that all dependencies are in `package.json`
- Verify `vercel.json` is correct
- Check Vercel build logs for specific errors

### API Routes Not Working
- Ensure `server.js` exports the app: `module.exports = app`
- Check that routes are defined before the export
- Verify environment variables are set correctly

### Static Files Not Loading
- Check `vercel.json` routes configuration
- Verify file paths are correct
- Ensure files are committed to git

### Environment Variables Not Working
- Verify variables are added in Vercel dashboard
- Check variable names match exactly (case-sensitive)
- Redeploy after adding new variables

## Support

For Vercel-specific issues:
- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
