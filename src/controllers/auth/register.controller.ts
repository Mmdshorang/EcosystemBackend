import { Request, Response } from 'express';
import User from '../../models/User.model';
import catchAsync from '../../utils/catchAsync';
import jwt from 'jsonwebtoken';
import config from '../../config/config'; // فایل پیکربندی که قبلاً نوشته بودید

export const register = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { fullName, password, fieldOfStudy } = req.body;

  if (!fullName || !password) {
    res.status(400).json({ message: 'نام و رمز عبور الزامی است.' });
    return;
  }

  const existingUser = await User.findOne({ fullName });
  if (existingUser) {
    res.status(400).json({ message: 'این کاربر قبلاً ثبت‌نام کرده است.' });
    return;
  }

  const user = new User({
    fullName,
    password,  // توجه داشته باش که باید رمز عبور را قبل از ذخیره‌سازی هش کنی!
    fieldOfStudy,
  });

  await user.save();

  // ایجاد توکن JWT با استفاده از مقادیر محیطی
  const token = jwt.sign(
    { id: user._id, fullName: user.fullName },
    config.jwt.secret, // استفاده از JWT_SECRET از فایل .env
    {
      expiresIn: `${config.jwt.accessExpirationMinutes}m`, // استفاده از زمان انقضا از فایل .env
    }
  );

  // ارسال اطلاعات کاربر و توکن
  res.status(201).json({
    message: 'ثبت‌نام با موفقیت انجام شد.',
    user: {
      fullName: user.fullName,
      fieldOfStudy: user.fieldOfStudy,
      role: user.role,
      profileImage: user.profileImage,
      teams: user.teams,
    },
    token, // توکن JWT به همراه اطلاعات
  });
});
