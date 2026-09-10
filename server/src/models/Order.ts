import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  foodItem: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  customizations: Record<string, string>;
  subtotal: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  user: mongoose.Types.ObjectId;
  canteen: mongoose.Types.ObjectId;
  items: IOrderItem[];
  fulfillmentType: 'pickup' | 'delivery';
  deliveryFee: number;
  deliveryDetails?: {
    building: string;
    floorRoom: string;
    contactPhone?: string;
    deliveryNotes?: string;
  };
  subtotal: number;
  platformFee: number;
  packagingFee: number;
  total: number;
  orderStatus: 'placed' | 'confirmed' | 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled' | 'rejected';
  paymentMethod: 'cash' | 'upi' | 'online';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  specialInstructions?: string;
  qrSource?: string;
  estimatedTime?: number;
  pickupToken?: string;
  pickupCode?: string;
  pickupQrToken?: string;
  slaBreached?: boolean;
  lifecycleStartedAt?: Date;
  confirmedAt?: Date;
  acceptedAt?: Date;
  preparingAt?: Date;
  readyAt?: Date;
  completedAt?: Date;
  rejectedAt?: Date;
  cancelledAt?: Date;
  estimatedCompletionAt?: Date;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  foodItem: { type: Schema.Types.ObjectId, ref: 'FoodItem', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  customizations: { type: Map, of: String, default: {} },
  subtotal: { type: Number, required: true },
});

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    pickupToken: { type: String },
    pickupCode: { type: String },
    pickupQrToken: { type: String },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    canteen: { type: Schema.Types.ObjectId, ref: 'Canteen', required: true },
    items: [OrderItemSchema],
    fulfillmentType: { type: String, enum: ['pickup', 'delivery'], default: 'pickup' },
    deliveryFee: { type: Number, default: 0 },
    deliveryDetails: {
      building: { type: String },
      floorRoom: { type: String },
      contactPhone: { type: String },
      deliveryNotes: { type: String },
    },
    subtotal: { type: Number, required: true },
    platformFee: { type: Number, default: 5 },
    packagingFee: { type: Number, default: 3 },
    total: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: ['placed', 'confirmed', 'pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled', 'rejected'],
      default: 'placed',
    },
    paymentMethod: { type: String, enum: ['cash', 'upi', 'online'], required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    specialInstructions: { type: String, maxlength: 500 },
    qrSource: { type: String },
    estimatedTime: { type: Number, default: 2 },
    slaBreached: { type: Boolean, default: false },
    lifecycleStartedAt: { type: Date },
    confirmedAt: { type: Date },
    acceptedAt: { type: Date },
    preparingAt: { type: Date },
    readyAt: { type: Date },
    completedAt: { type: Date },
    rejectedAt: { type: Date },
    cancelledAt: { type: Date },
    estimatedCompletionAt: { type: Date },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
  },
  { timestamps: true }
);

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ canteen: 1, orderStatus: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ pickupCode: 1 });
OrderSchema.index({ pickupQrToken: 1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
