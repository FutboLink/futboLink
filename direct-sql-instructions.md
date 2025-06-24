# Fix for the Missing Subscription Columns

## Problem
The error message shows that the `subscriptionType` column is missing in the database, causing login failures:

```
error: column User.subscriptionType does not exist
```

## Solution - Using Render Console

### Step 1: Log in to Render Dashboard
1. Go to https://dashboard.render.com
2. Log in to your account

### Step 2: Access Your PostgreSQL Database
1. From the dashboard, locate and click on your PostgreSQL database service
2. In the database dashboard, look for the "Connect" button or "Shell" tab

### Step 3: Open the PostgreSQL Console
1. Click on "Shell" or "Connect" > "Open Console"
2. This will open a PostgreSQL command prompt

### Step 4: Run the SQL Commands
Copy and paste the following SQL commands into the console:

```sql
-- Add subscriptionType column with default value 'Amateur'
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "subscriptionType" VARCHAR DEFAULT 'Amateur';

-- Add subscriptionExpiresAt column
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "subscriptionExpiresAt" TIMESTAMP;
```

### Step 5: Verify the Changes
Run this command to confirm that the columns were added successfully:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND (column_name = 'subscriptionType' OR column_name = 'subscriptionExpiresAt');
```

### Step 6: Restart Your Backend Service
1. Go back to the Render dashboard
2. Find your backend service
3. Click on "Manual Deploy" > "Deploy latest commit" or use the "Restart" option

## Solution - Using Local Script
Alternatively, you can run the provided script from your local machine:

1. Open a terminal
2. Navigate to your project directory
3. Run the script:
   ```
   ./apply-subscription-column-fix.sh
   ```
4. When prompted, enter your Render PostgreSQL connection URL (found in the Render dashboard under "Connections")

After applying these changes, your login functionality should work again, and the subscription management features will function correctly. 