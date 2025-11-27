import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received translation update request:', body);

    // Check if this is a delete/restore operation (only isDeleted field)
    if (body.isDeleted !== undefined && body.key && !body.translations) {
      const { key, isDeleted } = body;
      
      console.log(`Updating isDeleted status for key: ${key} to ${isDeleted}`);
      
      // Update all translations for this key to set isDeleted
      const updateResult = await prisma.translation.updateMany({
        where: { key },
        data: { isDeleted },
      });
      
      return NextResponse.json({
        success: true,
        message: `Updated ${updateResult.count} translation(s) delete status`,
        count: updateResult.count,
      });
    }

    // Check if this is bulk update (new format: { key, translations, category })
    // or single update (old format: { key, languageCode, value })
    if (body.translations && typeof body.translations === 'object') {
      // Bulk update for all languages
      const { key, translations, category } = body;

      if (!key || !translations) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields (key, translations)' },
          { status: 400 }
        );
      }

      console.log(`Bulk updating translations for key: ${key} with category: ${category || 'general'}`);
      const results = [];
      const translationCategory = category || 'general';

      // Update each language
      for (const [languageCode, value] of Object.entries(translations)) {
        try {
          // Find the language
          const language = await prisma.language.findUnique({
            where: { code: languageCode },
          });

          if (!language) {
            console.warn(`Language ${languageCode} not found in database`);
            continue;
          }

          // Update the translation
          const translation = await prisma.translation.upsert({
            where: {
              key_languageId: {
                key,
                languageId: language.id,
              },
            },
            update: {
              value: value as string || '',
              category: translationCategory,
            },
            create: {
              key,
              languageId: language.id,
              value: value as string || '',
              category: translationCategory,
              descriptionEn: `Translation for ${key}`,
            },
          });

          results.push({ languageCode, success: true });
          console.log(`✅ Updated ${languageCode} translation for ${key}`);
        } catch (error) {
          console.error(`Error updating ${languageCode} for ${key}:`, error);
          results.push({ languageCode, success: false, error: String(error) });
        }
      }

      return NextResponse.json({
        success: true,
        message: `Updated ${results.filter(r => r.success).length} language(s)`,
        results,
      });

    } else {
      // Single language update (old format)
      const { key, languageCode, value } = body;

      if (!key || !languageCode) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields (key, languageCode)' },
          { status: 400 }
        );
      }

      // Find the language
      const language = await prisma.language.findUnique({
        where: { code: languageCode },
      });

      if (!language) {
        return NextResponse.json(
          { success: false, error: 'Language not found' },
          { status: 404 }
        );
      }

      // Update the translation
      const translation = await prisma.translation.upsert({
        where: {
          key_languageId: {
            key,
            languageId: language.id,
          },
        },
        update: {
          value: value || '',
        },
        create: {
          key,
          languageId: language.id,
          value: value || '',
          category: 'general',
          descriptionEn: `Translation for ${key}`,
        },
      });

      return NextResponse.json({
        success: true,
        translation,
      });
    }
  } catch (error) {
    console.error('Error updating translation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update translation' },
      { status: 500 }
    );
  }
}

