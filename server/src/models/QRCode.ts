import mongoose, { Document, Schema } from 'mongoose';

export interface IQRCode extends Document {
  canteen: mongoose.Types.ObjectId;
  label: string;
  type: 'canteen' | 'area';
  url: string;
  qrImageData: string;
  active: boolean;
  scanCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const QRCodeSchema = new Schema<IQRCode>(
  {
    canteen: { type: Schema.Types.ObjectId, ref: 'Canteen', required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ['canteen', 'area'], default: 'canteen' },
    url: { type: String, required: true },
    qrImageData: { type: String, required: true },
    active: { type: Boolean, default: true },
    scanCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const QRCode = mongoose.model<IQRCode>('QRCode', QRCodeSchema);
