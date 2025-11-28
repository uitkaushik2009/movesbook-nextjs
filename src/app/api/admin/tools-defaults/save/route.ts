import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { language, toolsData, password } = await request.json();

    // Verify password against database
    const verifyResponse = await fetch(`${request.nextUrl.origin}/api/admin/super-admin/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    const verifyData = await verifyResponse.json();
    
    if (!verifyData.valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid Super Admin password' },
        { status: 401 }
      );
    }

    // Validate inputs
    if (!language || !toolsData) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save to Prisma database using upsert (create or update)
    await prisma.toolsDefaults.upsert({
      where: { language },
      update: {
        data: toolsData,
        updatedAt: new Date()
      },
      create: {
        language,
        data: toolsData
      }
    });

    console.log(`✅ Saved tools defaults to database for language: ${language}`);

    return NextResponse.json({
      success: true,
      message: `Tools defaults saved for ${language}`
    });

  } catch (error) {
    console.error('Error saving tools defaults:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
