# 🌍 Hybrid Translation System

## Overview

Movesbook now uses a **hybrid translation system** that combines the best of both worlds:

- ✅ **Static files** for fast runtime performance
- ✅ **Database** for easy admin management
- ✅ **Sync system** to keep both in perfect harmony

---

## Architecture

```
┌─────────────────┐
│  Static Files   │ ◄──── Fast runtime serving
│  (i18n.ts)      │
└────────┬────────┘
         │
         │ ◄─── Export from Database
         │ ◄─── Import to Database
         │
┌────────▼────────┐
│   Database      │ ◄──── Admin editing
│  (Translations) │
└─────────────────┘
```

---

## Database Schema

### `languages` Table
- `id` - Unique identifier
- `code` - ISO language code ('en', 'es', etc.)
- `name` - Display name ('English', 'Español', etc.)
- `isActive` - Enable/disable language
- `isDefault` - Fallback language flag
- `createdAt`, `updatedAt` - Timestamps

### `translations` Table
- `id` - Unique identifier
- `key` - Translation key (e.g., 'auth_login_button')
- `languageId` - Foreign key to languages
- `value` - The translated text
- `category` - Category for organization ('button', 'alert', 'navigation', etc.)
- `descriptionEn` - English description for translators
- `lastUpdated`, `createdAt` - Timestamps

**Unique constraint:** `key + languageId` (one translation per key per language)

---

## Admin Panel

Access at: **`/admin/translations`** (Admin login required)

### Features

#### 1. **Translation Grid View**
- Spreadsheet-like interface
- All languages visible side-by-side
- Click any cell to edit inline
- Auto-save on blur or Enter key
- Filter by category
- Search by key or description

#### 2. **Search & Filter**
- **Search bar**: Find by key name or description
- **Category dropdown**: Filter by:
  - `navigation` - Nav bar items
  - `button` - Button labels
  - `authentication` - Login/register
  - `alert` - Alerts and messages
  - `dashboard` - Dashboard content
  - `sidebar` - Sidebar items
  - `settings` - Settings pages
  - `footer` - Footer content
  - `general` - Everything else

#### 3. **Sync Controls**

**Import from Files (Purple Button)**
- Reads current `src/lib/i18n.ts` and `src/lib/translations.ts`
- Updates database with any new keys or changes
- Safe: Won't delete existing translations

**Export to Files (Green Button)**
- Writes database translations to static files
- Overwrites `src/lib/i18n.ts` and `src/lib/translations.ts`
- Auto-generates TypeScript code
- Requires app rebuild/restart to take effect

**Refresh (Blue Button)**
- Reloads data from database
- Use after making bulk changes

---

## Workflow

### For Developers

#### Adding New Translation Keys

1. **Add key to your code:**
   ```tsx
   import { useLanguage } from '@/hooks/useLanguage';
   
   function MyComponent() {
     const { t } = useLanguage();
     
     return <button>{t('my_new_button_key')}</button>;
   }
   ```

2. **Add English translation to `src/lib/i18n.ts`:**
   ```typescript
   'my_new_button_key': 'Click Me!',
   ```

3. **Add translations for other languages in `src/lib/translations.ts`:**
   ```typescript
   export function getSpanishStrings(): LanguageStrings {
     return {
       // ... other keys
       'my_new_button_key': '¡Haz clic aquí!',
     };
   }
   ```

4. **Sync to database:**
   - Login as admin
   - Go to `/admin/translations`
   - Click **"Import from Files"**
   - Your new key is now in the database!

#### Key Naming Convention

Use descriptive prefixes:

```
nav_*          - Navigation items        (nav_home, nav_about)
btn_*          - Buttons                 (btn_save, btn_cancel)
auth_*         - Authentication          (auth_login, auth_password)
alert_*        - Alerts/messages         (alert_success, alert_error)
dashboard_*    - Dashboard content       (dashboard_overview)
sidebar_*      - Sidebar items           (sidebar_profile)
settings_*     - Settings pages          (settings_language)
form_*         - Form labels             (form_email, form_name)
error_*        - Error messages          (error_required)
success_*      - Success messages        (success_saved)
```

### For Translators/Admins

#### Editing Existing Translations

1. Login as admin (`/admin/login`)
2. Navigate to **`/admin/translations`**
3. Use search/filter to find the translation
4. Click on the cell you want to edit
5. Type the new translation
6. Press Enter or click outside to save
7. *(Optional)* Click **"Export to Files"** to sync changes to static files

#### Adding New Keys (Admin Panel)

Currently, new keys must be added via code first. Future enhancement will allow admins to create keys directly.

#### Bulk Translation Tips

**Method 1: Edit in Admin Panel**
- Filter by category
- Translate all visible items
- No code changes needed
- Click "Export to Files" when done

**Method 2: Edit Static Files**
- Edit `src/lib/translations.ts` directly
- Use find/replace for bulk changes
- Click "Import from Files" to sync to database

---

## Best Practices

### ✅ DO

- Always provide English translation (default language)
- Use descriptive, unique keys
- Group related keys with prefixes
- Keep translations in sync with code changes
- Export to files before deploying to production
- Test in multiple languages

### ❌ DON'T

- Hard-code user-visible text
- Duplicate keys with different meanings
- Delete keys that might be in use
- Forget to sync after major changes

---

## Production Deployment

### Before Deployment Checklist

1. ✅ All new keys have English translations
2. ✅ Database is up to date (Import from Files)
3. ✅ All translations reviewed
4. ✅ **Export to Files** (CRITICAL!)
5. ✅ Commit static files to Git
6. ✅ Rebuild application (`npm run build`)
7. ✅ Test in production

### Why Export Before Deploy?

The **production app serves translations from static files**, not the database. This ensures:
- ⚡ Fast performance (no database queries)
- 🔒 Reliability (works even if DB is down)
- 📦 Self-contained builds

---

## Troubleshooting

### "Translation not showing in app"

1. Check if key exists in `src/lib/i18n.ts`
2. Check if translation is in database
3. Click "Export to Files" in admin panel
4. Restart dev server or rebuild app

### "Can't edit translations"

1. Make sure you're logged in as admin
2. Check browser console for errors
3. Verify database connection

### "Import from Files" not working

1. Make sure `src/lib/i18n.ts` has valid TypeScript
2. Check file permissions
3. Look for syntax errors in console

### "Language not appearing"

1. Verify language is marked `isActive` in database
2. Check that all keys have translations for that language
3. Restart app to reload language list

---

## API Endpoints

For advanced integrations:

- `GET /api/admin/translations` - List all translations
- `GET /api/admin/translations/languages` - List languages
- `POST /api/admin/translations/update` - Update single translation
- `POST /api/admin/translations/export` - Export to static files
- `POST /api/admin/translations/sync` - Import from static files

---

## Future Enhancements

Possible additions:

- ✨ Create new keys directly in admin panel
- ✨ Translation status tracking (missing/incomplete)
- ✨ Bulk import/export via CSV or JSON
- ✨ Translation memory and suggestions
- ✨ Multi-user translation with approval workflow
- ✨ Auto-translate using AI/translation APIs
- ✨ Version history and rollback
- ✨ Context preview (show where translation is used)

---

## Current Languages

1. 🇬🇧 English (en) - Default
2. 🇪🇸 Spanish (es)
3. 🇨🇳 Chinese (zh)
4. 🇮🇳 Hindi (hi)
5. 🇸🇦 Arabic (ar)
6. 🇵🇹 Portuguese (pt)
7. 🇮🇹 Italian (it)
8. 🇷🇺 Russian (ru)
9. 🇫🇷 French (fr)
10. 🇩🇪 German (de)

Total: **300+ translation keys** across **10 languages** = **3,000+ translations**

---

## Summary

The hybrid system gives you:

- 🚀 **Fast runtime** (static files)
- 🎨 **Easy editing** (admin panel)
- 🔄 **Seamless sync** (two-way import/export)
- 💪 **Best of both worlds**

**Remember:** Always click "Export to Files" before production deployment!

