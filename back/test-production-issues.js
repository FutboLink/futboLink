// Script to diagnose Stripe connectivity issues in production environments
require('dotenv').config();
const https = require('https');
const dns = require('dns');

async function testProductionStripeIssues() {
  try {
    console.log('Testing production Stripe connectivity issues...');
    
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      console.error('STRIPE_SECRET_KEY not found in environment variables');
      return;
    }
    
    console.log('Using API key:', `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
    
    // Test DNS resolution for api.stripe.com with different DNS servers
    console.log('\n1. Testing DNS resolution with multiple DNS servers...');
    
    // Test with Google's DNS
    await testDnsResolver('8.8.8.8', 'api.stripe.com');
    
    // Test with Cloudflare's DNS
    await testDnsResolver('1.1.1.1', 'api.stripe.com');
    
    // Test with default system DNS
    await new Promise((resolve) => {
      dns.lookup('api.stripe.com', (err, address) => {
        if (err) {
          console.error(`❌ System DNS resolution failed: ${err.message}`);
        } else {
          console.log(`✅ System DNS resolution successful: ${address}`);
        }
        resolve();
      });
    });
    
    // Test TLS/SSL connections with different settings
    console.log('\n2. Testing TLS connection with multiple security versions...');
    
    // Test specific price ID with explicit TLS settings
    const priceIdToTest = 'price_1ROuhFGggu4c99M7oOnftD8O'; // Semiprofesional monthly
    
    // Test with TLS 1.2
    await testTlsConnection('api.stripe.com', priceIdToTest, apiKey, 'TLSv1.2');
    
    // Test with TLS 1.3
    await testTlsConnection('api.stripe.com', priceIdToTest, apiKey, 'TLSv1.3');
    
    // Test if there are any outbound connection restrictions
    console.log('\n3. Testing for outbound connection restrictions...');
    
    // Try connecting with different ports
    await testPortConnection('api.stripe.com', 443);
    await testPortConnection('api.stripe.com', 80);
    
    // Test if there's a proxy in the environment
    const proxyEnv = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || 'none';
    console.log(`Detected proxy environment variable: ${proxyEnv}`);
    
    // Test timeout settings
    console.log('\n4. Testing with extreme timeout settings...');
    
    await testWithExtremeTimeout('api.stripe.com', priceIdToTest, apiKey);
    
    console.log('\n5. Checking for production environment variables that might be missing...');
    
    // Check for common environment variables
    const requiredEnvVars = [
      'NODE_ENV',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET'
    ];
    
    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        console.log(`✅ ${envVar} is set`);
      } else {
        console.error(`❌ ${envVar} is NOT set`);
      }
    }
    
    console.log('\nProduction diagnostic test complete!');
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

// Helper function to test DNS resolver with a specific DNS server
async function testDnsResolver(dnsServer, hostname) {
  return new Promise((resolve) => {
    const resolver = new dns.Resolver();
    resolver.setServers([dnsServer]);
    
    console.log(`Testing DNS resolution with ${dnsServer}...`);
    resolver.resolve4(hostname, (err, addresses) => {
      if (err) {
        console.error(`❌ DNS resolution with ${dnsServer} failed: ${err.message}`);
      } else {
        console.log(`✅ DNS resolution with ${dnsServer} successful: ${addresses.join(', ')}`);
      }
      resolve();
    });
  });
}

// Helper function to test TLS connections with specific versions
async function testTlsConnection(hostname, priceId, apiKey, tlsVersion) {
  return new Promise((resolve) => {
    console.log(`Testing TLS connection with ${tlsVersion}...`);
    
    const options = {
      hostname: hostname,
      port: 443,
      path: `/v1/prices/${priceId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Stripe-Version': '2025-02-24.acacia'
      },
      minVersion: tlsVersion,
      maxVersion: tlsVersion,
      timeout: 60000
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ TLS ${tlsVersion} connection successful (Status ${res.statusCode})`);
        } else {
          console.error(`❌ TLS ${tlsVersion} connection failed with status ${res.statusCode}`);
          console.error(`Response: ${data}`);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.error(`❌ TLS ${tlsVersion} connection error: ${error.message}`);
      resolve();
    });
    
    req.end();
  });
}

// Helper function to test port connectivity
async function testPortConnection(hostname, port) {
  return new Promise((resolve) => {
    console.log(`Testing connection to ${hostname}:${port}...`);
    
    const socket = require('net').createConnection(port, hostname);
    
    socket.setTimeout(10000); // 10 seconds timeout
    
    socket.on('connect', () => {
      console.log(`✅ Successfully connected to ${hostname}:${port}`);
      socket.end();
      resolve();
    });
    
    socket.on('timeout', () => {
      console.error(`❌ Connection to ${hostname}:${port} timed out`);
      socket.destroy();
      resolve();
    });
    
    socket.on('error', (error) => {
      console.error(`❌ Error connecting to ${hostname}:${port}: ${error.message}`);
      resolve();
    });
  });
}

// Helper function to test with extreme timeout
async function testWithExtremeTimeout(hostname, priceId, apiKey) {
  return new Promise((resolve) => {
    console.log(`Testing with extreme timeout settings (120 seconds)...`);
    
    const options = {
      hostname: hostname,
      port: 443,
      path: `/v1/prices/${priceId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Stripe-Version': '2025-02-24.acacia'
      },
      timeout: 120000 // 2 minutes
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ Long timeout connection successful (Status ${res.statusCode})`);
        } else {
          console.error(`❌ Long timeout connection failed with status ${res.statusCode}`);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.error(`❌ Long timeout connection error: ${error.message}`);
      resolve();
    });
    
    req.on('timeout', () => {
      console.error(`❌ Long timeout connection timed out after 120 seconds`);
      req.destroy();
      resolve();
    });
    
    req.end();
  });
}

// Run the test
testProductionStripeIssues(); 