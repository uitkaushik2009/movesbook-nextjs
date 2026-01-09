import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// DELETE - Remove a favorite workout
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const userId = decoded.userId;
    const favoriteId = params.id;
    
    // Verify ownership before deleting
    const favorite = await prisma.favoriteWorkout.findUnique({
      where: { id: favoriteId }
    });
    
    if (!favorite) {
      return NextResponse.json({ error: 'Favorite not found' }, { status: 404 });
    }
    
    if (favorite.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Delete the favorite
    await prisma.favoriteWorkout.delete({
      where: { id: favoriteId }
    });
    
    return NextResponse.json({ message: 'Favorite deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting favorite workout:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete favorite' }, { status: 500 });
  }
}

// PATCH - Update a favorite workout
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const userId = decoded.userId;
    const favoriteId = params.id;
    const { name, workoutData, intensity, tags } = await req.json();
    
    // Verify ownership before updating
    const favorite = await prisma.favoriteWorkout.findUnique({
      where: { id: favoriteId }
    });
    
    if (!favorite) {
      return NextResponse.json({ error: 'Favorite not found' }, { status: 404 });
    }
    
    if (favorite.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Update the favorite
    const updated = await prisma.favoriteWorkout.update({
      where: { id: favoriteId },
      data: {
        name: name || favorite.name,
        workoutData: workoutData || favorite.workoutData,
        // Note: intensity and tags would need additional fields in the schema
        // For now, we'll just update name and workoutData
      }
    });
    
    return NextResponse.json({ 
      message: 'Favorite updated successfully',
      favorite: updated
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating favorite workout:', error);
    return NextResponse.json({ error: error.message || 'Failed to update favorite' }, { status: 500 });
  }
}

