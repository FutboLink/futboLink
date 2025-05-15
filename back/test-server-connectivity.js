// Script to test the server's network connectivity to Stripe
require('dotenv').config();
const https = require('https');
const fs = require('fs');

async function testStripeConnectivity() {
  try {
    console.log('Testing connectivity to Stripe API...');
    
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      console.error('STRIPE_SECRET_KEY not found in environment variables');
      return;
    }
    
    console.log('Using API key:', `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
    
    // Test direct HTTPS connection to Stripe
    console.log('\nTesting HTTPS connection to api.stripe.com...');
    
    await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.stripe.com',
        port: 443,
        path: '/v1/prices',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Stripe-Version': '2025-02-24.acacia'
        },
        timeout: 30000, // 30 seconds
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        
        console.log(`HTTPS Status Code: ${res.statusCode}`);
        console.log(`HTTPS Headers: ${JSON.stringify(res.headers)}`);
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log('✅ Successfully connected to Stripe API');
            try {
              const jsonData = JSON.parse(data);
              if (jsonData.data && jsonData.data.length > 0) {
                console.log(`Found ${jsonData.data.length} prices in the Stripe account`);
                // Log just the first price
                const firstPrice = jsonData.data[0];
                console.log(`Sample price: ${firstPrice.id}, ${firstPrice.unit_amount} ${firstPrice.currency}`);
              } else {
                console.log('No prices found in the Stripe account');
              }
            } catch (e) {
              console.error('Error parsing JSON response:', e.message);
            }
          } else {
            console.error(`❌ Received error status code: ${res.statusCode}`);
            console.error(`Response data: ${data}`);
          }
          resolve();
        });
      });
      
      req.on('error', (error) => {
        console.error(`❌ Connection error: ${error.message}`);
        reject(error);
      });
      
      req.on('timeout', () => {
        console.error('❌ Request timed out');
        req.destroy();
        reject(new Error('Request timed out'));
      });
      
      req.end();
    }).catch(err => {
      console.error('Failed HTTP request:', err.message);
    });
    
    // Test DNS resolution
    console.log('\nTesting DNS resolution for api.stripe.com...');
    
    await new Promise((resolve) => {
      require('dns').lookup('api.stripe.com', (err, address) => {
        if (err) {
          console.error(`❌ DNS resolution failed: ${err.message}`);
        } else {
          console.log(`✅ DNS resolution successful: ${address}`);
        }
        resolve();
      });
    });
    
    // Write environment info
    console.log('\nEnvironment information:');
    console.log(`Node version: ${process.version}`);
    console.log(`Platform: ${process.platform}`);
    
    // Log SSL/TLS information
    console.log('\nTLS version support:');
    console.log(`NODE_OPTIONS: ${process.env.NODE_OPTIONS || 'not set'}`);
    
    // Check if price IDs in frontend match Stripe
    console.log('\nChecking if frontend price IDs exist in Stripe...');
    
    const frontendPriceIds = [
      'price_1ROuhFGggu4c99M7oOnftD8O', // Semiprofesional monthly
      'price_1ROuhFGggu4c99M7ezWEeM3F', // Semiprofesional yearly 
      'price_1ROuhFGggu4c99M7sVRv9wq0', // Profesional monthly
      'price_1ROuhGGggu4c99M7oRU6jXzy'  // Profesional yearly
    ];
    
    for (const priceId of frontendPriceIds) {
      await new Promise((resolve) => {
        const options = {
          hostname: 'api.stripe.com',
          port: 443,
          path: `/v1/prices/${priceId}`,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Stripe-Version': '2025-02-24.acacia'
          }
        };
        
        const req = https.request(options, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            if (res.statusCode === 200) {
              try {
                const price = JSON.parse(data);
                console.log(`✅ Price ${priceId} exists: ${price.unit_amount} ${price.currency}`);
              } catch (e) {
                console.error(`Error parsing price ${priceId} response:`, e.message);
              }
            } else {
              console.error(`❌ Price ${priceId} not found: ${res.statusCode}`);
            }
            resolve();
          });
        });
        
        req.on('error', (error) => {
          console.error(`❌ Error checking price ${priceId}: ${error.message}`);
          resolve();
        });
        
        req.end();
      });
    }
    
    console.log('\nConnectivity test complete!');
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

// Run the test
testStripeConnectivity(); 