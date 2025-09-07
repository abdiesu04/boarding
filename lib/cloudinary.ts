import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file to Cloudinary
 * @param file Base64 encoded file data
 * @param folder Folder to store the file in
 * @param fileName Name of the file
 * @returns Cloudinary upload result
 */
export async function uploadToCloudinary(
  file: string,
  folder: string = 'documents',
  fileName: string = `document_${Date.now()}`
) {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      public_id: fileName,
      resource_type: 'raw',
      format: 'pdf',
      type: 'upload',
      access_mode: 'public',
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      resourceType: result.resource_type,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
}

/**
 * Delete a file from Cloudinary
 * @param publicId Public ID of the file to delete
 * @returns Cloudinary delete result
 */
export async function deleteFromCloudinary(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
}

/**
 * Generate a signed URL for a Cloudinary resource
 * @param publicId Public ID of the resource
 * @param expiresAt Expiration time in seconds
 * @returns Signed URL
 */
export function generateSignedUrl(publicId: string, expiresAt: number = 3600) {
  try {
    const url = cloudinary.url(publicId, {
      secure: true,
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + expiresAt,
    });
    
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate signed URL');
  }
}
