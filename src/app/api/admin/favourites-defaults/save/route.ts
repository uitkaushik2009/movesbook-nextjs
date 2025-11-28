import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// Super Admin password (in production, store this securely)
const SUPER_ADMIN_PASSWORD = 'admin123'; // TODO: Move to environment variable

export async function POST(request: NextRequest) {
  try {
    const { language, favouritesData, password } = await request.json();

    // Validate password
    if (password !== SUPER_ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: 'Invalid Super Admin password' },
        { status: 401 }
      );
    }

    // Validate inputs
    if (!language || !favouritesData) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save to file system
    const defaultsDir = path.join(process.cwd(), 'config', 'favourites-defaults');
    
    try {
      await fs.mkdir(defaultsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }

    const filePath = path.join(defaultsDir, `${language}.json`);
    await fs.writeFile(filePath, JSON.stringify(favouritesData, null, 2));

    console.log(`✅ Saved favourites defaults for language: ${language}`);

    return NextResponse.json({
      success: true,
      message: `Favourites defaults saved for ${language}`
    });

  } catch (error) {
    console.error('Error saving favourites defaults:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

