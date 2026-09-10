import mongoose, { Document, Schema } from 'mongoose';

export interface IFavorite extends Document {
  user: mongoose.Types.ObjectId;
  foodItem: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    foodItem: { type: Schema.Types.ObjectId, ref: 'FoodItem', required: true },
  },
  { timestamps: true }
);

FavoriteSchema.index({ user: 1, foodItem: 1 }, { unique: true });

export const Favorite = mongoose.model<IFavorite>('Favorite', FavoriteSchema);
