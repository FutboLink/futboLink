# Changelog

## [Unreleased]

### Fixed
- Added explicit subscriptionType field to payment records to prevent incorrect subscription type identification
- Created migration to update existing payment records with the correct subscription type
- Updated all subscription handling code to use and maintain the explicit subscription type
- Updated Semiprofesional subscription product ID to "prod_S1PExFzjXvaE7E" and price ID to "price_1R7MPlGbCHvHfqXFNjW8oj2k"
- Subscription type mapping issue where users subscribing to Semiprofesional plan were incorrectly shown as Profesional subscribers
- Foreign key constraint error when deleting users with applications by implementing CASCADE delete
- Added migration to update database relationships
- Modified Application entity to include onDelete: 'CASCADE' for the player relationship

## [Earlier changes]
- Fixed YouTube video display in user.tsx by implementing responsive padding-based approach
- Addressed notification positioning issues in ProfileUser component
- Improved contact form functionality with better error handling
- Updated manager.tsx profile section to match player information layout
- Updated Semiprofesional subscription product ID and price ID 