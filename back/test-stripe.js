// Simple Stripe API test script
require('dotenv').config(); // Load environment variables
const Stripe = require('stripe');

// Function to test Stripe connectivity
async function testStripeConnection() {
  try {
    console.log('Testing Stripe API connectivity...');
    
    // Get API key from environment
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      console.error('STRIPE_SECRET_KEY not found in environment variables');
      return;
    }
    
    console.log('Using API key:', `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
    
    // Initialize Stripe
    const stripe = new Stripe(apiKey, {
      apiVersion: '2023-10-16',
    });
    
    // Try to list prices as a basic operation
    console.log('Fetching list of prices...');
    const prices = await stripe.prices.list({ limit: 5 });
    
    console.log('Success! Found', prices.data.length, 'prices');
    console.log('First few prices:');
    
    prices.data.forEach(price => {
      console.log(`- ID: ${price.id}, Product: ${price.product}, Amount: ${price.unit_amount}, Currency: ${price.currency}`);
    });
    
    console.log('\nStripe API is working properly!');
  } catch (error) {
    console.error('Error connecting to Stripe:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testStripeConnection(); 