# Internationalization (i18n) System

## Overview

The application now supports **10 languages** for complete internationalization of buttons, texts, and alerts:

1. **English** (en) - Default
2. **Español** (es) - Spanish
3. **中文** (zh) - Chinese (Simplified)
4. **हिन्दी** (hi) - Hindi
5. **العربية** (ar) - Arabic
6. **Português** (pt) - Portuguese
7. **Italiano** (it) - Italian
8. **Русский** (ru) - Russian
9. **Français** (fr) - French
10. **Deutsch** (de) - German

## How to Use

### In Your React Components

```typescript
import { i18n } from '@/lib/i18n';

// Get a translated string
const homeText = i18n.t('nav_home');
const saveButton = i18n.t('btn_save');
const successMessage = i18n.t('alert_save_success');
```

### Change Language

```typescript
import { i18n } from '@/lib/i18n';

// Set the current language
i18n.setLanguage('es'); // Spanish
i18n.setLanguage('zh'); // Chinese
i18n.setLanguage('de'); // German
```

### Get Available Languages

```typescript
import { i18n } from '@/lib/i18n';

// Get all available languages
const languages = i18n.getLanguages();
// Returns: [{ code: 'en', name: 'English', strings: {...} }, ...]
```

## Available Translation Keys

### Navigation
- `nav_home`, `nav_my_page`, `nav_my_club`, `nav_my_team`, `nav_my_group`
- `nav_workouts`, `nav_analytics`, `nav_settings`
- `nav_login`, `nav_register`, `nav_logout`
- `nav_dashboard`, `nav_profile`, `nav_forum`, `nav_news`, `nav_blog`
- `nav_about`, `nav_contact`, `nav_support`

### Buttons
- `btn_add`, `btn_edit`, `btn_delete`, `btn_save`, `btn_cancel`
- `btn_submit`, `btn_confirm`, `btn_print`, `btn_export`, `btn_import`
- `btn_create`, `btn_update`, `btn_remove`, `btn_close`
- `btn_back`, `btn_next`, `btn_previous`, `btn_finish`
- `btn_search`, `btn_filter`, `btn_clear`, `btn_reset`, `btn_apply`
- `btn_upload`, `btn_download`, `btn_share`, `btn_copy`, `btn_move`
- `btn_view`, `btn_more`

### Workout Terms
- `workout_add_new`, `workout_edit`, `workout_delete`, `workout_save`
- `workout_copy`, `workout_move`, `workout_share`, `workout_title`
- `workout_plan`, `workout_history`, `workout_schedule`

### Settings
- `settings_title`, `settings_backgrounds`, `settings_tools`
- `settings_favourites`, `settings_my_best`, `settings_languages`
- `settings_grid`, `settings_account`, `settings_privacy`
- `settings_notifications`, `settings_security`

### Authentication
- `auth_email`, `auth_username`, `auth_password`, `auth_confirm_password`
- `auth_forgot_password`, `auth_reset_password`, `auth_remember_me`
- `auth_sign_in`, `auth_sign_up`, `auth_sign_out`
- `auth_create_account`, `auth_have_account`, `auth_no_account`

### User Types
- `user_type_athlete`, `user_type_coach`, `user_type_club`
- `user_type_team`, `user_type_group`, `user_type_group_admin`

### Dashboard
- `dashboard_welcome`, `dashboard_overview`, `dashboard_statistics`
- `dashboard_recent_activity`, `dashboard_quick_actions`

### Members
- `member_add`, `member_remove`, `member_edit`
- `member_list`, `member_count`

### Common Messages
- `loading`, `success`, `error`, `warning`, `info`
- `confirmation`, `please_wait`, `no_data`, `no_results`

### Alerts
- `alert_delete_confirm` - "Are you sure you want to delete this item?"
- `alert_save_success` - "Saved successfully!"
- `alert_save_error` - "Failed to save. Please try again."
- `alert_delete_success` - "Deleted successfully!"
- `alert_delete_error` - "Failed to delete. Please try again."
- `alert_update_success` - "Updated successfully!"
- `alert_update_error` - "Failed to update. Please try again."
- `alert_create_success` - "Created successfully!"
- `alert_create_error` - "Failed to create. Please try again."
- `alert_required_fields` - "Please fill in all required fields."
- `alert_invalid_email` - "Please enter a valid email address."
- `alert_password_mismatch` - "Passwords do not match."
- `alert_weak_password` - "Password is too weak."

### Common Terms
- `name`, `description`, `date`, `time`, `location`, `status`
- `active`, `inactive`, `pending`, `completed`, `cancelled`
- `yes`, `no`, `all`, `none`
- `select`, `selected`, `actions`, `options`, `details`, `total`
- `search_placeholder`, `filter_by`, `sort_by`
- `show`, `hide`, `expand`, `collapse`
- `view_all`, `show_more`, `show_less`

### Footer
- `footer_about`, `footer_privacy`, `footer_terms`
- `footer_contact`, `footer_help`, `footer_copyright`

## Managing Translations in Settings

Users can manage translations through the **Settings > Languages** section:

1. **Short Texts Tab**: Edit button labels, navigation items, and short text translations
2. **Long Texts Tab**: Manage longer content like descriptions and paragraphs
3. **Add New Language**: Add additional languages beyond the default 10

## Adding New Translation Keys

To add new translation keys:

1. Add the key to the English strings in `src/lib/i18n.ts`
2. Add corresponding translations in `src/lib/translations.ts` for all languages
3. Use the key in your component: `i18n.t('your_new_key')`

## Example Component

```typescript
'use client';

import { useState } from 'react';
import { i18n } from '@/lib/i18n';

export default function ExampleComponent() {
  const [language, setLanguage] = useState('en');

  const changeLanguage = (lang: string) => {
    i18n.setLanguage(lang);
    setLanguage(lang);
  };

  return (
    <div>
      <h1>{i18n.t('nav_home')}</h1>
      <button onClick={() => changeLanguage('es')}>
        {i18n.t('settings_languages')}
      </button>
      <button>{i18n.t('btn_save')}</button>
      <p>{i18n.t('alert_save_success')}</p>
    </div>
  );
}
```

## Long Texts

For longer content (paragraphs, descriptions), use the long text system:

```typescript
import { i18n } from '@/lib/i18n';

// Add a long text
i18n.addLongText({
  variable: 'welcome_message',
  description: 'Welcome message shown on home page',
  content: {
    en: 'Welcome to Movesbook! Start your fitness journey today.',
    es: '¡Bienvenido a Movesbook! Comienza tu viaje de fitness hoy.',
    zh: '欢迎来到Movesbook！今天开始您的健身之旅。',
    // ... other languages
  }
});

// Get the long text in current language
const welcomeText = i18n.getLongText('welcome_message');

// Get in specific language
const welcomeTextEs = i18n.getLongText('welcome_message', 'es');
```

## Best Practices

1. **Always use translation keys** instead of hardcoded text
2. **Provide fallbacks** - The system automatically falls back to English if a translation is missing
3. **Use semantic key names** - e.g., `btn_save` instead of `save_text`
4. **Group related keys** - Use prefixes like `nav_`, `btn_`, `alert_`
5. **Test all languages** - Ensure UI accommodates longer text in some languages
6. **RTL Support** - Arabic text requires right-to-left layout support (to be implemented)

## File Structure

```
src/
  lib/
    i18n.ts          # Core i18n service and English translations
    translations.ts   # Additional language translations
  components/
    settings/
      LanguageSettings.tsx  # UI for managing translations
```

## Notes

- Translations are stored in memory and reset on page refresh
- Consider implementing localStorage persistence for user language preferences
- The settings page bundle size increased from 16.8 kB to 25.8 kB due to translation data
- All 10 languages are loaded by default (lazy loading could be implemented for optimization)

