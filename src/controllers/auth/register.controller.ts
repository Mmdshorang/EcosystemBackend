import { Request, Response } from 'express';
import User from '../../models/User.model';
import catchAsync from '../../utils/catchAsync';
import jwt from 'jsonwebtoken';
import config from '../../config/config';

export const register = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { fullName, password, fieldOfStudy, skills, profileImage, role } = req.body;

  // اعتبارسنجی اولیه
  if (!fullName || !password) {
    res.status(400).json({ message: 'نام و رمز عبور الزامی است.' });
    return;
  }

  // بررسی موجود بودن کاربر
  const existingUser = await User.findOne({ fullName });
  if (existingUser) {
    res.status(400).json({ message: 'این کاربر قبلاً ثبت‌نام کرده است.' });
    return;
  }

  // ایجاد کاربر جدید
  const user = new User({
    fullName,
    password,
    fieldOfStudy,
    skills,
    profileImage,
    role,
  });

  await user.save();

  // ساخت توکن JWT
  const token = jwt.sign(
    { id: user._id, fullName: user.fullName, role: user.role },
    config.jwt.secret,
    {
      expiresIn: `${config.jwt.accessExpirationMinutes}m`,
    }
  );

  // تبدیل به شیء ساده و حذف رمز عبور
  const { password: _, ...userWithoutPassword } = user.toObject();

  // پاسخ نهایی
  res.status(201).json({
    message: 'ثبت‌نام با موفقیت انجام شد.',
    user: userWithoutPassword,
    token,
  });
});
