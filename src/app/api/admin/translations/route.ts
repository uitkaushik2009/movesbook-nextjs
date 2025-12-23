import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET(request: NextRequest) {
  try {
    // Fetch all translations (no language relationship in current schema)
    const dbTranslations = await prisma.translation.findMany({
      orderBy: { key: 'asc' },
    });

    console.log(`📊 Fetched ${dbTranslations.length} translations from database`);

    // Group translations by key
    const translationsMap: Record<string, any> = {};
    const categoriesSet = new Set<string>();

    for (const trans of dbTranslations) {
      if (!translationsMap[trans.key]) {
        translationsMap[trans.key] = {
          key: trans.key,
          category: trans.category || 'general',
          isDeleted: trans.isDeleted || false,
          values: {},
        };
      }
      
      // Use language string directly (not language.code)
      translationsMap[trans.key].values[trans.language] = trans.value;
      
      // Update isDeleted if ANY translation for this key is deleted
      if (trans.isDeleted) {
        translationsMap[trans.key].isDeleted = true;
      }
      
      // Add category to set
      if (trans.category) {
        categoriesSet.add(trans.category);
      }
    }

    const translations = Object.values(translationsMap);
    const categories = Array.from(categoriesSet).sort();

    console.log(`✅ Returning ${translations.length} translation keys in ${categories.length} categories`);

    return NextResponse.json({
      success: true,
      translations,
      categories,
    });
  } catch (error) {
    console.error('Error fetching translations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch translations' },
      { status: 500 }
    );
  }
}

