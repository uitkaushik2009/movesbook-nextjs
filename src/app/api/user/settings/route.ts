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
          // JSON Settings (all default to empty objects/arrays)
          colorSettings: '{}',
          toolsSettings: '{}',
          favouritesSettings: '{}',
          myBestSettings: '{}',
          adminSettings: '{}',
          workoutPreferences: '{}',
          socialSettings: '{}',
          notificationSettings: '{}',
          widgetArrangement: '[]',
          // Display Settings
          gridSize: 'comfortable',
          columnCount: 3,
          rowHeight: 'medium',
          defaultView: 'grid',
          // Sidebar Settings
          leftSidebarVisible: true,
          rightSidebarVisible: true,
          leftSidebarWidth: 20,
          rightSidebarWidth: 25,
          sidebarPosition: 'fixed',
          // Theme & Display
          theme: 'light',
          fontSize: 16,
          iconSize: 'medium',
          sportIconType: 'emoji',
          // Accessibility
          enableAnimations: true,
          reducedMotion: false,
          highContrast: false,
          // Performance
          performanceMode: false,
          imageQuality: 'high',
          lazyLoading: true,
          // Dashboard
          dashboardLayout: 'default',
          // Language
          language: 'en'
        }
      });
    }

    // Parse all JSON fields
    const response = {
      ...settings,
      colorSettings: JSON.parse(settings.colorSettings || '{}'),
      widgetArrangement: JSON.parse(settings.widgetArrangement || '[]'),
      toolsSettings: JSON.parse(settings.toolsSettings || '{}'),
      favouritesSettings: JSON.parse(settings.favouritesSettings || '{}'),
      myBestSettings: JSON.parse(settings.myBestSettings || '{}'),
      adminSettings: JSON.parse(settings.adminSettings || '{}'),
      workoutPreferences: JSON.parse(settings.workoutPreferences || '{}'),
      socialSettings: JSON.parse(settings.socialSettings || '{}'),
      notificationSettings: JSON.parse(settings.notificationSettings || '{}')
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
    
    // Convert all JSON objects to strings for database storage
    const jsonFields = [
      'colorSettings', 
      'widgetArrangement', 
      'toolsSettings',
      'favouritesSettings',
      'myBestSettings',
      'adminSettings',
      'workoutPreferences',
      'socialSettings',
      'notificationSettings'
    ];
    
    const settingsData: any = { ...body };
    
    jsonFields.forEach(field => {
      if (body[field] !== undefined) {
        settingsData[field] = typeof body[field] === 'object' 
          ? JSON.stringify(body[field])
          : body[field];
      }
    });

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

    // Parse all JSON fields for response
    const response = {
      ...settings,
      colorSettings: JSON.parse(settings.colorSettings || '{}'),
      widgetArrangement: JSON.parse(settings.widgetArrangement || '[]'),
      toolsSettings: JSON.parse(settings.toolsSettings || '{}'),
      favouritesSettings: JSON.parse(settings.favouritesSettings || '{}'),
      myBestSettings: JSON.parse(settings.myBestSettings || '{}'),
      adminSettings: JSON.parse(settings.adminSettings || '{}'),
      workoutPreferences: JSON.parse(settings.workoutPreferences || '{}'),
      socialSettings: JSON.parse(settings.socialSettings || '{}'),
      notificationSettings: JSON.parse(settings.notificationSettings || '{}')
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
    
    // Convert objects to JSON strings for database
    const jsonFields = [
      'colorSettings',
      'widgetArrangement',
      'toolsSettings',
      'favouritesSettings',
      'myBestSettings',
      'adminSettings',
      'workoutPreferences',
      'socialSettings',
      'notificationSettings'
    ];
    
    const updateData: any = {};
    
    Object.keys(body).forEach(key => {
      if (jsonFields.includes(key)) {
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
        toolsSettings: '{}',
        favouritesSettings: '{}',
        myBestSettings: '{}',
        adminSettings: '{}',
        workoutPreferences: '{}',
        socialSettings: '{}',
        notificationSettings: '{}',
        ...updateData
      }
    });

    // Parse all JSON fields for response
    const response = {
      ...settings,
      colorSettings: JSON.parse(settings.colorSettings || '{}'),
      widgetArrangement: JSON.parse(settings.widgetArrangement || '[]'),
      toolsSettings: JSON.parse(settings.toolsSettings || '{}'),
      favouritesSettings: JSON.parse(settings.favouritesSettings || '{}'),
      myBestSettings: JSON.parse(settings.myBestSettings || '{}'),
      adminSettings: JSON.parse(settings.adminSettings || '{}'),
      workoutPreferences: JSON.parse(settings.workoutPreferences || '{}'),
      socialSettings: JSON.parse(settings.socialSettings || '{}'),
      notificationSettings: JSON.parse(settings.notificationSettings || '{}')
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

