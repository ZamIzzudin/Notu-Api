import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export const uploadImage = async (base64Data: string): Promise<{ url: string; publicId: string }> => {
  const result = await cloudinary.uploader.upload(base64Data, {
    folder: 'notu',
    resource_type: 'image',
  });
  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

export const deleteImage = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

export default cloudinary;
