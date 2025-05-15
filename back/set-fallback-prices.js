/**
 * Script to set up fallback prices for Stripe
 * Run with: NODE_ENV=production node back/set-fallback-prices.js
 * 
 * This script:
 * 1. Creates a lightweight Stripe price if none exist
 * 2. Searches for existing prices to use as fallbacks
 * 3. Stores valid price IDs in environment configuration
 */

require('dotenv').config();
const Stripe = require('stripe');
const fs = require('fs');
const path = require('path');

async function setupFallbackPrices() {
  console.log('=== Stripe Fallback Prices Setup ===');
  
  // Check for Stripe API key
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
    console.error('Please set your Stripe secret key first');
    return;
  }

  console.log('✅ STRIPE_SECRET_KEY found');
  console.log(`Using API key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
  
  // Initialize Stripe with robust settings
  const stripe = new Stripe(apiKey, {
    apiVersion: '2025-02-24.acacia',
    timeout: 120000, // 2 minutes
    maxNetworkRetries: 10,
  });
  
  console.log('\nFetching existing Stripe prices...');
  try {
    const prices = await stripe.prices.list({ 
      limit: 100,
      active: true,
      expand: ['data.product']
    });
    
    if (prices.data.length === 0) {
      console.log('No active prices found in your Stripe account');
      console.log('Creating a default price...');
      
      // Create a product first
      const product = await stripe.products.create({
        name: 'Fallback Subscription',
        description: 'Fallback product for when regular pricing is unavailable',
        metadata: {
          is_fallback: 'true'
        }
      });
      
      console.log(`Created fallback product: ${product.id}`);
      
      // Create a price for the product
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: 1000, // $10.00
        currency: 'usd',
        recurring: {
          interval: 'month'
        },
        metadata: {
          is_fallback: 'true'
        }
      });
      
      console.log(`Created fallback price: ${price.id} ($${price.unit_amount/100}/${price.recurring.interval})`);
      
      // Store this price ID for fallback use
      storeFallbackPrice(price.id);
      return;
    }
    
    console.log(`Found ${prices.data.length} active prices in your Stripe account`);
    
    // Map prices to a more readable format
    const formattedPrices = prices.data.map((price, index) => {
      const productName = price.product && typeof price.product !== 'string' 
        ? price.product.name 
        : 'Unknown Product';
      
      return {
        index: index + 1,
        id: price.id,
        productName,
        amount: `${price.currency.toUpperCase()} ${price.unit_amount/100}`,
        interval: price.recurring ? price.recurring.interval : 'one-time',
        created: new Date(price.created * 1000).toISOString().split('T')[0],
      };
    });
    
    // Display prices in a table
    console.log('\nAvailable Prices:');
    console.log('--------------------------------------------------------------------------------');
    console.log('| # | Price ID                      | Product          | Amount   | Interval |');
    console.log('--------------------------------------------------------------------------------');
    
    formattedPrices.forEach(p => {
      console.log(`| ${p.index.toString().padEnd(2)} | ${p.id.padEnd(30)} | ${p.productName.slice(0, 16).padEnd(16)} | ${p.amount.padEnd(8)} | ${p.interval.padEnd(8)} |`);
    });
    
    console.log('--------------------------------------------------------------------------------');
    
    // Recommend using the first subscription price as fallback
    const subscriptionPrices = formattedPrices.filter(p => p.interval !== 'one-time');
    
    if (subscriptionPrices.length > 0) {
      const recommendedPrice = subscriptionPrices[0];
      console.log(`\nRecommended fallback price: ${recommendedPrice.id}`);
      console.log(`Product: ${recommendedPrice.productName}`);
      console.log(`Amount: ${recommendedPrice.amount} per ${recommendedPrice.interval}`);
      
      // Store this price ID for fallback use
      storeFallbackPrice(recommendedPrice.id);
    } else {
      console.log('\nNo subscription prices found. Creating a default price...');
      
      // Create a product first
      const product = await stripe.products.create({
        name: 'Fallback Subscription',
        description: 'Fallback product for when regular pricing is unavailable',
        metadata: {
          is_fallback: 'true'
        }
      });
      
      console.log(`Created fallback product: ${product.id}`);
      
      // Create a price for the product
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: 1000, // $10.00
        currency: 'usd',
        recurring: {
          interval: 'month'
        },
        metadata: {
          is_fallback: 'true'
        }
      });
      
      console.log(`Created fallback price: ${price.id} ($${price.unit_amount/100}/${price.recurring.interval})`);
      
      // Store this price ID for fallback use
      storeFallbackPrice(price.id);
    }
  } catch (error) {
    console.error('Error accessing Stripe API:', error.message);
    console.error('Check your network connection and API key validity');
  }
}

// Store the fallback price ID in the environment
function storeFallbackPrice(priceId) {
  console.log(`\nSetting ${priceId} as fallback price ID...`);
  
  // Try to update .env file
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      
      // Check if STRIPE_FALLBACK_PRICE_ID exists
      if (envContent.includes('STRIPE_FALLBACK_PRICE_ID=')) {
        // Update existing value
        envContent = envContent.replace(
          /STRIPE_FALLBACK_PRICE_ID=.*/,
          `STRIPE_FALLBACK_PRICE_ID=${priceId}`
        );
      } else {
        // Add new variable
        envContent += `\nSTRIPE_FALLBACK_PRICE_ID=${priceId}\n`;
      }
    } else {
      // Create new .env file
      envContent = `STRIPE_FALLBACK_PRICE_ID=${priceId}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Updated .env file with fallback price ID');
  } catch (fileError) {
    console.error('Could not update .env file:', fileError.message);
  }
  
  // Also update environment variable for current process
  process.env.STRIPE_FALLBACK_PRICE_ID = priceId;
  
  console.log('\nFallback price configuration complete!');
  console.log('You can now use this price as a fallback when Stripe connectivity is unreliable.');
  console.log(`Add this to your production environment: STRIPE_FALLBACK_PRICE_ID=${priceId}`);
}

// Run the script
setupFallbackPrices().catch(error => {
  console.error('Script failed:', error);
}); 