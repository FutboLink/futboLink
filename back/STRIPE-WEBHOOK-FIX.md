# FutboLink Backend Fixes

## 1. Stripe Webhook Fix

### Issue Description

Stripe reported that the webhook endpoint at `https://futbolink-zh5d.onrender.com/stripe/webhook` is timing out, causing webhook events to fail. This affects subscription billing and checkout processing.

The main issue was:
- Webhook timeout: The endpoint was processing events synchronously, causing timeouts
- Route mismatch: The raw body parser middleware was on a different path than the actual controller

### Changes Made

1. **Created a dedicated controller for Stripe webhooks**
   - Located at `src/payments/controllers/stripe.controller.ts`
   - Implements immediate response to Stripe
   - Processes webhook events asynchronously

2. **Optimized Stripe configuration**
   - Reduced timeout settings
   - Eliminated unnecessary retries
   - Simplified HTTP client configuration

3. **Added better error handling and logging**
   - Improved verification of webhook signatures
   - Added detailed logging for debugging

4. **Fixed middleware configuration**
   - Ensured proper body parser middleware for webhook routes
   - Added support for both `/stripe/webhook` and `/payments/webhook` routes

## 2. CORS Configuration Fix

### Issue Description

Users from the website `futbolink.it` were unable to access the API due to CORS errors. The API was blocking cross-origin requests from this domain.

Error message:
```
Access to fetch at 'https://futbolink.onrender.com/payments/subscription' from origin 'https://www.futbolink.it' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Changes Made

1. **Updated CORS configuration in main.ts**
   - Added all possible FutboLink domain variations to the allowed origins:
     - `https://www.futbolink.it`
     - `https://futbolink.it`
     - `https://www.futbolink.com`
     - `https://futbolink.com`
   
2. **Added more comprehensive CORS options**
   - Expanded allowed methods to include `OPTIONS` for preflight requests
   - Added explicit headers configuration
   - Set appropriate preflight handling options
   
3. **Created a CORS testing script**
   - Added `test-cors.js` to verify CORS configuration
   - Tests all major domains against key API endpoints

## Testing the Fixes

### Testing Stripe Webhooks

1. **Use the test endpoint**
   ```
   curl -X POST https://futbolink-zh5d.onrender.com/stripe/webhook-test
   ```
   This should return a successful response with a timestamp.

2. **Update Stripe Dashboard Configuration**
   1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
   2. Go to Developers > Webhooks
   3. Make sure your webhook endpoint is set to `https://futbolink-zh5d.onrender.com/stripe/webhook`
   4. Click "Send test webhook" to verify it works

### Testing CORS Configuration

1. **Run the CORS test script**
   ```
   node test-cors.js
   ```
   This will check if the API correctly responds to requests from different origins.

2. **Manual verification**
   - Try making a subscription request from the website
   - Check browser console for CORS errors

## Common Issues

- **CORS errors**: The CORS settings have been updated to allow requests from all FutboLink domains
- **Signature verification**: Make sure `STRIPE_WEBHOOK_SECRET` is correctly set in environment variables
- **Timeouts**: If timeouts still occur, you may need to further optimize database operations

## Next Steps

If the fix resolves the issue, Stripe will automatically start sending webhook events successfully. If problems persist:

1. Contact Stripe support with the error logs
2. Consider further optimizing webhook handlers for specific events
3. Investigate potential database or network latency issues

## Need Help?

For assistance, contact the development team. Make sure to include:
- Any error messages from logs or browser console
- The timestamp when the issue occurred
- The URL you were trying to access when the error occurred 