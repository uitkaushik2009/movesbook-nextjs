import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';

type ImageUploadResult =
  | { success: true; url: string }
  | { success: false; error: string };

/**
 * Uploads an image file and optionally removes the old image
 * @param imageFile - The image file to upload
 * @param uploadPath - The upload path relative to public/uploads (e.g., "action-planners")
 * @param existingUrl - Optional existing image URL to remove after successful upload
 * @returns Object with success status and either URL or error message
 */
export async function uploadImageFile(
  imageFile: File,
  uploadPath: string,
  existingUrl?: string | null
): Promise<ImageUploadResult> {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', uploadPath);
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = imageFile.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${randomString}.${fileExtension}`;
    const filepath = join(uploadsDir, filename);

    // Convert File to Buffer and save
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Set the URL path (relative to public folder)
    const newImageUrl = `/uploads/${uploadPath}/${filename}`;

    // Remove old image file if exists and if it's a different file
    if (existingUrl && existingUrl !== newImageUrl) {
      try {
        // Get the path to the old file
        const oldPath = join(
          process.cwd(),
          'public',
          existingUrl.startsWith('/') ? existingUrl.slice(1) : existingUrl
        );
        // Don't try to remove if the file doesn't exist
        if (existsSync(oldPath)) {
          unlinkSync(oldPath);
        }
      } catch (removeErr) {
        console.warn(`Failed to delete old image: ${existingUrl}`, removeErr);
        // Don't fail the upload if old file deletion fails
      }
    }

    return { success: true, url: newImageUrl };
  } catch (fileError) {
    console.error('Error saving image file:', fileError);
    return {
      success: false,
      error: 'Failed to save image file',
    };
  }
}
