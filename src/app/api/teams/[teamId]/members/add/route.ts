import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken, verifyPassword } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;
    const teamId = params.teamId;
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Verify user is admin of this team
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        adminId: userId
      }
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found or access denied' },
        { status: 404 }
      );
    }

    // Find user by username
    const userToAdd = await prisma.user.findUnique({
      where: {
        username: username
      }
    });

    if (!userToAdd) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, userToAdd.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId: teamId,
        athleteId: userToAdd.id
      }
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this team' },
        { status: 409 }
      );
    }

    // Add user to team
    const teamMember = await prisma.teamMember.create({
      data: {
        teamId: teamId,
        athleteId: userToAdd.id,
        role: 'player'
      },
      include: {
        athlete: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            userType: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      member: {
        id: teamMember.id,
        athlete: teamMember.athlete,
        role: teamMember.role,
        jerseyNumber: teamMember.jerseyNumber,
        joinedAt: teamMember.joinedAt
      }
    });
  } catch (error: any) {
    console.error('Error adding team member:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

