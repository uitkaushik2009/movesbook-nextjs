import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Fetch all languages
    const languages = await prisma.language.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    });

    // Fetch all translations
    const dbTranslations = await prisma.translation.findMany({
      include: {
        language: true,
      },
      orderBy: { key: 'asc' },
    });

    // Group translations by key
    const translationsMap: Record<string, any> = {};
    const categoriesSet = new Set<string>();

    for (const trans of dbTranslations) {
      if (!translationsMap[trans.key]) {
        translationsMap[trans.key] = {
          key: trans.key,
          category: trans.category,
          descriptionEn: trans.descriptionEn,
          values: {},
        };
      }
      translationsMap[trans.key].values[trans.language.code] = trans.value;
      categoriesSet.add(trans.category);
    }

    const translations = Object.values(translationsMap);
    const categories = Array.from(categoriesSet).sort();

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

