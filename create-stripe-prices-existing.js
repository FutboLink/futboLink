// Script to create prices for an existing product in Stripe
require('dotenv').config();
const Stripe = require('stripe');

async function createStripePrices() {
  try {
    console.log('Setting up Stripe prices for existing product...');
    
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      console.error('STRIPE_SECRET_KEY not found in environment variables');
      return;
    }
    
    console.log('Using API key:', `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
    
    const stripe = new Stripe(apiKey, {
      apiVersion: '2023-10-16',
    });
    
    // Use the existing product ID
    const productId = 'prod_SHJrAdSz0dxsxC';
    
    // Get product info
    try {
      const product = await stripe.products.retrieve(productId);
      console.log(`Using existing product: ${product.name} (${product.id})`);
    } catch (error) {
      console.error(`Product with ID ${productId} not found:`, error.message);
      return;
    }
    
    // Create prices for semi-pro subscription
    console.log('Creating monthly price for Semiprofesional...');
    const semiproMonthly = await stripe.prices.create({
      product: productId,
      unit_amount: 395, // €3.95
      currency: 'eur',
      recurring: {
        interval: 'month',
      },
      nickname: 'Semiprofesional Mensual',
    });
    
    console.log('Creating yearly price for Semiprofesional...');
    const semiproYearly = await stripe.prices.create({
      product: productId,
      unit_amount: 3795, // €37.95
      currency: 'eur',
      recurring: {
        interval: 'year',
      },
      nickname: 'Semiprofesional Anual',
    });
    
    // Create prices for professional subscription
    console.log('Creating monthly price for Profesional...');
    const proMonthly = await stripe.prices.create({
      product: productId,
      unit_amount: 795, // €7.95
      currency: 'eur',
      recurring: {
        interval: 'month',
      },
      nickname: 'Profesional Mensual',
    });
    
    console.log('Creating yearly price for Profesional...');
    const proYearly = await stripe.prices.create({
      product: productId,
      unit_amount: 7595, // €75.95
      currency: 'eur',
      recurring: {
        interval: 'year',
      },
      nickname: 'Profesional Anual',
    });
    
    // Summary
    console.log('\n----- PRICE SETUP COMPLETE -----');
    console.log('Semiprofesional Monthly Price ID:', semiproMonthly.id);
    console.log('Semiprofesional Yearly Price ID:', semiproYearly.id);
    console.log('Profesional Monthly Price ID:', proMonthly.id);
    console.log('Profesional Yearly Price ID:', proYearly.id);
    console.log('\nUpdate these IDs in your frontend code (helpersSubs.ts)');
    
    // Create a sample price configuration for copy-pasting
    console.log('\nSample configuration for helpersSubs.ts:');
    console.log(`
    // Semiprofessional
    priceId: {
      monthly: "${semiproMonthly.id}",
      yearly: "${semiproYearly.id}",
    },
    
    // Professional
    priceId: {
      monthly: "${proMonthly.id}",
      yearly: "${proYearly.id}",
    },
    `);
    
  } catch (error) {
    console.error('Error creating Stripe prices:', error.message);
    console.error('Full error:', error);
  }
}

// Run the setup
createStripePrices(); 