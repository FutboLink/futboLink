#!/usr/bin/env node

/**
 * Test script for CORS configuration
 * 
 * This script tests if CORS is properly configured by making requests
 * from different origins to your API endpoints.
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// API endpoints to test
const endpoints = [
  '/payments/subscription',
  '/stripe/webhook-test',
];

// Origins to test from
const origins = [
  'https://www.futbolink.it',
  'https://futbolink.it',
  'https://www.futbolink.com',
  'https://futbolink.com',
  'http://localhost:3000'
];

// API base URL
const apiBase = process.env.API_URL || 'https://futbolink.onrender.com';

console.log(`🔍 Testing CORS configuration for ${apiBase}`);
console.log('------------------------------------------------');

async function testCorsForEndpoint(endpoint, origin) {
  return new Promise((resolve) => {
    const url = new URL(endpoint, apiBase);
    const options = {
      method: 'OPTIONS',
      headers: {
        'Origin': origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    };
    
    const protocol = url.protocol === 'https:' ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      const corsHeaders = {
        'access-control-allow-origin': res.headers['access-control-allow-origin'],
        'access-control-allow-methods': res.headers['access-control-allow-methods'],
        'access-control-allow-headers': res.headers['access-control-allow-headers'],
        'access-control-allow-credentials': res.headers['access-control-allow-credentials']
      };
      
      const statusCode = res.statusCode;
      
      resolve({
        endpoint,
        origin,
        statusCode,
        corsHeaders,
        success: statusCode === 204 || statusCode === 200,
        allowsOrigin: corsHeaders['access-control-allow-origin'] === origin || corsHeaders['access-control-allow-origin'] === '*'
      });
    });
    
    req.on('error', (error) => {
      resolve({
        endpoint,
        origin,
        error: error.message,
        success: false,
        allowsOrigin: false
      });
    });
    
    req.end();
  });
}

async function runTests() {
  for (const endpoint of endpoints) {
    console.log(`\nTesting endpoint: ${endpoint}`);
    console.log('-------------------------');
    
    for (const origin of origins) {
      const result = await testCorsForEndpoint(endpoint, origin);
      
      if (result.success && result.allowsOrigin) {
        console.log(`✅ ${origin} - CORS correctly configured`);
      } else if (result.error) {
        console.log(`❌ ${origin} - Error: ${result.error}`);
      } else {
        console.log(`❌ ${origin} - CORS issue detected`);
        console.log(`   Status Code: ${result.statusCode}`);
        console.log(`   Headers: ${JSON.stringify(result.corsHeaders, null, 2)}`);
      }
    }
  }
  
  console.log('\n------------------------------------------------');
  console.log('CORS Testing Complete');
}

runTests(); 