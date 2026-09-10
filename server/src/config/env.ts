import dotenv from 'dotenv';
dotenv.config();

export const config = {
  mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/mithibai-eats',
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  aiApiKey: process.env.AI_API_KEY || '',
  imageGenerationProvider: process.env.IMAGE_GENERATION_PROVIDER || 'local',
  imageGenerationApiKey: process.env.IMAGE_GENERATION_API_KEY || '',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mithibaiDemoKey',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mithibaiDemoSecret',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_mithibaiSecret',
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtExpire: '7d',
  bcryptSaltRounds: 12,
  platformFee: 5,
  packagingFee: 3,
};
