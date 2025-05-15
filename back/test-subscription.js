// Script to test creating a subscription checkout session
require('dotenv').config();
const Stripe = require('stripe');
const https = require('https');

async function testStripeSubscription() {
  try {
    console.log('Testing Stripe subscription checkout session creation...');
    
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      console.error('STRIPE_SECRET_KEY not found in environment variables');
      return;
    }
    
    console.log('Using API key:', `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
    
    const stripe = new Stripe(apiKey, {
      apiVersion: '2025-02-24.acacia',
      timeout: 60000, // 60 seconds
      maxNetworkRetries: 7,
      // Use the proper HTTPS agent
      httpAgent: new https.Agent({ keepAlive: true }),
    });
    
    // First list all prices to see what's available
    console.log('Listing available prices:');
    const prices = await stripe.prices.list({ limit: 10 });
    
    if (prices.data.length === 0) {
      console.log('No prices found in your Stripe account.');
      return;
    }
    
    // Log all the available prices
    console.log(`Found ${prices.data.length} prices:`);
    prices.data.forEach(price => {
      console.log(`- ID: ${price.id}, Product: ${price.product}, Amount: ${price.unit_amount}, Currency: ${price.currency}`);
    });
    
    // Get the valid price ID for testing from the first item in the list
    const validPriceId = prices.data[0].id;
    
    // Try to create a checkout session with a valid price
    console.log(`\nCreating checkout session with price ID: ${validPriceId}`);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: validPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/payment/cancel',
    });
    
    console.log('Successfully created subscription checkout session:');
    console.log(`- Session ID: ${session.id}`);
    console.log(`- Session URL: ${session.url}`);
    
    // Now test the specific price IDs from your frontend
    const frontendPriceIds = [
      'price_1ROuhFGggu4c99M7oOnftD8O', // Semiprofesional monthly
      'price_1ROuhFGggu4c99M7ezWEeM3F', // Semiprofesional yearly 
      'price_1ROuhFGggu4c99M7sVRv9wq0', // Profesional monthly
      'price_1ROuhGGggu4c99M7oRU6jXzy'  // Profesional yearly
    ];
    
    console.log('\nTesting price IDs from frontend:');
    for (const priceId of frontendPriceIds) {
      try {
        console.log(`Testing price ID: ${priceId}`);
        const price = await stripe.prices.retrieve(priceId);
        console.log(`✅ Successfully retrieved price: ${price.id}, Amount: ${price.unit_amount}, Currency: ${price.currency}`);
      } catch (error) {
        console.error(`❌ Failed to retrieve price ${priceId}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Error testing Stripe:', error.message);
    console.error('Detailed error:', error);
  }
}

// Run the test
testStripeSubscription(); 