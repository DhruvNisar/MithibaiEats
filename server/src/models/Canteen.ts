import mongoose, { Document, Schema } from 'mongoose';

export interface ICanteen extends Document {
  name: string;
  floor: string;
  description: string;
  image: string;
  openingTime: string;
  closingTime: string;
  isOpen: boolean;
  avgPrepTime: number;
  location: string;
  contactNumber?: string;
  totalItems: number;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const CanteenSchema = new Schema<ICanteen>(
  {
    name: { type: String, required: true, trim: true },
    floor: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    openingTime: { type: String, default: '08:00' },
    closingTime: { type: String, default: '20:00' },
    isOpen: { type: Boolean, default: true },
    avgPrepTime: { type: Number, default: 15 },
    location: { type: String, required: true },
    contactNumber: { type: String },
    totalItems: { type: Number, default: 0 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      enum: ['ground', '6th', '8th'],
    },
  },
  { timestamps: true }
);

export const Canteen = mongoose.model<ICanteen>('Canteen', CanteenSchema);
