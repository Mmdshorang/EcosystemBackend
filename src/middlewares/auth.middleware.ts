// file: middleware/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const auth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'عدم دسترسی، توکن نامعتبر است' });
    return;
  }

  try {
    const tokenValue = authHeader.split(' ')[1];

    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET as string) as JwtPayload;

    req.user = decoded.user;
    next();
  } catch (err) {
    console.log('1. 🫦 میدلور auth اجرا شد.');
    res.status(401).json({ success: false, message: 'توکن معتبر نیست' });
  }
};
