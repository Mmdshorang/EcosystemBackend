import express from 'express';

import { check } from 'express-validator';
import { login, register } from '../controllers/authController';

const router = express.Router();

// @route   POST api/auth/register
// @desc    ثبت‌نام کاربر جدید
// @access  Public

router.post(
  '/register',
  [
    // قوانین اعتبارسنجی برای داده‌های ورودی
    check('fullName', 'نام کامل الزامی است').not().isEmpty(),
    check('username', 'نام کاربری الزامی است').not().isEmpty(),
    check('email', 'لطفاً یک ایمیل معتبر وارد کنید').isEmail(),
    check('password', 'پسورد باید حداقل ۶ کاراکتر باشد').isLength({ min: 6 }),
    check('fieldOfStudy', 'رشته تحصیلی الزامی است').not().isEmpty(),
  ],
  register
);

// @route   POST api/auth/login
// @desc    ورود کاربر و دریافت توکن
// @access  Public
router.post(
  '/login',
  [
    check('email', 'لطفاً یک ایمیل معتبر وارد کنید').isEmail(),
    check('password', 'پسورد الزامی است').exists(),
  ],
  login
);

export default router;