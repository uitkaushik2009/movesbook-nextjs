import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');

    if (!language) {
      return NextResponse.json(
        { success: false, error: 'Language parameter required' },
        { status: 400 }
      );
    }

    // Try to load from file system
    const defaultsDir = path.join(process.cwd(), 'config', 'favourites-defaults');
    const filePath = path.join(defaultsDir, `${language}.json`);

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const favouritesData = JSON.parse(fileContent);

      console.log(`✅ Loaded favourites defaults for language: ${language}`);

      return NextResponse.json({
        success: true,
        favouritesData,
        language
      });
    } catch (error) {
      // File doesn't exist - return empty
      console.log(`ℹ️ No custom defaults found for language: ${language}`);
      
      return NextResponse.json({
        success: false,
        error: 'No defaults found for this language',
        favouritesData: null
      }, { status: 404 });
    }

  } catch (error) {
    console.error('Error loading favourites defaults:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

