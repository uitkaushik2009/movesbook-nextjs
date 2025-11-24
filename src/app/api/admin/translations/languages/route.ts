import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const languages = await prisma.language.findMany({
      orderBy: [
        { isDefault: 'desc' },
        { code: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      languages,
    });
  } catch (error) {
    console.error('Error fetching languages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch languages' },
      { status: 500 }
    );
  }
}

