import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  foodItem: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    foodItem: { type: Schema.Types.ObjectId, ref: 'FoodItem', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
    approved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// One review per user per food item
ReviewSchema.index({ user: 1, foodItem: 1 }, { unique: true });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
