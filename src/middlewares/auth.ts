import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  user: {
    id: string;
    role: string;
  };
}

// ۱. نوع خروجی تابع را به صراحت void تعریف می‌کنیم
export const protect = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization');

  if (!token || !token.startsWith('Bearer ')) {
    // ۲. ابتدا پاسخ را ارسال کرده و سپس با return خالی خارج می‌شویم
    res.status(401).json({ msg: 'عدم دسترسی، توکن نامعتبر است' });
    return;
  }

  try {
    const tokenValue = token.split(' ')[1];
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET as string) as JwtPayload;
    
    req.user = decoded.user;
    next();
  } catch (err) {
    // ۲. اصلاح این بخش هم به همین صورت
    res.status(401).json({ msg: 'توکن معتبر نیست' });
    return;
  }
};