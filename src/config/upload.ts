import cloudinary from './cloudinary';
import { UploadedFile } from 'express-fileupload';
import fs from 'fs';
import path from 'path';

export interface UploadResult {
  url: string;
  publicId: string;
}

export const uploadFile = async (file: UploadedFile): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'notu',
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          console.error('Upload stream error:', error);
          reject(new Error(`Failed to upload: ${error.message}`));
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      }
    );

    uploadStream.end(file.data);
  });
};

export const uploadBase64 = async (base64Data: string): Promise<UploadResult> => {
  const result = await cloudinary.uploader.upload(base64Data, {
    folder: 'notu',
    resource_type: 'image',
  });
  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

export const deleteFile = async (publicId: string): Promise<void> => {
  if (!publicId) {
    console.warn('No publicId provided for deletion');
    return;
  }
  await cloudinary.uploader.destroy(publicId);
};
