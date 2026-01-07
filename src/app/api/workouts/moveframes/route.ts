import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';


// Helper function to convert display rest type to enum value
function convertRestTypeToEnum(restType: string | null | undefined): string | null {
  if (!restType || restType.trim() === '') return null;
  
  const mapping: Record<string, string> = {
    'Set time': 'SET_TIME',
    'Restart time': 'RESTART_TIME',
    'Restart pulse': 'RESTART_PULSE',
    'SET_TIME': 'SET_TIME', // Already correct
    'RESTART_TIME': 'RESTART_TIME', // Already correct
    'RESTART_PULSE': 'RESTART_PULSE' // Already correct
  };
  
  return mapping[restType] || null;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('POST /api/workouts/moveframes - Request received');
    
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const {
      workoutSessionId,
      sport,
      sectionId,
      type,
      description,
      notes,
      macroFinal,
      alarm,
      annotationText,
      annotationBgColor,
      annotationTextColor,
      annotationBold,
      movelaps,
      manualMode
    } = body;
    
    // Validate required fields
    if (!workoutSessionId) {
      console.error('Missing workoutSessionId');
      return NextResponse.json({ error: 'workoutSessionId is required' }, { status: 400 });
    }
    if (!sport) {
      console.error('Missing sport');
      return NextResponse.json({ error: 'sport is required' }, { status: 400 });
    }
    // Movelaps are required for all types EXCEPT ANNOTATION and manual mode
    if (type !== 'ANNOTATION' && !manualMode && (!movelaps || !Array.isArray(movelaps) || movelaps.length === 0)) {
      console.error('Invalid movelaps:', movelaps);
      return NextResponse.json({ error: 'movelaps must be a non-empty array' }, { status: 400 });
    }
    
    console.log('Validated - workoutSessionId:', workoutSessionId);
    console.log('Validated - sport:', sport);
    console.log('Validated - type:', type);
    console.log('Validated - manualMode:', manualMode);
    console.log('Validated - movelaps count:', movelaps?.length || 0);

    // Ensure we have a valid sectionId - create default section if needed
    let finalSectionId = sectionId;
    
    if (!finalSectionId || finalSectionId === 'default') {
      console.log('No valid sectionId provided, finding or creating default section...');
      
      let defaultSection = await prisma.workoutSection.findFirst({
        where: {
          userId: decoded.userId,
          name: 'Default'
        }
      });
      
      if (!defaultSection) {
        console.log('Creating default section for user:', decoded.userId);
        defaultSection = await prisma.workoutSection.create({
          data: {
            userId: decoded.userId,
            name: 'Default',
            description: 'Default workout section',
            color: '#3b82f6'
          }
        });
        console.log('Default section created:', defaultSection.id);
      } else {
        console.log('Using existing default section:', defaultSection.id);
      }
      
      finalSectionId = defaultSection.id;
    }

    // Get existing moveframes count to determine letter
    const existingCount = await prisma.moveframe.count({
      where: { workoutSessionId }
    });
    
    console.log('Creating moveframe - letter will be:', indexToLetter(existingCount));
    
    const moveframeData = {
      workoutSessionId,
      letter: indexToLetter(existingCount),
      sport: sport as any,
      sectionId: finalSectionId,
      type: type as any,
      description: description || '',
      notes: notes || null,
      macroFinal: macroFinal || null,
      alarm: alarm ? parseInt(alarm) : null,
      manualMode: manualMode || false,
      annotationText: annotationText || null,
      annotationBgColor: annotationBgColor || null,
      annotationTextColor: annotationTextColor || null,
      annotationBold: annotationBold !== undefined ? annotationBold : false,
    };
    
    const movelapsData = movelaps && movelaps.length > 0 ? movelaps.map((lap: any, index: number) => ({
      repetitionNumber: index + 1,
      distance: lap.distance ? parseInt(lap.distance) : null,
      speed: lap.speed || null,
      style: lap.style || null,
      pace: lap.pace || null,
      time: lap.time || null,
      reps: lap.reps ? parseInt(lap.reps) : null,
      weight: lap.weight || null,
      tools: lap.tools || null,
      r1: lap.r1 || null,
      r2: lap.r2 || null,
      muscularSector: lap.muscularSector || null,
      exercise: lap.exercise || null,
      // Convert display value to enum value
      restType: convertRestTypeToEnum(lap.restType),
      pause: lap.pause || null,
      macroFinal: lap.macroFinal || null,
      alarm: lap.alarm ? parseInt(lap.alarm) : null,
      sound: lap.sound || null,
      notes: lap.notes || null,
      status: (lap.status || 'PENDING') as any,
      isSkipped: lap.isSkipped || false,
      isDisabled: lap.isDisabled || false
    })) : [];
    
    console.log('Moveframe data:', JSON.stringify(moveframeData, null, 2));
    console.log('Movelaps data:', JSON.stringify(movelapsData, null, 2));

    const moveframe = await prisma.moveframe.create({
      data: {
        ...moveframeData,
        movelaps: movelapsData.length > 0 ? {
          create: movelapsData
        } : undefined
      },
      include: {
        section: true,
        movelaps: {
          orderBy: { repetitionNumber: 'asc' }
        }
      }
    });

    console.log('✅ Moveframe created successfully:', moveframe.id);

    return NextResponse.json({ moveframe });
  } catch (error: any) {
    console.error('❌ Error creating moveframe:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', JSON.stringify(error, null, 2));
    
    return NextResponse.json(
      { 
        error: 'Failed to create moveframe',
        details: error.message,
        code: error.code,
        name: error.name
      },
      { status: 500 }
    );
  }
}

function indexToLetter(index: number): string {
  let result = '';
  while (index >= 0) {
    result = String.fromCharCode(65 + (index % 26)) + result;
    index = Math.floor(index / 26) - 1;
  }
  return result;
}

