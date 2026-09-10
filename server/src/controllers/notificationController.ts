import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Notification } from '../models/Notification';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ user: req.user?._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    res.status(200).json({ success: true, data: notifications });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.updateMany({ user: req.user?._id, read: false }, { read: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};
