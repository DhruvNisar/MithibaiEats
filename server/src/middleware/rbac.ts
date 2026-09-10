import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized.' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route.`,
      });
      return;
    }
    next();
  };
};

export const isAdmin = authorize('admin');
export const isStudent = authorize('student', 'admin');
