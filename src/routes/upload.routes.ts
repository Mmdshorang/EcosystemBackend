// file: routes/api/upload.routes.ts

import express from 'express';
 // میدل‌ور آپلود
import { uploadProfileAvatar } from '../controllers/upload.controller';
import { auth } from '../middlewares/auth.middleware';
import { uploadAvatar } from '../middlewares/upload.middleware';

const router = express.Router();

// @route   POST api/upload/avatar
// @desc    آپلود عکس آواتار کاربر
// @access  Private
router.post(
  '/avatar',
  auth,              // ۱. اول کاربر احراز هویت می‌شود
  uploadAvatar,      // ۲. سپس فایل توسط multer پردازش و ذخیره می‌شود
  uploadProfileAvatar // ۳. در نهایت کنترلر اجرا و آدرس فایل برگردانده می‌شود
);

export default router;