const fs = require('fs');
const path = require('path');

const root = path.join(__dirname);
const dirs = [
    'src/config', 'src/models', 'src/middleware', 'src/controllers', 
    'src/routes', 'src/services', 'src/sockets', 'src/ai', 'src/utils', 
    'src/seed/seedData'
];

dirs.forEach(dir => fs.mkdirSync(path.join(root, dir), { recursive: true }));

const files = {
    'tsconfig.json': `{
  "compilerOptions": {
    "target": "es2022",
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./dist",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}`,
    'nodemon.json': `{
  "watch": ["src"],
  "ext": ".ts,.js",
  "ignore": [],
  "exec": "ts-node ./src/index.ts"
}`,
    '.env.example': `MONGO_URI=mongodb://localhost:27017/mithibai-eats
JWT_SECRET=mithibai-eats-super-secret-jwt-key-2026
PORT=5000
CLIENT_URL=http://localhost:5173
AI_API_KEY=
NODE_ENV=development`,
    '.env': `MONGO_URI=mongodb://localhost:27017/mithibai-eats
JWT_SECRET=mithibai-eats-super-secret-jwt-key-2026
PORT=5000
CLIENT_URL=http://localhost:5173
AI_API_KEY=
NODE_ENV=development`,
    'src/config/env.ts': `import dotenv from 'dotenv';
dotenv.config();

export const env = {
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/mithibai-eats',
    JWT_SECRET: process.env.JWT_SECRET || 'mithibai-eats-super-secret-jwt-key-2026',
    PORT: process.env.PORT || 5000,
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
    AI_API_KEY: process.env.AI_API_KEY || '',
    NODE_ENV: process.env.NODE_ENV || 'development'
};`,
    'src/config/database.ts': `import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async () => {
    try {
        await mongoose.connect(env.MONGO_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};`,
    'src/models/User.ts': `import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'staff', 'admin'], default: 'student' },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  preferences: {
    vegetarian: { type: Boolean, default: false },
    jain: { type: Boolean, default: false },
    spiceLevel: { type: String, enum: ['mild', 'medium', 'spicy'], default: 'medium' }
  },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  favoriteCanteen: { type: mongoose.Schema.Types.ObjectId, ref: 'Canteen' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('User', userSchema);`,
    'src/index.ts': `import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/database';
import { env } from './config/env';

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

connectDB().then(() => {
    server.listen(env.PORT, () => {
        console.log(\`Server running on port \${env.PORT}\`);
    });
});`
};

for (const [filepath, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(root, filepath), content);
}
console.log('Backend generated successfully!');
