#!/bin/bash

# Make sure TypeORM CLI is installed
npm install -g typeorm

# Run the migration
npm run migration:run

echo "Migration completed! The foreign key constraint issue should now be fixed."
echo "Users with applications can now be deleted successfully." 