import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';


/**
 * Save USER Personal Settings (NOT language defaults)
 * - Users save their OWN customized settings to user_settings table
 * - This is NOT language-specific - it's their personal preferences
 * - Users can load language defaults as a starting point, then save customized versions
 */
export async function POST(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      colorSettings,
      toolsSettings,
      favouritesSettings,
      myBestSettings,
      gridSettings,
      workoutPreferences,
      displaySettings
    } = body;

    // Check if user settings already exist
    const existingSettings = await prisma.userSettings.findUnique({
      where: { userId: decoded.userId }
    });

    if (existingSettings) {
      // Update existing settings
      const updatedSettings = await prisma.userSettings.update({
        where: { userId: decoded.userId },
        data: {
          colorSettings: JSON.stringify(colorSettings || {}),
          toolsSettings: JSON.stringify(toolsSettings || {}),
          favouritesSettings: JSON.stringify(favouritesSettings || {}),
          myBestSettings: JSON.stringify(myBestSettings || {}),
          workoutPreferences: JSON.stringify(workoutPreferences || {}),
          // Update display settings if provided
          ...(displaySettings?.gridSize && { gridSize: displaySettings.gridSize }),
          ...(displaySettings?.columnCount && { columnCount: displaySettings.columnCount }),
          ...(displaySettings?.rowHeight && { rowHeight: displaySettings.rowHeight }),
          ...(displaySettings?.defaultView && { defaultView: displaySettings.defaultView }),
          ...(gridSettings && { 
            leftSidebarVisible: gridSettings.leftSidebarVisible ?? existingSettings.leftSidebarVisible,
            rightSidebarVisible: gridSettings.rightSidebarVisible ?? existingSettings.rightSidebarVisible
          }),
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Settings saved successfully',
        settings: updatedSettings
      });
    } else {
      // Create new settings
      const newSettings = await prisma.userSettings.create({
        data: {
          userId: decoded.userId,
          colorSettings: JSON.stringify(colorSettings || {}),
          toolsSettings: JSON.stringify(toolsSettings || {}),
          favouritesSettings: JSON.stringify(favouritesSettings || {}),
          myBestSettings: JSON.stringify(myBestSettings || {}),
          adminSettings: JSON.stringify({}),
          workoutPreferences: JSON.stringify(workoutPreferences || {}),
          socialSettings: JSON.stringify({}),
          notificationSettings: JSON.stringify({}),
          ...(displaySettings?.gridSize && { gridSize: displaySettings.gridSize }),
          ...(displaySettings?.columnCount && { columnCount: displaySettings.columnCount }),
          ...(displaySettings?.rowHeight && { rowHeight: displaySettings.rowHeight }),
          ...(displaySettings?.defaultView && { defaultView: displaySettings.defaultView })
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Settings created successfully',
        settings: newSettings
      });
    }
  } catch (error: any) {
    console.error('Error saving user settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save settings',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

