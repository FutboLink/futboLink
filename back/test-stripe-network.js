/**
 * Enhanced diagnostic script for Stripe connectivity issues
 * Run with: NODE_ENV=production node test-stripe-network.js
 */

const https = require('https');
const dns = require('dns');
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const net = require('net');

async function testStripeConnectivity() {
  console.log('=== Stripe Connectivity Diagnostic Tool (Enhanced) ===');
  console.log('This script will perform comprehensive testing of your Stripe API connectivity');
  console.log('Running system and environment checks...\n');

  // System info
  console.log('=== System Information ===');
  console.log(`OS: ${os.type()} ${os.release()} (${os.platform()}); Node.js: ${process.version}`);
  console.log(`Hostname: ${os.hostname()}`);
  
  // Network interfaces
  console.log('\n=== Network Interfaces ===');
  const networkInterfaces = os.networkInterfaces();
  for (const [name, interfaces] of Object.entries(networkInterfaces)) {
    for (const iface of interfaces) {
      if (iface.family === 'IPv4' || iface.family === 4) {
        console.log(`${name}: ${iface.address} (${iface.internal ? 'internal' : 'external'})`);
      }
    }
  }

  // Check environment variables
  console.log('\n=== Stripe Configuration ===');
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
    console.error('Please ensure your environment variables are properly set');
    return;
  }

  console.log('✅ STRIPE_SECRET_KEY is set');
  console.log(`Using API key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
  
  // Check for proxy settings
  const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy;
  const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  const noProxy = process.env.NO_PROXY || process.env.no_proxy;
  
  if (httpProxy || httpsProxy) {
    console.log('\n=== Proxy Configuration Detected ===');
    console.log(`HTTP_PROXY: ${httpProxy || 'Not set'}`);
    console.log(`HTTPS_PROXY: ${httpsProxy || 'Not set'}`);
    console.log(`NO_PROXY: ${noProxy || 'Not set'}`);
    console.log('Proxy settings may affect Stripe connectivity');
  }

  // Test direct TCP connectivity (port check)
  console.log('\n=== Testing TCP Socket Connection ===');
  let tcpConnected = false;
  try {
    await new Promise((resolve, reject) => {
      const socket = new net.Socket();
      const timeout = setTimeout(() => {
        socket.destroy();
        reject(new Error('TCP connection timeout'));
      }, 10000);
      
      socket.connect(443, 'api.stripe.com', () => {
        clearTimeout(timeout);
        console.log('✅ TCP socket connection to api.stripe.com:443 successful');
        tcpConnected = true;
        socket.destroy();
        resolve();
      });
      
      socket.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  } catch (error) {
    console.error(`❌ TCP socket connection failed: ${error.message}`);
    console.error('This indicates a network-level connection issue to Stripe servers');
    console.error('Check firewall rules, VPN settings, or network configuration');
  }

  // Check DNS resolution
  console.log('\n=== DNS Resolution Tests ===');
  console.log('Testing DNS resolution for api.stripe.com...');
  let dnsResolved = false;
  try {
    const addresses = await new Promise((resolve, reject) => {
      dns.resolve4('api.stripe.com', (err, addresses) => {
        if (err) reject(err);
        else resolve(addresses);
      });
    });
    console.log(`✅ DNS resolution successful. IP addresses: ${addresses.join(', ')}`);
    dnsResolved = true;
    
    // Test DNS resolution for other Stripe domains
    for (const domain of ['dashboard.stripe.com', 'js.stripe.com', 'hooks.stripe.com']) {
      try {
        const addrs = await new Promise((resolve, reject) => {
          dns.resolve4(domain, (err, addresses) => {
            if (err) reject(err);
            else resolve(addresses);
          });
        });
        console.log(`✅ DNS resolution for ${domain} successful: ${addrs[0]}...`);
      } catch (err) {
        console.error(`❌ DNS resolution for ${domain} failed: ${err.message}`);
      }
    }
  } catch (error) {
    console.error(`❌ DNS resolution failed: ${error.message}`);
    console.error('This suggests a DNS issue. Check your DNS server configuration.');
    
    // Try using Google's public DNS as a test
    try {
      console.log('\nAttempting DNS resolution using Google DNS (8.8.8.8)...');
      const googleDnsLookup = execSync('nslookup api.stripe.com 8.8.8.8').toString();
      console.log('Google DNS lookup results:');
      console.log(googleDnsLookup.split('\n').slice(0, 6).join('\n'));
    } catch (googleDnsError) {
      console.error('Failed to test with Google DNS:', googleDnsError.message);
    }
  }

  // Test ping to check basic network connectivity
  console.log('\n=== Network Connectivity Tests ===');
  let pingSuccessful = false;
  try {
    const pingResult = execSync('ping -c 4 api.stripe.com').toString();
    console.log('✅ Ping successful:');
    const lines = pingResult.split('\n');
    console.log(lines[lines.length - 3] || 'Ping completed successfully');
    pingSuccessful = true;
  } catch (error) {
    console.error('❌ Ping failed:');
    console.error(error.message);
    console.error('This suggests network connectivity issues or firewall rules blocking ICMP.');
  }

  // Check TLS connection
  console.log('\n=== TLS/SSL Connection Tests ===');
  let tlsSuccessful = false;
  try {
    const tlsCheckCommand = 'openssl s_client -connect api.stripe.com:443 -tls1_2 -servername api.stripe.com -brief';
    const tlsResult = execSync(tlsCheckCommand).toString();
    console.log('✅ TLS handshake successful');
    tlsSuccessful = true;
    
    // Extract certificate information
    if (tlsResult.includes('subject=')) {
      const subjectLine = tlsResult.split('\n').find(line => line.includes('subject='));
      console.log(`Certificate: ${subjectLine.trim()}`);
    }
  } catch (error) {
    console.error('❌ TLS handshake failed:');
    console.error(error.message);
    console.error('This suggests TLS/SSL connection issues or possible MITM proxy interference.');
  }

  // Test HTTPS connection to Stripe API
  console.log('\n=== Stripe API Connection Test ===');
  let apiConnected = false;
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
        console.log(`HTTPS Headers: ${JSON.stringify(res.headers, null, 2)}`);
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            apiConnected = true;
            console.log('✅ Successfully connected to Stripe API');
            try {
              const jsonData = JSON.parse(data);
              if (jsonData.data && jsonData.data.length > 0) {
                console.log(`Found ${jsonData.data.length} prices in the Stripe account`);
                console.log(`Sample price ID: ${jsonData.data[0].id}`);
              } else {
                console.log('No prices found in the Stripe account');
              }
            } catch (e) {
              console.error('Error parsing JSON response:', e.message);
            }
          } else {
            console.error(`❌ Received error status code: ${res.statusCode}`);
            
            try {
              const jsonData = JSON.parse(data);
              console.error(`Error: ${jsonData.error?.message || 'Unknown error'}`);
              console.error(`Type: ${jsonData.error?.type || 'Unknown'}`);
            } catch {
              console.error(`Response data: ${data}`);
            }
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
        } else if (error.code === 'ECONNREFUSED') {
          console.error('Connection refused. The server actively refused the connection.');
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

  // Network trace
  console.log('\n=== Network Route Diagnostics ===');
  try {
    console.log('Tracing route to api.stripe.com:');
    const traceResult = execSync('traceroute -m 15 -T -p 443 api.stripe.com').toString();
    console.log(traceResult);
  } catch (error) {
    console.error('Could not trace route:', error.message);
    
    // Try simpler traceroute
    try {
      console.log('\nAttempting basic traceroute:');
      const basicTraceResult = execSync('traceroute -m 10 api.stripe.com').toString();
      console.log(basicTraceResult);
    } catch (traceError) {
      console.error('Could not perform basic traceroute:', traceError.message);
    }
  }

  // Summary of test results
  console.log('\n=== Connectivity Test Summary ===');
  console.log(`DNS Resolution: ${dnsResolved ? '✅ Passed' : '❌ Failed'}`);
  console.log(`Network Ping: ${pingSuccessful ? '✅ Passed' : '❌ Failed'}`);
  console.log(`TCP Socket: ${tcpConnected ? '✅ Passed' : '❌ Failed'}`);
  console.log(`TLS Handshake: ${tlsSuccessful ? '✅ Passed' : '❌ Failed'}`);
  console.log(`Stripe API: ${apiConnected ? '✅ Passed' : '❌ Failed'}`);
  
  console.log('\n=== Overall Diagnosis ===');
  if (!dnsResolved) {
    console.log('❌ PRIMARY ISSUE: DNS Resolution Failure');
    console.log('  - Your system cannot resolve Stripe\'s domain names to IP addresses');
    console.log('  - Check your DNS settings or try using Google DNS (8.8.8.8)');
  } else if (!tcpConnected || !pingSuccessful) {
    console.log('❌ PRIMARY ISSUE: Network Connectivity Failure');
    console.log('  - Your system cannot establish network connections to Stripe\'s servers');
    console.log('  - Check firewall rules, proxy settings, or network restrictions');
  } else if (!tlsSuccessful) {
    console.log('❌ PRIMARY ISSUE: TLS/SSL Handshake Failure');
    console.log('  - Your system cannot establish secure TLS connections to Stripe');
    console.log('  - Check TLS settings, security software, or proxy interference');
  } else if (!apiConnected) {
    console.log('❌ PRIMARY ISSUE: Stripe API Authentication/Access Failure');
    console.log('  - Your API key may be invalid or restricted');
    console.log('  - Check your Stripe dashboard for API key restrictions or rate limits');
  } else {
    console.log('✅ No critical connectivity issues detected');
    console.log('If you\'re still experiencing problems, check:');
    console.log('  - Rate limiting or API usage restrictions');
    console.log('  - Network stability and latency');
    console.log('  - Specific API endpoint permission restrictions');
  }

  console.log('\n=== Recommendations ===');
  console.log('Based on test results, try these solutions:');
  if (!dnsResolved) {
    console.log('1. Configure your server to use reliable DNS servers (Google: 8.8.8.8, Cloudflare: 1.1.1.1)');
    console.log('2. Check if your hosting provider restricts DNS resolution');
  }
  if (!tcpConnected || !pingSuccessful) {
    console.log('1. Check firewall rules to ensure port 443 is open for outbound connections');
    console.log('2. Verify VPN or proxy settings if in use');
    console.log('3. Contact your hosting provider to ensure outbound connections are not restricted');
  }
  if (!apiConnected) {
    console.log('1. Verify API key in Stripe dashboard');
    console.log('2. Check for API key restrictions or rate limiting');
    console.log('3. Generate a new API key if needed');
  }
  
  console.log('\n=== General Tips ===');
  console.log('1. Add the STRIPE_FALLBACK_PRICE_ID environment variable with a valid price ID');
  console.log('2. Configure longer timeouts and retry settings in your Stripe client');
  console.log('3. Consider implementing fallback mechanisms when Stripe is unavailable');
  console.log('4. Verify network stability during high traffic periods');
  console.log('5. Contact Stripe support with details from this diagnostic report');

  // Create diagnostic report file
  try {
    const reportContent = `
Stripe Connectivity Diagnostic Report
====================================
Date: ${new Date().toISOString()}
System: ${os.type()} ${os.release()} (${os.platform()})
Node.js: ${process.version}
Hostname: ${os.hostname()}

Test Results:
- DNS Resolution: ${dnsResolved ? 'Passed' : 'Failed'}
- Network Ping: ${pingSuccessful ? 'Passed' : 'Failed'} 
- TCP Socket: ${tcpConnected ? 'Passed' : 'Failed'}
- TLS Handshake: ${tlsSuccessful ? 'Passed' : 'Failed'}
- Stripe API: ${apiConnected ? 'Passed' : 'Failed'}

Please include this report when contacting support.
`;

    fs.writeFileSync('stripe-diagnostic-report.txt', reportContent);
    console.log('\nDiagnostic report saved to stripe-diagnostic-report.txt');
  } catch (reportError) {
    console.error('Could not create diagnostic report file:', reportError.message);
  }
}

// Run the test
testStripeConnectivity().catch(error => {
  console.error('Test failed with error:', error);
}); 