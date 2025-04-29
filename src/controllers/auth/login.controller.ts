// controllers/authController.ts
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import User from '../../models/User.model';
import catchAsync from '../../utils/catchAsync';

export const login = catchAsync(async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, password } = req.body;

    // پیدا کردن کاربر از پایگاه داده
    const user = await User.findOne({ fullName });
    if (!user) {
      res.status(404).json({ message: 'کاربر یافت نشد.' });
      return;
    }

    // مقایسه رمز عبور
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ message: 'رمز عبور اشتباه است.' });
      return;
    }

    // ایجاد توکن JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'mysecret',
      { expiresIn: '7d' } // توکن معتبر برای 7 روز
    );

    // ارسال اطلاعات کاربر و توکن
    res.status(200).json({
      message: 'ورود موفق.',
      token,  // توکن JWT
      user: { // ارسال اطلاعات کاربر
        fullName: user.fullName,
        fieldOfStudy: user.fieldOfStudy,
        role: user.role,
        profileImage: user.profileImage,
        teams: user.teams,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'خطایی رخ داد.', error });
  }
});
