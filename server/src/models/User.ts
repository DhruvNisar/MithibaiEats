import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/env';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'admin';
  phone?: string;
  avatar?: string;
  preferences: {
    vegetarian: boolean;
    jain: boolean;
    spiceLevel: 'mild' | 'medium' | 'spicy';
  };
  totalOrders: number;
  totalSpent: number;
  favoriteCanteen?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    phone: { type: String, trim: true },
    avatar: { type: String },
    preferences: {
      vegetarian: { type: Boolean, default: false },
      jain: { type: Boolean, default: false },
      spiceLevel: {
        type: String,
        enum: ['mild', 'medium', 'spicy'],
        default: 'medium',
      },
    },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    favoriteCanteen: { type: Schema.Types.ObjectId, ref: 'Canteen' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, config.bcryptSaltRounds);
  next();
});

// Compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
