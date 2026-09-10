import mongoose from 'mongoose';
import { config } from './env';

let memoryServer: any = null;

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ MongoDB Connected to: ${conn.connection.host}`);
  } catch (error) {
    console.warn('⚠️  External MongoDB not available. Launching embedded MongoDB memory server...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'mithibai-eats',
        },
      });
      const memoryUri = memoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`✅ Embedded MongoDB Memory Server Connected: ${memoryUri}`);
    } catch (memError) {
      console.error('❌ Failed to start embedded MongoDB:', memError);
      process.exit(1);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

export default connectDB;
