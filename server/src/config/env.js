const REQUIRED = ['MONGODB_URI', 'JWT_SECRET', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];

export const validateEnv = () => {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
    missing.push('FRONTEND_URL');
  }
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
};
