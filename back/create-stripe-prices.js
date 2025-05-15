// Script to create Stripe products and prices for subscriptions
require('dotenv').config();
const Stripe = require('stripe');

async function createStripeProducts() {
  try {
    console.log('Setting up Stripe products and prices...');
    
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      console.error('STRIPE_SECRET_KEY not found in environment variables');
      return;
    }
    
    console.log('Using API key:', `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
    
    const stripe = new Stripe(apiKey, {
      apiVersion: '2023-10-16',
    });
    
    // Create semi-pro subscription
    console.log('Creating Semiprofessional product...');
    const semiproProduct = await stripe.products.create({
      name: 'FutboLink Semiprofesional',
      description: 'Suscripción Semiprofesional a FutboLink',
    });
    
    console.log(`Created product: ${semiproProduct.name} (${semiproProduct.id})`);
    
    // Create prices for semi-pro subscription
    console.log('Creating monthly price for Semiprofesional...');
    const semiproMonthly = await stripe.prices.create({
      product: semiproProduct.id,
      unit_amount: 395, // €3.95
      currency: 'eur',
      recurring: {
        interval: 'month',
      },
      nickname: 'Semiprofesional Mensual',
    });
    
    console.log('Creating yearly price for Semiprofesional...');
    const semiproYearly = await stripe.prices.create({
      product: semiproProduct.id,
      unit_amount: 3795, // €37.95
      currency: 'eur',
      recurring: {
        interval: 'year',
      },
      nickname: 'Semiprofesional Anual',
    });
    
    // Create professional subscription
    console.log('Creating Profesional product...');
    const proProduct = await stripe.products.create({
      name: 'FutboLink Profesional',
      description: 'Suscripción Profesional a FutboLink',
    });
    
    console.log(`Created product: ${proProduct.name} (${proProduct.id})`);
    
    // Create prices for professional subscription
    console.log('Creating monthly price for Profesional...');
    const proMonthly = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 795, // €7.95
      currency: 'eur',
      recurring: {
        interval: 'month',
      },
      nickname: 'Profesional Mensual',
    });
    
    console.log('Creating yearly price for Profesional...');
    const proYearly = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 7595, // €75.95
      currency: 'eur',
      recurring: {
        interval: 'year',
      },
      nickname: 'Profesional Anual',
    });
    
    // Summary
    console.log('\n----- SUBSCRIPTION SETUP COMPLETE -----');
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
    console.error('Error creating Stripe products and prices:', error.message);
    console.error('Full error:', error);
  }
}

// Run the setup
createStripeProducts(); 