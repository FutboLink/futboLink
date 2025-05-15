// Simple Network Connectivity Checker for Stripe API
const https = require('https');
const dns = require('dns');

console.log('🌐 Testing network connectivity to Stripe API...');

// First, let's check DNS resolution
console.log('\n1. Checking DNS resolution for api.stripe.com...');
dns.lookup('api.stripe.com', (err, address, family) => {
  if (err) {
    console.error('❌ DNS resolution failed:', err.message);
    console.log('This indicates a DNS issue. Check your internet connection or DNS settings.');
    return;
  }
  
  console.log(`✅ DNS resolution successful: api.stripe.com resolves to ${address} (IPv${family})`);
  
  // Now let's do a simple HTTPS request to check connectivity
  console.log('\n2. Testing HTTPS connection to api.stripe.com...');
  
  const startTime = Date.now();
  const req = https.request({
    hostname: 'api.stripe.com',
    port: 443,
    path: '/',
    method: 'GET',
    timeout: 5000, // 5 second timeout
  }, (res) => {
    const endTime = Date.now();
    
    console.log(`✅ Connected to api.stripe.com (status ${res.statusCode})`);
    console.log(`  Response time: ${endTime - startTime}ms`);
    console.log(`  TLS/SSL: ${res.socket.getPeerCertificate().subject.CN}`);
    
    // We don't care about the response data
    res.on('data', () => {});
    
    res.on('end', () => {
      console.log('\n✅ Network connectivity to Stripe API is working correctly');
      console.log('\nIf your application is still having issues, the problem might be:');
      console.log('1. Invalid API key format or permissions');
      console.log('2. Stripe library configuration issues');
      console.log('3. Firewall or proxy blocking specific request patterns');
      
      // Try an alternative approach
      testFallbackRequest();
    });
  });
  
  req.on('error', (e) => {
    console.error(`❌ Connection to api.stripe.com failed: ${e.message}`);
    console.log('\nThis indicates a network connectivity issue. Possible causes:');
    console.log('1. No internet connection');
    console.log('2. Firewall blocking outbound HTTPS connections');
    console.log('3. Proxy server issues');
    console.log('4. TLS/SSL issues');
    
    // Try an alternative approach
    testFallbackRequest();
  });
  
  req.on('timeout', () => {
    console.error('❌ Connection to api.stripe.com timed out after 5 seconds');
    console.log('This indicates network latency issues or Stripe API being unresponsive');
    req.destroy();
    
    // Try an alternative approach
    testFallbackRequest();
  });
  
  req.end();
});

// Alternative approach using a different domain
function testFallbackRequest() {
  console.log('\n3. Testing fallback connection to dashboard.stripe.com...');
  
  const startTime = Date.now();
  const req = https.request({
    hostname: 'dashboard.stripe.com',
    port: 443,
    path: '/',
    method: 'GET',
    timeout: 5000,
  }, (res) => {
    const endTime = Date.now();
    
    console.log(`✅ Connected to dashboard.stripe.com (status ${res.statusCode})`);
    console.log(`  Response time: ${endTime - startTime}ms`);
    
    // Successfully connected to an alternative Stripe domain
    console.log('\n✨ Testing complete. If both tests passed but your application');
    console.log('still has issues, try running your app with this environment variable:');
    console.log('\nNODE_TLS_REJECT_UNAUTHORIZED=0 npm run start:dev');
    console.log('\n⚠️ Warning: Only use this for debugging, not in production!');
  });
  
  req.on('error', (e) => {
    console.error(`❌ Connection to dashboard.stripe.com failed: ${e.message}`);
    console.log('\n❗️ Both connection tests failed. Your network likely has severe');
    console.log('connectivity issues or is blocking connections to Stripe domains.');
  });
  
  req.on('timeout', () => {
    console.error('❌ Connection to dashboard.stripe.com timed out');
    req.destroy();
  });
  
  req.end();
}

// Network diagnostic
console.log('\n🔄 Running network diagnostic...');

const testPriceId = 'price_1R7MaqGbCHvHfqXFimcCzvlo'; // Your test price ID 