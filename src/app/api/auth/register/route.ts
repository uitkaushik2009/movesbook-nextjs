import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient, UserType, SportType } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { name, username, email, password, userType } = await request.json();

    console.log('Registration attempt:', { name, username, email, userType });

    // Validate required fields
    if (!name || !username || !email || !password || !userType) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Map frontend userType to database UserType enum
    const dbUserType = mapUserType(userType);

    console.log('Creating user with type:', dbUserType);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        userType: dbUserType,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        userType: true,
        createdAt: true,
      }
    });

    console.log('User created:', user.id);

    // Create default settings for user
    await prisma.userSettings.create({
      data: {
        userId: user.id,
        colorSettings: JSON.stringify({
          pageBackground: '#ffffff',
          dayHeader: '#f3f4f6',
          moveframeHeader: '#e5e7eb',
          movelapHeader: '#d1d5db',
          microlapBackground: '#f9fafb',
          selectedRow: '#3b82f6',
          buttonAdd: '#10b981',
          buttonEdit: '#f59e0b',
          buttonDelete: '#ef4444',
          buttonPrint: '#6b7280',
          alternateRow: '#f8fafc'
        }),
        language: 'en'
      }
    });

    console.log('User settings created');

    // Create default main sports
    const defaultSports = [
      { sport: SportType.SWIM, order: 0 },
      { sport: SportType.BIKE, order: 1 },
      { sport: SportType.RUN, order: 2 },
      { sport: SportType.BODY_BUILDING, order: 3 }
    ];

    for (const sportData of defaultSports) {
      await prisma.userMainSport.create({
        data: {
          userId: user.id,
          sport: sportData.sport,
          order: sportData.order
        }
      });
    }

    console.log('Default sports created');

    // Create default periods
    const defaultPeriods = [
      { name: 'Preparation', description: 'Initial training phase', color: '#3b82f6' },
      { name: 'Competition', description: 'Main competition phase', color: '#ef4444' },
      { name: 'Recovery', description: 'Active recovery phase', color: '#10b981' }
    ];

    for (const period of defaultPeriods) {
      await prisma.period.create({
        data: {
          userId: user.id,
          name: period.name,
          description: period.description,
          color: period.color
        }
      });
    }

    console.log('Default periods created');

    // Create default workout sections
    const defaultSections = [
      { name: 'Warm-up', description: 'Pre-workout activation', color: '#f59e0b' },
      { name: 'Main Set', description: 'Primary workout component', color: '#ef4444' },
      { name: 'Cool-down', description: 'Post-workout recovery', color: '#10b981' }
    ];

    for (const section of defaultSections) {
      await prisma.workoutSection.create({
        data: {
          userId: user.id,
          name: section.name,
          description: section.description,
          color: section.color
        }
      });
    }

    console.log('Default sections created');

    // Generate JWT token with RSA signing
    const token = require('@/lib/auth').generateToken(
      user.id,
      user.email,
      user.username,
      user.userType
    );

    return NextResponse.json({
      success: true,
      token,
      user
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    
    // More detailed error logging
    if (error.code) {
      console.error('Error code:', error.code);
      console.error('Error meta:', error.meta);
    }
    
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

function mapUserType(frontendType: string): UserType {
  const typeMap: { [key: string]: UserType } = {
    'athlete': UserType.ATHLETE,
    'coach': UserType.COACH,
    'team': UserType.TEAM_MANAGER,
<<<<<<< HEAD
    'club': UserType.CLUB_TRAINER,
    'group': UserType.GROUP_ADMIN
=======
    'club': UserType.CLUB_TRAINER
>>>>>>> 21d778b56ceb678af8ea9a9eb545faff336aa642
  };
  
  return typeMap[frontendType] || UserType.ATHLETE;
}