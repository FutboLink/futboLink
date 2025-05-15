# Stripe Integration

## Overview

This document explains how the Stripe integration works in futboLink for processing payments and subscriptions.

## Test Mode

The current implementation is using Stripe in **test mode** with the following test IDs:

- **Product ID**: `prod_SJXfFO3DbuBj0X`
- **Price ID**: `price_1ROua1Gggu4c99M7WhGJjz0m`

## Environment Variables

The following environment variables need to be configured:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_DOMAIN=http://localhost:3000 (or your production domain)
```

## API Endpoints

### Create One-Time Payment

```
POST /payments/onetime
```

**Request Body:**
```json
{
  "customerEmail": "customer@example.com",
  "amount": 1000, // in cents (10.00)
  "currency": "eur",
  "productName": "Product Name",
  "description": "Payment description",
  "successUrl": "https://yourdomain.com/success", // optional
  "cancelUrl": "https://yourdomain.com/cancel" // optional
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/...",
  "sessionId": "cs_test_...",
  "paymentId": "payment-uuid"
}
```

### Create Subscription

```
POST /payments/subscription
```

**Request Body:**
```json
{
  "customerEmail": "customer@example.com",
  "priceId": "price_1ROua1Gggu4c99M7WhGJjz0m",
  "description": "Subscription description",
  "successUrl": "https://yourdomain.com/success", // optional
  "cancelUrl": "https://yourdomain.com/cancel" // optional
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/...",
  "sessionId": "cs_test_...",
  "paymentId": "payment-uuid"
}
```

### Webhook Handler

```
POST /payments/webhook
```

The webhook endpoint handles various Stripe events, including:

- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

## Testing

A test script is included to verify the Stripe integration:

```
node back/test-stripe.js
```

This script will:
1. Verify the test product and price IDs
2. Create a test one-time payment checkout session
3. Create a test subscription checkout session

## Stripe Test Cards

For testing, you can use these Stripe test card numbers:

- **Success**: `4242 4242 4242 4242`
- **Requires Authentication**: `4000 0025 0000 3155`
- **Declined**: `4000 0000 0000 0002`

Use any future expiration date, any 3-digit CVC, and any 5-digit ZIP code.

## Frontend Integration

The frontend redirects users to the Stripe Checkout page via the URL returned from the backend API. After payment completion, users are redirected to the success or cancel pages as defined in the request.

## Payment Entity

Payments are stored in the database with the following status values:

- `PENDING`: Payment has been initiated but not completed
- `SUCCEEDED`: Payment has been successfully completed
- `FAILED`: Payment has failed
- `CANCELED`: Payment has been canceled
- `PROCESSING`: Payment is being processed
- `REFUNDED`: Payment has been refunded
- `PAYMENT_REQUIRED`: For subscriptions that require payment 