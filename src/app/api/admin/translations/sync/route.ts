import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { i18n } from '@/lib/i18n';

const prisma = new PrismaClient();

const LANGUAGE_MAP: Record<string, string> = {
  'en': 'English',
  'es': 'Español',
  'zh': '中文',
  'hi': 'हिन्दी',
  'ar': 'العربية',
  'pt': 'Português',
  'it': 'Italiano',
  'ru': 'Русский',
  'fr': 'Français',
  'de': 'Deutsch',
};

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting sync from static files to database...');

    // 1. Get all languages from i18n service
    const allLanguages = i18n.getLanguages();
    console.log(`   Found ${allLanguages.length} languages in static files`);

    // 2. Create/update languages in database
    const languageRecords: Record<string, string> = {};
    
    for (const lang of allLanguages) {
      const language = await prisma.language.upsert({
        where: { code: lang.code },
        update: {
          name: LANGUAGE_MAP[lang.code] || lang.name,
          isActive: true,
        },
        create: {
          code: lang.code,
          name: LANGUAGE_MAP[lang.code] || lang.name,
          isDefault: lang.code === 'en',
          isActive: true,
        },
      });
      languageRecords[lang.code] = language.id;
    }

    // 3. Get all keys from English (the complete set)
    const englishLang = allLanguages.find(l => l.code === 'en');
    if (!englishLang) {
      throw new Error('English language not found in static files');
    }

    const allKeys = Object.keys(englishLang.strings);
    console.log(`   Found ${allKeys.length} translation keys`);

    // Helper to categorize keys
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
      if (key.startsWith('admin_')) return 'admin';
      if (key.startsWith('workout_')) return 'workout';
      if (key.startsWith('form_')) return 'form';
      if (key.startsWith('error_')) return 'error';
      if (key.startsWith('success_')) return 'success';
      return 'general';
    };

    let syncedCount = 0;
    let updatedCount = 0;
    let createdCount = 0;

    // 4. Sync all translations
    for (const key of allKeys) {
      const category = categorizeKey(key);
      const descriptionEn = `Translation for: ${key}`;

      for (const lang of allLanguages) {
        const languageId = languageRecords[lang.code];
        const value = lang.strings[key] || '';

        const result = await prisma.translation.upsert({
          where: {
            key_languageId: {
              key,
              languageId,
            },
          },
          update: {
            value,
            category,
          },
          create: {
            key,
            languageId,
            value,
            category,
            descriptionEn,
          },
        });

        syncedCount++;
        
        // Track if it was an update or create based on the lastUpdated timestamp
        const wasJustCreated = new Date(result.createdAt).getTime() === new Date(result.lastUpdated).getTime();
        if (wasJustCreated) {
          createdCount++;
        } else {
          updatedCount++;
        }
      }
    }

    console.log(`✅ Sync complete: ${syncedCount} translations synced`);
    console.log(`   Created: ${createdCount}, Updated: ${updatedCount}`);

    return NextResponse.json({
      success: true,
      message: 'Translations synced from static files successfully',
      stats: {
        totalSynced: syncedCount,
        created: createdCount,
        updated: updatedCount,
        keys: allKeys.length,
        languages: allLanguages.length,
      },
    });
  } catch (error) {
    console.error('Error syncing translations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync translations' },
      { status: 500 }
    );
  }
}

