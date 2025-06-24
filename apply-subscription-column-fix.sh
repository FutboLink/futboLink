#!/bin/bash

# This script applies the subscription column fix to the Render database

# Get the current directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Instructions
echo "============================================"
echo "Subscription Column Fix Script"
echo "============================================"
echo ""
echo "This script will add the missing subscription columns to your database."
echo ""
echo "To use this script:"
echo "1. Make sure you have the PostgreSQL client (psql) installed"
echo "2. You need the database connection URL from your Render dashboard"
echo ""
echo "Steps to get the connection URL from Render:"
echo "1. Log in to render.com"
echo "2. Go to your PostgreSQL service"
echo "3. Under 'Connections', copy the 'Internal Database URL'"
echo ""

# Ask for the database URL
read -p "Enter your Render PostgreSQL connection URL: " DB_URL

if [ -z "$DB_URL" ]; then
    echo "Error: No database URL provided."
    exit 1
fi

# Apply the migration
echo ""
echo "Applying the subscription column fix..."

# Run the SQL file through psql
psql "$DB_URL" -f "$DIR/apply-subscription-column-fix.sql"

# Check if the migration was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "============================================"
    echo "✅ Migration completed successfully!"
    echo "============================================"
    echo ""
    echo "The subscriptionType and subscriptionExpiresAt columns have been added to your users table."
    echo "Your login functionality should now work properly."
    echo ""
    echo "Next steps:"
    echo "1. Restart your backend service on Render"
    echo "2. Try logging in again"
else
    echo ""
    echo "============================================"
    echo "❌ Migration failed!"
    echo "============================================"
    echo ""
    echo "There was an issue applying the migration. Please check the error message above."
fi 