// file: routes/api/profile.routes.ts

import express from 'express';
import { check } from 'express-validator';

import { getMyProfile, getProfileByUsername, searchProfiles, updateMyProfile } from '../controllers/profile.controller';
import { auth } from '../middlewares/auth.middleware';

const router = express.Router();

// @route   GET api/profile/me
// @desc    دریافت پروفایل کاربر فعلی
router.get('/me', auth, getMyProfile);
router.get('/search', searchProfiles);
router.get('/user/:username', getProfileByUsername);
router.put(
  '/me',
  [
    auth, // اول احراز هویت
    // اعتبارسنجی فیلدهای اصلی
    check('fullName', 'نام کامل الزامی است').not().isEmpty(),
    check('fieldOfStudy', 'رشته تحصیلی الزامی است').not().isEmpty(),

    check('bio', 'بیوگرافی نمی‌تواند بیشتر از 250 کاراکتر باشد').optional().isLength({ max: 250 }),
    check('skills', 'مهارت‌ها باید به صورت آرایه‌ای از رشته‌ها باشد').optional().isArray(),
  ],
  updateMyProfile,
);

export default router;
