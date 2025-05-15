// Stripe Connection Issue Fix Tool
const Stripe = require('stripe');
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();

async function fixStripeConnection() {
  console.log('🔧 Stripe Connection Fix Tool 🔧');
  console.log('-------------------------------');
  
  // Check if Stripe is installed
  try {
    require.resolve('stripe');
    console.log('✅ Stripe package is installed');
  } catch (e) {
    console.error('❌ Stripe package is not installed. Installing now...');
    console.log('Please run: npm install stripe');
    process.exit(1);
  }
  
  // Check for API key in environment
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
    console.log('Please make sure you have a .env file with a valid STRIPE_SECRET_KEY');
    process.exit(1);
  }
  
  // Validate API key format
  if (!apiKey.startsWith('sk_test_') && !apiKey.startsWith('sk_live_')) {
    console.error('❌ STRIPE_SECRET_KEY has an invalid format');
    console.log('API keys should start with sk_test_ or sk_live_');
    process.exit(1);
  }
  
  console.log(`🔑 Found API key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
  
  // Create Stripe instance with minimal configuration
  const stripe = new Stripe(apiKey, {
    apiVersion: '2023-10-16',
    timeout: 10000, // Short timeout
    maxNetworkRetries: 1, // Minimal retries
    httpAgent: new https.Agent({
      keepAlive: true,
      timeout: 10000,
    }),
  });
  
  // Test connection
  console.log('\n🔄 Testing connection to Stripe API...');
  
  try {
    const startTime = Date.now();
    await stripe.balance.retrieve();
    const endTime = Date.now();
    
    console.log(`✅ Successfully connected to Stripe! Response time: ${endTime - startTime}ms`);
    console.log('\n🔄 Testing key permissions...');
    
    try {
      // Verify we can create a test customer
      const customer = await stripe.customers.create({
        email: 'test@example.com',
        description: 'Test customer for API verification',
      });
      console.log('✅ Successfully created a test customer - API key has correct permissions');
      
      // Clean up - delete the test customer
      await stripe.customers.del(customer.id);
    } catch (permError) {
      console.error('❌ API key may have restricted permissions:');
      console.error(`Error: ${permError.message}`);
    }
  } catch (error) {
    console.error('❌ Failed to connect to Stripe:');
    console.error(`Error type: ${error.type}`);
    console.error(`Error message: ${error.message}`);
    
    if (error.type === 'StripeAuthenticationError') {
      console.log('\n🛠️ The API key appears to be invalid. Please check that:');
      console.log('1. You have the correct API key from your Stripe dashboard');
      console.log('2. You are not using a restricted test key');
      console.log('3. Your key has not been revoked or expired');
    }
    
    if (error.type === 'StripeConnectionError') {
      console.log('\n🛠️ Connection issue detected. Please check that:');
      console.log('1. Your internet connection is working');
      console.log('2. There are no firewalls blocking the connection');
      console.log('3. Stripe API is not experiencing downtime (https://status.stripe.com)');
      
      // Check DNS resolution
      console.log('\n🔄 Testing DNS resolution for api.stripe.com...');
      const dns = require('dns');
      dns.lookup('api.stripe.com', (err, address) => {
        if (err) {
          console.error('❌ DNS resolution failed:', err.message);
        } else {
          console.log(`✅ DNS resolution successful: api.stripe.com resolves to ${address}`);
        }
      });
    }
    
    process.exit(1);
  }
  
  // Network diagnostic
  console.log('\n🔄 Running network diagnostic...');
  
  const testPriceId = 'price_1ROua1Gggu4c99M7WhGJjz0m'; // Your test price ID
  
  try {
    const startTime = Date.now();
    await stripe.prices.retrieve(testPriceId);
    const endTime = Date.now();
    
    if (endTime - startTime > 3000) {
      console.log(`⚠️ API response time is slow: ${endTime - startTime}ms`);
      console.log('This might cause timeouts in your application');
    } else {
      console.log(`✅ API response time is good: ${endTime - startTime}ms`);
    }
  } catch (error) {
    if (error.code === 'resource_missing') {
      console.log(`⚠️ The test price ID (${testPriceId}) does not exist in your Stripe account`);
      console.log('Make sure you are using the correct price ID in your application');
    } else {
      console.error(`❌ API test failed: ${error.message}`);
    }
  }
  
  console.log('\n✅ Stripe connection diagnostic complete');
  console.log('\n🛠️ Recommended fixes:');
  console.log('1. Update the stripe-service.ts with reduced timeouts (30s instead of 60s)');
  console.log('2. Verify that the test product and price IDs exist in your Stripe account');
  console.log('3. Run your application with NODE_TLS_REJECT_UNAUTHORIZED=0 to debug SSL issues');
  console.log('4. Make sure you\'re not running into Stripe rate limits');
  
  console.log('\n🔄 Checking Stripe service configuration...');
  // Try to find and read the StripeService file
  const possiblePaths = [
    path.join(process.cwd(), 'src/payments/services/stripe.service.ts'),
    path.join(process.cwd(), '../src/payments/services/stripe.service.ts'),
    path.join(process.cwd(), '../../src/payments/services/stripe.service.ts'),
    path.join(process.cwd(), 'back/src/payments/services/stripe.service.ts'),
  ];
  
  let stripeServicePath;
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      stripeServicePath = testPath;
      break;
    }
  }
  
  if (stripeServicePath) {
    console.log(`Found Stripe service at: ${stripeServicePath}`);
    const content = fs.readFileSync(stripeServicePath, 'utf8');
    
    // Check for common issues
    if (content.includes('timeout: 60000')) {
      console.log('⚠️ Timeout is set to 60 seconds, which might be too long');
      console.log('   Consider reducing it to 30 seconds');
    }
    
    if (content.includes('maxNetworkRetries: 5')) {
      console.log('⚠️ Maximum network retries is set to 5, which might cause long waiting times');
      console.log('   Consider reducing it to 3');
    }
    
    if (!content.includes("apiVersion: '2023-10-16'")) {
      console.log('⚠️ Stripe API version might be outdated or incorrect');
    }
  } else {
    console.log('Could not find Stripe service file to analyze');
  }
  
  console.log('\n🎉 Diagnostic complete! Use the information above to fix your Stripe connection issues.');
}

fixStripeConnection(); 