// Test script for Stripe implementation
const Stripe = require('stripe');
const https = require('https');
require('dotenv').config();

async function testStripeImplementation() {
  try {
    console.log('Testing Stripe implementation...');
    
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      console.error('STRIPE_SECRET_KEY not found in environment variables');
      return;
    }
    
    console.log('Using API key:', `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
    
    const stripe = new Stripe(apiKey, {
      apiVersion: '2023-10-16',
      timeout: 60000,
      maxNetworkRetries: 5,
      httpAgent: new https.Agent({ keepAlive: true }),
    });
    
    // Test product ID
    const productId = 'prod_SJXfFO3DbuBj0X';
    
    // Test price ID
    const priceId = 'price_1ROua1Gggu4c99M7WhGJjz0m';
    
    // Verify that the product exists
    console.log(`\nVerifying product with ID: ${productId}`);
    try {
      const product = await stripe.products.retrieve(productId);
      console.log(`Product verified: ${product.name} (${product.id})`);
    } catch (error) {
      console.error(`Error retrieving product: ${error.message}`);
    }
    
    // Verify that the price exists
    console.log(`\nVerifying price with ID: ${priceId}`);
    try {
      const price = await stripe.prices.retrieve(priceId);
      console.log(`Price verified: ${price.id}, ${price.unit_amount / 100} ${price.currency}`);
      console.log(`Price Type: ${price.type}, Recurring: ${price.recurring ? 'Yes' : 'No'}`);
      if (price.recurring) {
        console.log(`Interval: ${price.recurring.interval}, Count: ${price.recurring.interval_count}`);
      }
      console.log(`Product: ${price.product}`);
    } catch (error) {
      console.error(`Error retrieving price: ${error.message}`);
    }
    
    // Create a test checkout session for one-time payment
    console.log('\nCreating test one-time payment checkout session...');
    try {
      const oneTimeSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product: productId,
              unit_amount: 1000, // 10.00 EUR
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: 'http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'http://localhost:3000/payment/cancel',
      });
      
      console.log('Successfully created one-time payment checkout session:');
      console.log(`Session ID: ${oneTimeSession.id}`);
      console.log(`URL: ${oneTimeSession.url}`);
    } catch (error) {
      console.error(`Error creating one-time payment session: ${error.message}`);
    }
    
    // Create a test checkout session for subscription
    console.log('\nCreating test subscription checkout session...');
    try {
      const subscriptionSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: 'http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'http://localhost:3000/payment/cancel',
      });
      
      console.log('Successfully created subscription checkout session:');
      console.log(`Session ID: ${subscriptionSession.id}`);
      console.log(`URL: ${subscriptionSession.url}`);
    } catch (error) {
      console.error(`Error creating subscription session: ${error.message}`);
    }
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

testStripeImplementation(); 