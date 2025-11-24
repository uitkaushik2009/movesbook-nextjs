import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { key, languageCode, value } = await request.json();

    if (!key || !languageCode) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
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
  } catch (error) {
    console.error('Error updating translation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update translation' },
      { status: 500 }
    );
  }
}

