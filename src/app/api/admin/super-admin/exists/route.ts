import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const count = await prisma.superAdmin.count();
    
    return NextResponse.json({
      exists: count > 0,
      count
    });
  } catch (error) {
    console.error('Error checking Super Admin existence:', error);
    return NextResponse.json({ exists: false, count: 0 });
  } finally {
    await prisma.$disconnect();
  }
}

