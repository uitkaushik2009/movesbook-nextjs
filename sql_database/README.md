# Database Split Summary

## Overview
Your `moves.sql` database has been successfully split into **145 category-based files** for easier management and import.

## File Statistics

### Original Database
- **File**: `moves.sql`
- **Size**: 32.8 MB (32,845,544 bytes)
- **Total Tables**: 414 tables
- **Issue**: Too large to import directly

### Split Result
- **Total Files Created**: 145 SQL files
- **Categories**: Organized by table functionality
- **All files are now smaller and importable**

## Largest Split Files

Here are the top 15 largest files after splitting:

| File Name | Size | Tables |
|-----------|------|--------|
| section_tables.sql | 23.0 MB | 1 table |
| users_tables.sql | 3.0 MB | 11 tables |
| other_tables.sql | 1.3 MB | 32 tables |
| cards_tables.sql | 1.1 MB | 15 tables |
| club_tables_tables.sql | 572 KB | 33 tables |
| language_tables.sql | 320 KB | 3 tables |
| news_tables.sql | 297 KB | 8 tables |
| messages_tables.sql | 261 KB | 1 table |
| admin_tables.sql | 213 KB | 3 tables |
| statistics_tables.sql | 181 KB | 2 tables |
| athletes_tables.sql | 180 KB | 2 tables |
| aros_acos_tables.sql | 155 KB | 3 tables |
| help_tables.sql | 153 KB | 8 tables |
| food_tables.sql | 146 KB | 2 tables |
| homepg_tables.sql | 123 KB | 2 tables |

## File Categories

The database has been split into the following categories:

### Core Tables
- **users_tables.sql** - User accounts and profiles
- **admin_tables.sql** - Administrative settings and users
- **clubs_tables** - Club-related tables (settings, members, payments, features, cardreaders)

### Access & Security
- **access_control_tables.sql** - Access control panels and settings
- **security_tables.sql** - Security settings
- **roles_tables.sql** - User roles

### Activities & Sports
- **activity_tables.sql** - Activity tracking
- **sports_tables.sql** - Sports categories
- **athletes_tables.sql** - Athlete profiles and subscriptions
- **teams_tables.sql** - Team management

### Financial
- **cards_tables.sql** - Card systems (magnetic, RFID, smartcards, purchases)
- **finance_tables.sql** - Financial transactions
- **subscriptions_tables.sql** - Subscription management
- **payments_tables** - Part of club_payments_tables.sql

### Content & Communication
- **news_tables.sql** - News and announcements
- **messages_tables.sql** - Messaging system
- **posts_tables.sql** - User posts
- **comments_tables.sql** - Comments on various content
- **notifications_tables.sql** - User notifications
- **email_tables.sql** - Email management

### Media & Content
- **albums_tables.sql** - Photo albums
- **media_tables.sql** - Media files
- **banners_tables.sql** - Banner advertisements
- **blogs_tables.sql** - Blog posts

### Events & Bookings
- **events_tables.sql** - Event management
- **reservations_tables.sql** - Booking system
- **lanes_tables.sql** - Lane assignments

### Support & Help
- **help_tables.sql** - Help documentation
- **faq_tables.sql** - Frequently asked questions
- **assistance_tables.sql** - Support tickets
- **feedback_tables.sql** - User feedback

### Settings & Configuration
- **settings_tables.sql** - General settings
- **language_tables.sql** - Multi-language support
- **devices_tables.sql** - Device management
- **audio_tables.sql** - Audio settings

### Social Features
- **social_tables.sql** - Social media integration
- **friendship_tables.sql** - Friend relationships
- **likes_tables.sql** - Like system
- **reviews_tables.sql** - Reviews and ratings

### Other Categories
- **products_tables.sql** - Product catalog
- **guests_tables.sql** - Guest management
- **packages_tables.sql** - Package deals
- **statistics_tables.sql** - Analytics data
- **history_tables.sql** - Historical records
- **food_tables.sql** - Meal/diet management
- **music_tables.sql** - Music playlists

And many more specialized categories...

## How to Import

### Option 1: Import All Tables
To restore the complete database, import files in this recommended order:

1. **Core Structure First**:
   ```sql
   aros_acos_tables.sql
   roles_tables.sql
   security_tables.sql
   ```

2. **Settings & Configuration**:
   ```sql
   settings_tables.sql
   language_tables.sql
   admin_tables.sql
   ```

3. **Core Data Tables**:
   ```sql
   users_tables.sql
   clubs_tables_tables.sql
   club_settings_tables.sql
   ```

4. **Content Tables**:
   ```sql
   news_tables.sql
   posts_tables.sql
   albums_tables.sql
   ```

5. **Everything Else**: Import remaining files in any order

### Option 2: Import Specific Categories
If you only need certain functionality, import only the relevant category files. For example:
- For user management: `users_tables.sql`, `roles_tables.sql`
- For clubs: `clubs_tables_tables.sql`, `club_members_tables.sql`, `club_settings_tables.sql`
- For events: `events_tables.sql`, `reservations_tables.sql`

### Import Commands

**Using MySQL Command Line**:
```bash
mysql -u username -p database_name < split_sql_files/users_tables.sql
```

**Using phpMyAdmin**:
1. Select your database
2. Click "Import" tab
3. Choose file (each file is now small enough)
4. Click "Go"

**Using MySQL Workbench**:
1. Open your connection
2. File → Run SQL Script
3. Select the SQL file
4. Execute

## Special Notes

### Large Table Alert
The `section_tables.sql` file is still 23MB. If this is still too large for your import tool:
- You may need to split it further manually
- Or use command-line import instead of web interfaces
- Or increase your PHP/MySQL upload limits

### Table Dependencies
Some tables have foreign key relationships. If you encounter import errors:
1. Disable foreign key checks: `SET foreign_key_checks = 0;`
2. Import your tables
3. Re-enable foreign key checks: `SET foreign_key_checks = 1;`

### Character Encoding
All files use UTF-8 encoding. Make sure your database is configured for UTF-8:
```sql
CREATE DATABASE your_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Summary Report
See `_SUMMARY.txt` for a complete list of all tables organized by category.

## Support
If you need to:
- Further split any file
- Regroup tables differently
- Modify the categorization

Simply run the `split_sql.py` script again with your customizations.

---

**Generated**: December 1, 2025
**Original File**: moves.sql (32.8 MB)
**Result**: 145 categorized SQL files

