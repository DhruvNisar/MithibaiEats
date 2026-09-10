import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/database';
import { config } from './config/env';
import { initSocketServer } from './sockets/socketManager';
import { generalLimiter } from './middleware/rateLimiter';

// Import Routes
import authRoutes from './routes/authRoutes';
import canteenRoutes from './routes/canteenRoutes';
import foodRoutes from './routes/foodRoutes';
import categoryRoutes from './routes/categoryRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';
import reviewRoutes from './routes/reviewRoutes';
import favoriteRoutes from './routes/favoriteRoutes';
import notificationRoutes from './routes/notificationRoutes';
import aiRoutes from './routes/aiRoutes';
import adminRoutes from './routes/adminRoutes';
import qrRoutes from './routes/qrRoutes';

const app = express();
const server = http.createServer(app);

// Security & Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) return callback(null, true);
      if (config.clientUrl && (origin === config.clientUrl || config.clientUrl === '*')) return callback(null, true);
      if (origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com') || origin.endsWith('.railway.app')) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local static assets (bypass firewall / offline)
app.use('/images', express.static(path.join(__dirname, '../public/images')));
app.use('/food', express.static(path.join(__dirname, '../public/food')));
app.use('/public', express.static(path.join(__dirname, '../public')));

const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.use('/api', generalLimiter);

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/canteens', canteenRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/qr', qrRoutes);

// Health check endpoints
const healthHandler = (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'Mithibai Eats API',
    timestamp: new Date().toISOString(),
  });
};
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// SPA Client Route Fallback
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/images') || req.path.startsWith('/food') || req.path.startsWith('/public')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) next();
  });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: config.nodeEnv === 'production' ? 'Internal server error' : err.message,
  });
});

// Initialize Socket.IO
initSocketServer(server);

import { Canteen } from './models/Canteen';
import { seedDatabase } from './seed/seed';

const startServer = () => {
  server.listen(config.port, '0.0.0.0', async () => {
    console.log(`🚀 Mithibai Eats server listening on 0.0.0.0:${config.port}`);
    console.log(`📡 Socket.IO server initialized`);

    try {
      await connectDB();
      const canteenCount = await Canteen.countDocuments();
      if (canteenCount === 0) {
        console.log('📦 Empty database detected. Auto-seeding Mithibai Eats data...');
        await seedDatabase();
      } else {
        console.log(`📦 Database ready with ${canteenCount} canteens.`);
      }
    } catch (error) {
      console.error('⚠️ Non-fatal DB initialization warning:', error);
    }
  });
};

startServer();

export { app, server };
