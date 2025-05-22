#!/bin/bash

echo "Stopping current server process..."
pkill -f "node.*dist/main"

echo "Starting server with fixed subscription type mapping..."
cd back && npm run start:dev &

echo "Server restarted! Please wait approximately 30 seconds for it to fully load."
echo "You can now refresh your subscription page to see the correct subscription type."
echo "If you still see an incorrect subscription type, clear browser cache and try again."
echo ""
echo "To refresh all subscription types in the database, call this endpoint:"
echo "POST /payments/subscription/refresh-types" 