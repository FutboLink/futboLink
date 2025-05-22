## Migrations

To run the latest migration, use the following command:

```bash
npm run migration:run
```

### Foreign Key Constraint Fix

A migration has been added to fix the foreign key constraint issue when deleting users who have related application records. This migration adds a CASCADE delete to the relationship so that when a user is deleted, all their applications are automatically deleted as well.

This fixes the error that was occurring when attempting to delete users from the admin panel. 