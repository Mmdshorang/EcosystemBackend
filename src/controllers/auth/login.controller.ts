import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import User from '../../models/User.model';
import catchAsync from '../../utils/catchAsync';
import config from '../../config/config';

export const login = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { fullName, password } = req.body;

  if (!fullName || !password) {
    res.status(400).json({ message: 'نام و رمز عبور الزامی است.' });
    return;
  }

  // یافتن کاربر و انتخاب رمز عبور برای مقایسه
  const user = await User.findOne({ fullName }).select('+password');
  if (!user) {
    res.status(404).json({ message: 'کاربری با این نام یافت نشد.' });
    return;
  }

  // مقایسه رمز عبور
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(400).json({ message: 'رمز عبور نادرست است.' });
    return;
  }

  // ساخت توکن JWT
  const token = jwt.sign(
    { id: user._id, role: user.role },
    config.jwt.secret,
    { expiresIn: `${config.jwt.accessExpirationMinutes}m` }
  );

  // حذف رمز عبور از خروجی
  const { password: _, ...userWithoutPassword } = user.toObject();

  // پاسخ نهایی
  res.status(200).json({
    message: 'ورود موفقیت‌آمیز بود.',
    token,
    user: userWithoutPassword,
  });
});
