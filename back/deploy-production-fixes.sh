#!/bin/bash
# Script to deploy Stripe integration fixes to production

echo "Deploying Stripe integration fixes to production environment..."

# Set environment to production for testing
export NODE_ENV=production

# Run production environment setup
echo "Running production environment setup..."
node production-setup.js

# Make sure we have the latest dependencies
echo "Updating dependencies..."
npm ci

# Run the diagnostic tests
echo "Running connectivity diagnostics..."
node test-server-connectivity.js
node test-production-issues.js

# Create a backup of current service file
echo "Creating backup of current stripe service..."
cp src/payments/services/stripe.service.ts src/payments/services/stripe.service.ts.bak

# Create backup of environment variables
echo "Checking environment variables..."
if [ ! -f .env.bak ]; then
  cp .env .env.bak
  echo "Created .env backup at .env.bak"
fi

# Make sure stripe-fallback.json is in the right place
echo "Ensuring fallback configuration is available..."
if [ -f "stripe-fallback.json" ]; then
  cp stripe-fallback.json src/payments/config/
  echo "Copied stripe fallback configuration to src/payments/config/"
fi

# Build the application
echo "Building application with fixes..."
npm run build

# Run database migrations if needed
if [ -d "src/migrations" ]; then
  echo "Running database migrations..."
  npm run migration:run
fi

# Test the build
echo "Testing the build..."
npm run test:e2e -- --testPathIgnorePatterns=auth --testPathPattern=payments

echo ""
echo "============================================================"
echo "Deployment preparation complete!"
echo ""
echo "To complete the deployment to your production environment:"
echo ""
echo "1. Commit your changes and push to your deployment branch"
echo "   git add ."
echo "   git commit -m \"Fix: Stripe integration with enhanced retry and fallback mechanisms\""
echo "   git push origin master"
echo ""
echo "2. If using a CI/CD pipeline, monitor the deployment logs"
echo ""
echo "3. After deployment, verify the fixes by:"
echo "   - Checking the server logs for Stripe connection messages"
echo "   - Testing a subscription purchase flow end-to-end"
echo "   - Confirming webhook processing is working"
echo ""
echo "4. If issues persist in production, run these commands on the server:"
echo "   node test-production-issues.js"
echo "   node production-setup.js"
echo "============================================================" 