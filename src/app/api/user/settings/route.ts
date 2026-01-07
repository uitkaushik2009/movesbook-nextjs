import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Fetch user settings
export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header (consistent with other APIs)
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const userId = decoded.userId;
    
    // Handle fallback admin - return default settings without database
    if (userId === 'admin') {
      // Import default sports list
      const DEFAULT_SPORTS = [
        { id: '1', name: 'SWIM', icon: '🏊‍♂️', order: 0, isTop5: true },
        { id: '2', name: 'RUN', icon: '🏃‍♂️', order: 1, isTop5: true },
        { id: '3', name: 'BIKE', icon: '🚴‍♂️', order: 2, isTop5: true },
        { id: '4', name: 'BODY_BUILDING', icon: '💪', order: 3, isTop5: true },
        { id: '5', name: 'ROWING', icon: '🚣', order: 4, isTop5: true },
        { id: '6', name: 'SKATE', icon: '⛸️', order: 5, isTop5: false },
        { id: '7', name: 'SKI', icon: '🎿', order: 6, isTop5: false },
        { id: '8', name: 'SNOWBOARD', icon: '🏂', order: 7, isTop5: false },
        { id: '9', name: 'YOGA', icon: '🧘', order: 8, isTop5: false },
        { id: '10', name: 'GYMNASTIC', icon: '🏋️', order: 9, isTop5: false },
        { id: '11', name: 'STRETCHING', icon: '🤸', order: 10, isTop5: false },
        { id: '12', name: 'PILATES', icon: '🥋', order: 11, isTop5: false },
        { id: '13', name: 'TECHNICAL_MOVES', icon: '🎯', order: 12, isTop5: false },
        { id: '14', name: 'FREE_MOVES', icon: '🆓', order: 13, isTop5: false },
      ];
      
      return NextResponse.json({
        userId: 'admin',
        colorSettings: {},
        widgetArrangement: [],
        toolsSettings: {
          sports: DEFAULT_SPORTS,
          sections: [],
          equipment: [],
          exercises: [],
          devices: []
        },
        favouritesSettings: {},
        myBestSettings: {},
        adminSettings: {},
        workoutPreferences: {},
        socialSettings: {},
        notificationSettings: {},
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
        sportIconType: 'emoji',
        enableAnimations: true,
        reducedMotion: false,
        highContrast: false,
        performanceMode: false,
        imageQuality: 'high',
        lazyLoading: true,
        dashboardLayout: 'default',
        language: 'en'
      });
    }

    let settings = await prisma.userSettings.findUnique({
      where: { userId }
    });

    // If no settings exist, create default settings with admin defaults
    if (!settings) {
      // Load admin defaults for user's language (default to 'en')
      const userLanguage = 'en';
      console.log(`No settings found for user ${userId}, loading admin defaults for language: ${userLanguage}`);

      const [colorDefaults, toolsDefaults, favouritesDefaults] = await Promise.all([
        prisma.colorDefaults.findUnique({ where: { language: userLanguage } }),
        prisma.toolsDefaults.findUnique({ where: { language: userLanguage } }),
        prisma.favouritesDefaults.findUnique({ where: { language: userLanguage } })
      ]);

      settings = await prisma.userSettings.create({
        data: {
          userId,
          // JSON Settings loaded from admin defaults
          colorSettings: colorDefaults?.data ? JSON.stringify(colorDefaults.data) : '{}',
          toolsSettings: toolsDefaults?.data ? JSON.stringify(toolsDefaults.data) : '{}',
          favouritesSettings: favouritesDefaults?.data ? JSON.stringify(favouritesDefaults.data) : '{}',
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
          language: userLanguage
        }
      });

      console.log('Created user settings with admin defaults');
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
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const userId = decoded.userId;
    
    // Handle fallback admin - accept but don't save to database
    if (userId === 'admin') {
      const body = await request.json();
      return NextResponse.json({
        ...body,
        userId: 'admin',
        message: 'Admin settings accepted (not persisted to database)'
      });
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

    // Ensure all required fields have default values for creation
    const defaultSettings = {
      colorSettings: '{}',
      toolsSettings: '{}',
      favouritesSettings: '{}',
      myBestSettings: '{}',
      adminSettings: '{}',
      workoutPreferences: '{}',
      socialSettings: '{}',
      notificationSettings: '{}'
    };

    // Upsert (update or create)
    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: settingsData,
      create: {
        userId,
        ...defaultSettings,
        ...settingsData // Override defaults with any provided settings
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
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      error: 'Failed to save settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PATCH - Partial update of settings
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const userId = decoded.userId;
    
    // Handle fallback admin - accept but don't save to database
    if (userId === 'admin') {
      const body = await request.json();
      return NextResponse.json({
        ...body,
        userId: 'admin',
        message: 'Admin settings accepted (not persisted to database)'
      });
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

