import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const settings = await prisma.superAdminSettings.findFirst();
    
    return NextResponse.json({
      email: settings?.email || null
    });
  } catch (error) {
    console.error('Error loading Super Admin email:', error);
    return NextResponse.json({ email: null });
  } finally {
    await prisma.$disconnect();
  }
}

