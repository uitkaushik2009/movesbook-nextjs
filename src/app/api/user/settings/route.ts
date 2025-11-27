import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch user settings
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    let settings = await prisma.userSettings.findUnique({
      where: { userId }
    });

    // If no settings exist, create default settings
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId,
          colorSettings: '{}',
          gridSize: 'comfortable',
          columnCount: 3,
          rowHeight: 'medium',
          defaultView: 'grid',
          leftSidebarVisible: true,
          rightSidebarVisible: true,
          leftSidebarWidth: 20,
          rightSidebarWidth: 25,
          sidebarPosition: 'fixed',
          theme: 'light',
          fontSize: 16,
          iconSize: 'medium',
          enableAnimations: true,
          reducedMotion: false,
          highContrast: false,
          performanceMode: false,
          imageQuality: 'high',
          lazyLoading: true,
          dashboardLayout: 'default',
          widgetArrangement: '[]',
          language: 'en'
        }
      });
    }

    // Parse JSON fields
    const response = {
      ...settings,
      colorSettings: JSON.parse(settings.colorSettings),
      widgetArrangement: JSON.parse(settings.widgetArrangement)
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// POST/PUT - Save user settings
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    const body = await request.json();
    
    // Convert objects to JSON strings for SQLite
    const settingsData: any = {
      ...body,
      colorSettings: typeof body.colorSettings === 'object' 
        ? JSON.stringify(body.colorSettings) 
        : body.colorSettings,
      widgetArrangement: typeof body.widgetArrangement === 'object'
        ? JSON.stringify(body.widgetArrangement)
        : body.widgetArrangement
    };

    // Remove fields that shouldn't be updated
    delete settingsData.id;
    delete settingsData.userId;
    delete settingsData.createdAt;
    delete settingsData.updatedAt;

    // Upsert (update or create)
    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: settingsData,
      create: {
        userId,
        ...settingsData
      }
    });

    // Parse JSON fields for response
    const response = {
      ...settings,
      colorSettings: JSON.parse(settings.colorSettings),
      widgetArrangement: JSON.parse(settings.widgetArrangement)
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}

// PATCH - Partial update of settings
export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    const body = await request.json();
    
    // Convert objects to JSON strings for SQLite
    const updateData: any = {};
    
    Object.keys(body).forEach(key => {
      if (key === 'colorSettings' || key === 'widgetArrangement') {
        updateData[key] = typeof body[key] === 'object' 
          ? JSON.stringify(body[key]) 
          : body[key];
      } else if (!['id', 'userId', 'createdAt', 'updatedAt'].includes(key)) {
        updateData[key] = body[key];
      }
    });

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        colorSettings: '{}',
        widgetArrangement: '[]',
        ...updateData
      }
    });

    // Parse JSON fields for response
    const response = {
      ...settings,
      colorSettings: JSON.parse(settings.colorSettings),
      widgetArrangement: JSON.parse(settings.widgetArrangement)
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

