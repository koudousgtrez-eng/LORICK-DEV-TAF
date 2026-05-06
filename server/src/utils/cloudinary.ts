import cloudinary from 'cloudinary';
import multer from 'multer';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (filePath: string): Promise<string> => {
  const result = await cloudinary.v2.uploader.upload(filePath, {
    folder: 'ecomarket',
  });
  return result.secure_url;
};

export const upload = multer({ dest: '/tmp/uploads/' });

export default cloudinary;
