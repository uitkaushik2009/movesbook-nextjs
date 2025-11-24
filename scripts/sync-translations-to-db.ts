/**
 * Script to sync current static translations to database
 * Run with: npx ts-node scripts/sync-translations-to-db.ts
 */

import { PrismaClient } from '@prisma/client';
import { i18n } from '../src/lib/i18n.js';

const prisma = new PrismaClient();

const LANGUAGES = [
  { code: 'en', name: 'English', isDefault: true },
  { code: 'es', name: 'Español', isDefault: false },
  { code: 'zh', name: '中文', isDefault: false },
  { code: 'hi', name: 'हिन्दी', isDefault: false },
  { code: 'ar', name: 'العربية', isDefault: false },
  { code: 'pt', name: 'Português', isDefault: false },
  { code: 'it', name: 'Italiano', isDefault: false },
  { code: 'ru', name: 'Русский', isDefault: false },
  { code: 'fr', name: 'Français', isDefault: false },
  { code: 'de', name: 'Deutsch', isDefault: false },
];

async function main() {
  console.log('🚀 Starting translation sync to database...\n');

  // 1. Create languages
  console.log('📝 Creating languages...');
  const languageRecords: Record<string, string> = {};
  
  for (const lang of LANGUAGES) {
    const language = await prisma.language.upsert({
      where: { code: lang.code },
      update: { name: lang.name, isDefault: lang.isDefault, isActive: true },
      create: { code: lang.code, name: lang.name, isDefault: lang.isDefault, isActive: true },
    });
    languageRecords[lang.code] = language.id;
    console.log(`  ✓ ${lang.name} (${lang.code})`);
  }

  console.log('\n📚 Syncing translations...');
  
  // 2. Get all translation keys from English (the default language)
  const allLanguages = i18n.getLanguages();
  const englishLang = allLanguages.find(l => l.code === 'en');
  
  if (!englishLang) {
    throw new Error('English language not found!');
  }

  const allKeys = Object.keys(englishLang.strings);
  console.log(`  Found ${allKeys.length} translation keys\n`);

  let translationCount = 0;
  let categoryMap: Record<string, string> = {};

  // Categorize keys based on prefixes
  const categorizeKey = (key: string): string => {
    if (key.startsWith('nav_')) return 'navigation';
    if (key.startsWith('btn_')) return 'button';
    if (key.startsWith('auth_')) return 'authentication';
    if (key.startsWith('alert_')) return 'alert';
    if (key.startsWith('dashboard_')) return 'dashboard';
    if (key.startsWith('sidebar_')) return 'sidebar';
    if (key.startsWith('settings_')) return 'settings';
    if (key.startsWith('color_')) return 'color';
    if (key.startsWith('footer_')) return 'footer';
    if (key.startsWith('home_')) return 'home';
    if (key.startsWith('user_')) return 'user';
    return 'general';
  };

  // 3. For each key, create translations for all languages
  for (const key of allKeys) {
    const category = categorizeKey(key);
    const descriptionEn = `Translation for: ${key}`;

    for (const lang of allLanguages) {
      const languageId = languageRecords[lang.code];
      const value = lang.strings[key] || '';

      await prisma.translation.upsert({
        where: {
          key_languageId: {
            key,
            languageId,
          },
        },
        update: {
          value,
          category,
          descriptionEn,
        },
        create: {
          key,
          languageId,
          value,
          category,
          descriptionEn,
        },
      });

      translationCount++;
    }

    // Progress indicator
    if (translationCount % 100 === 0) {
      console.log(`  Synced ${translationCount} translations...`);
    }
  }

  console.log(`\n✅ Successfully synced ${translationCount} translations!`);
  console.log(`   ${allKeys.length} keys × ${allLanguages.length} languages\n`);

  // 4. Show summary by category
  const summary = await prisma.translation.groupBy({
    by: ['category'],
    _count: true,
  });

  console.log('📊 Summary by category:');
  for (const item of summary) {
    const totalKeys = item._count / allLanguages.length;
    console.log(`   ${item.category}: ${totalKeys} keys`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

