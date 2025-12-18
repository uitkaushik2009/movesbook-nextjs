import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function PATCH(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { movelaps } = await request.json();

    if (!movelaps || !Array.isArray(movelaps)) {
      return NextResponse.json({ error: 'Invalid movelaps data' }, { status: 400 });
    }

    // Update each movelap's repetitionNumber (order) in a transaction
    await prisma.$transaction(
      movelaps.map((ml: { id: string; repetitionNumber: number }) =>
        prisma.movelap.update({
          where: { id: ml.id },
          data: { repetitionNumber: ml.repetitionNumber }
        })
      )
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Movelaps reordered successfully',
      count: movelaps.length 
    });

  } catch (error) {
    console.error('Error reordering movelaps:', error);
    return NextResponse.json(
      { error: 'Failed to reorder movelaps' },
      { status: 500 }
    );
  }
}

