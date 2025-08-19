// file: middleware/upload.middleware.ts

import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import path from 'path';
import fs from 'fs';

// ✅ ۱. این اینترفیس را دقیقا مانند کنترلر پروفایل، اینجا هم تعریف می‌کنیم
interface UserPayload {
  id: string;
  role: string;
}

// مسیر ذخیره فایل‌ها
const uploadDir = 'public/uploads/avatars';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // ✅ ۲. دقیقا مانند کنترلر، req.user را به UserPayload کست می‌کنیم
    const user = req.user as UserPayload;

    // ✅ ۳. حالا از user.id استفاده می‌کنیم که بدون خطا کار می‌کند
    const uniqueSuffix = `${user?.id}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  }
});

// فیلتر فایل (بدون تغییر)
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    // برای جلوگیری از کرش، خطا را به این صورت مدیریت می‌کنیم
    (req as any).fileValidationError = 'فقط فایل‌های تصویری مجاز هستند!';
    cb(null, false);
  }
};

// ساخت میدل‌ور multer (بدون تغییر)
export const uploadAvatar = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 2 } // 2MB
}).single('avatar');