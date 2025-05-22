#!/bin/bash

echo "Stopping current server process..."
pkill -f "node.*dist/main"

echo "Running the subscription type migration..."
cd back && npm run migration:run

echo "Starting server with explicit subscription type tracking..."
npm run start:dev &

echo "Server restarted! Please wait approximately 30 seconds for it to fully load."
echo "Your subscription type will now be explicitly stored and tracked, preventing any mix-ups."
echo ""
echo "To refresh all subscription types in the database, call this endpoint:"
echo "POST /payments/subscription/refresh-types"
echo ""
echo "This will update all existing subscription records with the correct subscription type." 