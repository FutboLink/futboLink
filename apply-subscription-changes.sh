#!/bin/bash

echo "Stopping current server process..."
pkill -f "node.*dist/main"

echo "Starting server with updated subscription IDs..."
cd back && npm run start:dev &

echo "Server restarted! Please wait approximately 30 seconds for it to fully load."
echo "You can now test the Semiprofesional subscription with the updated IDs:"
echo ""
echo "Product ID: prod_S1PExFzjXvaE7E"
echo "Price ID: price_1R7MPlGbCHvHfqXFNjW8oj2k"
echo ""
echo "To refresh all subscription types in the database, call this endpoint:"
echo "POST /payments/subscription/refresh-types" 