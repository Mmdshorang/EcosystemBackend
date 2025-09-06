import { Request, Response, NextFunction } from 'express';
import { UserPayload } from '../controllers/profile.controller';

// این تابع یک "میدلور ساز" است
// لیستی از نقش‌های مجاز را می‌گیرد و یک میدلور برمی‌گرداند
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // ابتدا چک می‌کنیم که آیا میدلور auth کاربر را به req اضافه کرده یا نه
    if (!req.user) {
      res.status(401).json({ message: 'عدم دسترسی، لطفا ابتدا وارد شوید.' });
      return;
    }

    const userRole = (req.user as { id: string; role: string }).role;

    // ⭐ این خط را اضافه کنید: اگر نقش کاربر 'admin' بود، به او اجازه می‌دهیم.
    if (userRole === 'admin') {
      return next();
    }

    // چک می‌کنیم که آیا نقش کاربر در لیست نقش‌های مجاز وجود دارد یا خیر
    if (allowedRoles.includes(userRole)) {
      // اگر کاربر نقش مجاز را داشت، به مرحله بعد (کنترلر) برو
      next();
    } else {
      // اگر نداشت، خطای 403 Forbidden (عدم دسترسی) را برگردان
      res.status(403).json({ message: 'شما دسترسی لازم برای این عملیات را ندارید.' });
    }
  };
};