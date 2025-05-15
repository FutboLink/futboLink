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
    
    // Create the Stripe client with better diagnostic settings
    const stripe = new Stripe(apiKey, {
      apiVersion: '2023-10-16',
      timeout: 30000, // Reduced timeout for quicker diagnostics
      maxNetworkRetries: 2, // Lower retries for diagnostics
      httpAgent: new https.Agent({ 
        keepAlive: true, 
        timeout: 30000,
      }),
    });
    
    // First test basic connectivity to Stripe
    console.log('\nTesting basic Stripe connectivity...');
    try {
      const startTime = Date.now();
      await stripe.balance.retrieve();
      const endTime = Date.now();
      console.log(`✅ Successfully connected to Stripe! Response time: ${endTime - startTime}ms`);
    } catch (error) {
      console.error('❌ Failed to connect to Stripe:');
      console.error(`  Error type: ${error.type}`);
      console.error(`  Error message: ${error.message}`);
      if (error.code) console.error(`  Error code: ${error.code}`);
      if (error.raw) console.error('  Raw error:', error.raw);
      return; // Exit early if we can't connect
    }
    
    // Test product ID
    const productId = 'prod_SJXfFO3DbuBj0X';
    
    // Test price ID
    const priceId = 'price_1ROua1Gggu4c99M7WhGJjz0m';
    
    // Verify that the product exists
    console.log(`\nVerifying product with ID: ${productId}`);
    try {
      const startTime = Date.now();
      const product = await stripe.products.retrieve(productId);
      const endTime = Date.now();
      console.log(`✅ Product verified: ${product.name} (${product.id}). Response time: ${endTime - startTime}ms`);
    } catch (error) {
      console.error(`❌ Error retrieving product:`);
      console.error(`  Error type: ${error.type}`);
      console.error(`  Error message: ${error.message}`);
      if (error.code) console.error(`  Error code: ${error.code}`);
    }
    
    // Verify that the price exists
    console.log(`\nVerifying price with ID: ${priceId}`);
    try {
      const startTime = Date.now();
      const price = await stripe.prices.retrieve(priceId);
      const endTime = Date.now();
      console.log(`✅ Price verified: ${price.id}, ${price.unit_amount / 100} ${price.currency}. Response time: ${endTime - startTime}ms`);
      console.log(`  Price Type: ${price.type}, Recurring: ${price.recurring ? 'Yes' : 'No'}`);
      if (price.recurring) {
        console.log(`  Interval: ${price.recurring.interval}, Count: ${price.recurring.interval_count}`);
      }
      console.log(`  Product: ${price.product}`);
    } catch (error) {
      console.error(`❌ Error retrieving price:`);
      console.error(`  Error type: ${error.type}`);
      console.error(`  Error message: ${error.message}`);
      if (error.code) console.error(`  Error code: ${error.code}`);
      return; // Exit early if price doesn't exist
    }
    
    // Create a test checkout session for subscription
    console.log('\nCreating test subscription checkout session...');
    try {
      const startTime = Date.now();
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
      const endTime = Date.now();
      
      console.log(`✅ Successfully created subscription checkout session. Response time: ${endTime - startTime}ms`);
      console.log(`  Session ID: ${subscriptionSession.id}`);
      console.log(`  URL: ${subscriptionSession.url}`);
    } catch (error) {
      console.error('❌ Error creating subscription session:');
      console.error(`  Error type: ${error.type}`);
      console.error(`  Error message: ${error.message}`);
      if (error.code) console.error(`  Error code: ${error.code}`);
      if (error.raw) console.error('  Raw error:', error.raw);
    }
    
    // Create a test checkout session for one-time payment (as a fallback)
    console.log('\nCreating test one-time payment checkout session...');
    try {
      const startTime = Date.now();
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
      const endTime = Date.now();
      
      console.log(`✅ Successfully created one-time payment checkout session. Response time: ${endTime - startTime}ms`);
      console.log(`  Session ID: ${oneTimeSession.id}`);
      console.log(`  URL: ${oneTimeSession.url}`);
    } catch (error) {
      console.error('❌ Error creating one-time payment session:');
      console.error(`  Error type: ${error.type}`);
      console.error(`  Error message: ${error.message}`);
      if (error.code) console.error(`  Error code: ${error.code}`);
      if (error.raw) console.error('  Raw error:', error.raw);
    }
    
    console.log('\n✨ Test complete');
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

testStripeImplementation(); 