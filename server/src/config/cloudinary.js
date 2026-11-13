import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadImage = async (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'house-of-homegrown/products'
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
};

export const deleteImage = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};


export const uploadImages = async (files) => {
  const settled = await Promise.allSettled(files.map((file) => uploadImage(file.buffer)));
  const uploaded = settled.filter((r) => r.status === 'fulfilled').map((r) => r.value);
  const failed = settled.find((r) => r.status === 'rejected');
  if (failed) {
    await deleteImages(uploaded.map((u) => u.public_id));
    throw failed.reason;
  }
  return uploaded.map((u) => ({ url: u.secure_url, publicId: u.public_id }));
};

export const deleteImages = async (publicIds) => {
  await Promise.allSettled(publicIds.filter(Boolean).map((id) => deleteImage(id)));
};

export default cloudinary;
