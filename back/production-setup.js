// Script to check and setup the production environment for Stripe
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const os = require('os');

async function setupProductionEnvironment() {
  console.log('Checking production environment setup for Stripe...');
  
  // Check if we're running in production
  const isProduction = process.env.NODE_ENV === 'production';
  console.log(`Environment: ${isProduction ? 'PRODUCTION' : 'Development'}`);
  
  // Check required environment variables
  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'FRONTEND_DOMAIN'
  ];
  
  let missingVars = false;
  
  console.log('\nChecking environment variables:');
  for (const envVar of requiredVars) {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar} is set: ${maskSecret(process.env[envVar])}`);
    } else {
      console.error(`❌ ${envVar} is NOT set`);
      missingVars = true;
    }
  }
  
  if (missingVars) {
    console.error('\n⚠️ Some required environment variables are missing!');
    console.log('Please make sure all required variables are set in your environment or .env file.');
  }
  
  // Check network configuration
  console.log('\nChecking network configuration:');
  
  // Check for proxies
  const proxyEnv = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || 'none';
  console.log(`Proxy environment: ${proxyEnv}`);
  
  if (proxyEnv !== 'none') {
    console.log('⚠️ Proxy detected. This might interfere with Stripe connectivity.');
    console.log('Consider setting NODE_TLS_REJECT_UNAUTHORIZED=0 if you have SSL issues.');
  }
  
  // Check DNS configuration
  console.log('\nChecking DNS configuration:');
  
  try {
    const dns = require('dns');
    const result = await new Promise((resolve, reject) => {
      dns.lookup('api.stripe.com', (err, address) => {
        if (err) reject(err);
        else resolve(address);
      });
    });
    
    console.log(`✅ DNS resolves api.stripe.com to: ${result}`);
  } catch (error) {
    console.error(`❌ DNS resolution failed: ${error.message}`);
    console.log('This could indicate network connectivity issues.');
  }
  
  // Check for firewalls
  console.log('\nChecking for firewall restrictions:');
  console.log('Unable to automatically detect firewalls, please check manually.');
  console.log('Stripe API requires outbound HTTPS (port 443) access to:');
  console.log('- api.stripe.com');
  console.log('- checkout.stripe.com');
  console.log('- hooks.stripe.com');
  
  // Create a fixed fallback file with price IDs
  console.log('\nCreating fallback price config file...');
  
  const fallbackConfig = {
    prices: {
      semiprofessional: {
        monthly: 'price_1ROuhFGggu4c99M7oOnftD8O',
        yearly: 'price_1ROuhFGggu4c99M7ezWEeM3F'
      },
      professional: {
        monthly: 'price_1ROuhFGggu4c99M7sVRv9wq0',
        yearly: 'price_1ROuhGGggu4c99M7oRU6jXzy'
      }
    },
    products: {
      main: 'prod_SHJrAdSz0dxsxC'
    }
  };
  
  try {
    fs.writeFileSync(
      path.join(__dirname, 'stripe-fallback.json'),
      JSON.stringify(fallbackConfig, null, 2)
    );
    console.log('✅ Created stripe-fallback.json with price and product IDs');
  } catch (error) {
    console.error(`❌ Failed to create fallback file: ${error.message}`);
  }
  
  // Check TLS settings
  console.log('\nChecking TLS configuration:');
  console.log(`Node.js version: ${process.version}`);
  if (parseInt(process.version.slice(1).split('.')[0]) < 12) {
    console.log('⚠️ Node.js version is below 12. TLS 1.2 might not be fully supported.');
    console.log('Consider upgrading Node.js to at least version 12.');
  } else {
    console.log('✅ Node.js version supports TLS 1.2 and TLS 1.3');
  }
  
  // System info
  console.log('\nSystem information:');
  console.log(`Platform: ${os.platform()}`);
  console.log(`Architecture: ${os.arch()}`);
  console.log(`Memory: ${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB`);
  console.log(`Free memory: ${Math.round(os.freemem() / (1024 * 1024 * 1024))} GB`);
  
  // Production recommendations
  console.log('\nProduction environment recommendations:');
  console.log('1. Increase Stripe API timeouts (already set to 120s in the updated code)');
  console.log('2. Implement circuit breaker pattern for resilient API calls');
  console.log('3. Set up detailed logging for Stripe API calls');
  console.log('4. Configure environment-specific error handling');
  console.log('5. Set up monitoring for Stripe API connectivity');
  
  console.log('\nSetup complete!');
}

// Helper function to mask secrets for logging
function maskSecret(secret) {
  if (!secret) return '';
  if (secret.length < 8) return '***';
  return `${secret.substring(0, 4)}...${secret.substring(secret.length - 4)}`;
}

// Run the setup
setupProductionEnvironment().catch(err => {
  console.error('Setup error:', err);
}); 