import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomization {
  name: string;
  options: string[];
  required: boolean;
}

export interface IFoodItem extends Document {
  name: string;
  description: string;
  price: number;
  category: mongoose.Types.ObjectId;
  canteen: mongoose.Types.ObjectId;
  image: string;
  imageUrl?: string;
  isAiGenerated?: boolean;
  vegetarian: boolean;
  jainAvailable: boolean;
  spicyLevel: 'mild' | 'medium' | 'spicy' | 'extra_spicy';
  preparationTime: number;
  available: boolean;
  stock: number;
  rating: number;
  totalReviews: number;
  popularityScore: number;
  tags: string[];
  customizations: ICustomization[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CustomizationSchema = new Schema<ICustomization>({
  name: { type: String, required: true },
  options: [{ type: String }],
  required: { type: Boolean, default: false },
});

const FoodItemSchema = new Schema<IFoodItem>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 1 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    canteen: { type: Schema.Types.ObjectId, ref: 'Canteen', required: true },
    image: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    isAiGenerated: { type: Boolean, default: true },
    vegetarian: { type: Boolean, default: true },
    jainAvailable: { type: Boolean, default: false },
    spicyLevel: {
      type: String,
      enum: ['mild', 'medium', 'spicy', 'extra_spicy'],
      default: 'mild',
    },
    preparationTime: { type: Number, default: 10, min: 1 },
    available: { type: Boolean, default: true },
    stock: { type: Number, default: 50, min: 0 },
    rating: { type: Number, default: 4.0, min: 1, max: 5 },
    totalReviews: { type: Number, default: 0 },
    popularityScore: { type: Number, default: 0 },
    tags: [{ type: String }],
    customizations: [CustomizationSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-mark unavailable when stock = 0
FoodItemSchema.pre('save', function (next) {
  if (this.stock === 0) {
    this.available = false;
  }
  next();
});

FoodItemSchema.index({ canteen: 1, available: 1 });
FoodItemSchema.index({ category: 1 });
FoodItemSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const FoodItem = mongoose.model<IFoodItem>('FoodItem', FoodItemSchema);
