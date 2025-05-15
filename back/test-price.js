// Script to test retrieving a specific price from Stripe
require('dotenv').config();
const Stripe = require('stripe');

async function testStripePrice() {
  try {
    console.log('Testing Stripe price retrieval...');
    
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      console.error('STRIPE_SECRET_KEY not found in environment variables');
      return;
    }
    
    console.log('Using API key:', `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
    
    const stripe = new Stripe(apiKey, {
      apiVersion: '2023-10-16',
      // Try with increased timeout and retry settings
      timeout: 30000, // 30 seconds
      maxNetworkRetries: 3,
    });
    
    // Attempt to list all prices first
    console.log('Listing all prices:');
    const prices = await stripe.prices.list({ limit: 10 });
    
    if (prices.data.length === 0) {
      console.log('No prices found in your Stripe account. Consider creating some prices first.');
    } else {
      console.log(`Found ${prices.data.length} prices:`);
      prices.data.forEach(price => {
        console.log(`- ID: ${price.id}, Product: ${price.product}, Amount: ${price.unit_amount}, Currency: ${price.currency}`);
      });
      
      // If there are prices, use the first one for testing
      const testPriceId = prices.data[0].id;
      console.log(`\nUsing the first price for testing: ${testPriceId}`);
      
      // Try to retrieve the specific price we're having issues with
      const specificPriceId = 'price_1RMlDOGggu4c99M76gGzQ1de';
      console.log(`\nNow attempting to retrieve specific price ID: ${specificPriceId}`);
      try {
        const specificPrice = await stripe.prices.retrieve(specificPriceId);
        console.log('Successfully retrieved specific price:');
        console.log(`- ID: ${specificPrice.id}, Product: ${specificPrice.product}, Amount: ${specificPrice.unit_amount}, Currency: ${specificPrice.currency}`);
      } catch (specificError) {
        console.error(`Error retrieving specific price: ${specificError.message}`);
        console.error('This is the error that needs to be fixed.');
      }
      
      // Provide update recommendations
      console.log('\nRecommended actions:');
      console.log('1. Update the price IDs in your frontend (helpersSubs.ts) to use one of the valid price IDs listed above');
      console.log('2. If no prices are available, create new prices using the create-stripe-prices.js script');
    }
  } catch (error) {
    console.error('Error connecting to Stripe:', error.message);
    console.error('Full error:', error);
    
    // Check for network connectivity issues
    if (error.type === 'StripeConnectionError') {
      console.log('\nThis looks like a network connectivity issue. Make sure your server can connect to api.stripe.com');
      console.log('Try running: curl -v https://api.stripe.com/v1/prices');
    }
  }
}

// Run the test
testStripePrice(); 