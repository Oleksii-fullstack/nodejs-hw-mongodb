import fs from 'node:fs/promises';
import cloudinary from './cloudinary.js';

export const saveFileToCloudinary = async (file) => {
  const { secure_url } = await cloudinary.uploader.upload(file.path, {
    folder: 'photos',
    use_filename: true,
  });
  await fs.unlink(file.path);
  return secure_url;
};
