import { Request, Response } from 'express';
import { QRCode as QRCodeModel } from '../models/QRCode';
import { Canteen } from '../models/Canteen';
import { generateQRCodeBase64, buildCanteenQRUrl } from '../utils/qrGenerator';
import { config } from '../config/env';

export const getQRCodes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const qrCodes = await QRCodeModel.find().populate('canteen', 'name floor slug').lean();
    res.status(200).json({ success: true, data: qrCodes });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const generateCanteenQRCodes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const canteens = await Canteen.find();
    const results = [];

    for (const canteen of canteens) {
      let qrCode = await QRCodeModel.findOne({ canteen: canteen._id, type: 'canteen' });
      const targetUrl = buildCanteenQRUrl(config.clientUrl, canteen.slug);
      const qrImageData = await generateQRCodeBase64(targetUrl);

      if (!qrCode) {
        qrCode = await QRCodeModel.create({
          canteen: canteen._id,
          label: `${canteen.name} - Official Menu QR`,
          type: 'canteen',
          url: targetUrl,
          qrImageData,
          active: true,
          scanCount: 0,
        });
      } else {
        qrCode.url = targetUrl;
        qrCode.qrImageData = qrImageData;
        await qrCode.save();
      }
      results.push(await qrCode.populate('canteen', 'name floor slug'));
    }

    res.status(200).json({ success: true, data: results });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const recordScan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const qr = await QRCodeModel.findByIdAndUpdate(id, { $inc: { scanCount: 1 } }, { new: true });
    if (!qr) {
      res.status(404).json({ success: false, message: 'QR code not found.' });
      return;
    }
    res.status(200).json({ success: true, data: qr });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};
