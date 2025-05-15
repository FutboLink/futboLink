/**
 * Test script to diagnose Stripe connectivity issues
 * Run with: NODE_ENV=production node test-stripe-network.js
 */

const https = require('https');
const dns = require('dns');
const { execSync } = require('child_process');

async function testStripeConnectivity() {
  console.log('=== Stripe Connectivity Diagnostic Tool ===');
  console.log('This script will test your connectivity to Stripe API servers');
  console.log('Running environment checks...\n');

  // Check environment variables
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
    console.error('Please ensure your environment variables are properly set');
    return;
  }

  console.log('✅ STRIPE_SECRET_KEY is set');
  console.log(`Using API key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}\n`);

  // Check DNS resolution
  console.log('Testing DNS resolution for api.stripe.com...');
  try {
    const addresses = await new Promise((resolve, reject) => {
      dns.resolve4('api.stripe.com', (err, addresses) => {
        if (err) reject(err);
        else resolve(addresses);
      });
    });
    console.log(`✅ DNS resolution successful. IP addresses: ${addresses.join(', ')}`);
  } catch (error) {
    console.error(`❌ DNS resolution failed: ${error.message}`);
    console.error('This suggests a DNS issue. Check your network/DNS configuration.');
    return;
  }

  // Test ping to check basic network connectivity
  console.log('\nTesting basic network connectivity with ping...');
  try {
    const pingResult = execSync('ping -c 4 api.stripe.com').toString();
    console.log('✅ Ping successful:');
    const lines = pingResult.split('\n');
    console.log(lines[lines.length - 3] || 'Ping completed successfully');
  } catch (error) {
    console.error('❌ Ping failed:');
    console.error(error.message);
    console.error('This suggests network connectivity issues or firewall rules blocking ICMP.');
  }

  // Check TLS connection
  console.log('\nTesting TLS handshake with api.stripe.com...');
  try {
    const tlsCheckCommand = 'openssl s_client -connect api.stripe.com:443 -tls1_2 -servername api.stripe.com -brief';
    execSync(tlsCheckCommand);
    console.log('✅ TLS handshake successful');
  } catch (error) {
    console.error('❌ TLS handshake failed:');
    console.error(error.message);
    console.error('This suggests TLS/SSL connection issues.');
  }

  // Test HTTPS connection to Stripe API
  console.log('\nTesting HTTPS connection to api.stripe.com...');
  try {
    await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.stripe.com',
        port: 443,
        path: '/v1/prices?limit=1',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Stripe-Version': '2025-02-24.acacia'
        },
        timeout: 30000,
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        
        console.log(`HTTPS Status Code: ${res.statusCode}`);
        
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
        if (error.code === 'ECONNRESET') {
          console.error('Connection was reset. This could be due to network issues, firewall rules, or proxy interference.');
        } else if (error.code === 'ETIMEDOUT') {
          console.error('Connection timed out. This could be due to network latency or firewall blocking the connection.');
        }
        reject(error);
      });
      
      req.on('timeout', () => {
        console.error('❌ Request timed out');
        req.destroy();
        reject(new Error('Request timed out'));
      });
      
      req.end();
    });
  } catch (error) {
    console.error('Failed HTTP request:', error.message);
  }

  // Network diagnostics
  console.log('\n=== Network Route Diagnostics ===');
  try {
    console.log('Tracing route to api.stripe.com:');
    const traceResult = execSync('traceroute -m 15 api.stripe.com').toString();
    console.log(traceResult);
  } catch (error) {
    console.error('Could not trace route:', error.message);
  }

  console.log('\n=== Recommendations ===');
  console.log('If you are experiencing connection issues with Stripe:');
  console.log('1. Check your network/firewall rules to ensure api.stripe.com is accessible');
  console.log('2. Verify your API keys are correct and active in the Stripe dashboard');
  console.log('3. If using a proxy, ensure it is correctly configured');
  console.log('4. Check for any antivirus or security software that might be blocking the connection');
  console.log('5. Try running your server on a different network to rule out local network issues');
  console.log('6. Test basic HTTP requests using curl: curl -v https://api.stripe.com/v1/prices -H "Authorization: Bearer YOUR_API_KEY"');
}

// Run the test
testStripeConnectivity().catch(error => {
  console.error('Test failed with error:', error);
}); 