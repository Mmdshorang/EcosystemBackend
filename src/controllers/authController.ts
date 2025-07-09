import { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.model';
import Profile from '../models/Profile.model';

// --- کنترلر ثبت‌نام بازنویسی شده ---
export const register = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err: any) => ({
      field: err.path,
      message: err.msg,
    }));

    // ❌ خطا - همیشه با استاتوس 200
    res.status(200).json({
      status: 'error',
      message: 'اطلاعات وارد شده نامعتبر است. لطفاً خطاها را بررسی کنید.',
      data: { errors: formattedErrors }, // جزئیات خطا در data قرار می‌گیرد
    });
    return;
  }

  const { username, email, password, fullName, fieldOfStudy } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // ❌ خطا - همیشه با استاتوس 200
      res.status(200).json({
        status: 'error',
        message: 'کاربری با این ایمیل از قبل وجود دارد.',
        data: null,
      });
      return;
    }

    const newUser = new User({ username, email, password });
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);

    const newProfile = new Profile({
      user: newUser._id, // ✅ صحیح: باید آبجکت آیدی کاربر را به فیلد user پاس بدهید
      fullName,
      fieldOfStudy,
      // ... سایر فیلدهای پروفایل که در مدل دارید
    });

    newUser.profile = newProfile._id as mongoose.Types.ObjectId;

    await newUser.save();
    await newProfile.save();
    const populatedUser = await User.findById(newUser._id).populate('profile').lean();

    const payload = {
      user: {
        id: (newUser._id as mongoose.Types.ObjectId).toString(),
        role: newUser.role,
      },
    };

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in .env file');
      // ❌ خطا - همیشه با استاتوس 200
      res.status(200).json({
        status: 'error',
        message: 'خطای پیکربندی در سرور رخ داده است.',
        data: null,
      });
      return;
    }

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) {
        console.error(err.message);
        // ❌ خطا - همیشه با استاتوس 200
        res.status(200).json({
          status: 'error',
          message: 'خطا در ایجاد توکن دسترسی.',
          data: null,
        });
        return;
      }
      // ✅ موفقیت - با استاتوس 200
      res.status(200).json({
        status: 'success',
        message: 'ثبت‌نام با موفقیت انجام شد.',
        data: {
          token,
          user: populatedUser,
        },
      });
    });
  } catch (err) {
    const error = err as Error;
    console.error(error.message);
    // ❌ خطا - همیشه با استاتوس 200
    res.status(200).json({
      status: 'error',
      message: 'یک خطای پیش‌بینی نشده در سرور رخ داد.',
      data: null,
    });
  }
};

// --- کنترلر ورود بازنویسی شده ---
export const login = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err: any) => ({
      field: err.path,
      message: err.msg,
    }));
    // ❌ خطا - همیشه با استاتوس 200
    res.status(200).json({
      status: 'error',
      message: 'داده‌های ورودی نامعتبر است.',
      data: { errors: formattedErrors },
    });
    return;
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // ❌ خطا - همیشه با استاتوس 200
      res.status(200).json({
        status: 'error',
        message: 'ایمیل یا رمز عبور نامعتبر است.',
        data: null,
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // ❌ خطا - همیشه با استاتوس 200
      res.status(200).json({
        status: 'error',
        message: 'ایمیل یا رمز عبور نامعتبر است.',
        data: null,
      });
      return;
    }
    const userObj = user.toObject();
    const payload = {
      user: {
        id: (user._id as mongoose.Types.ObjectId).toString(),
        role: user.role,
      },
    };

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      // ❌ خطا - همیشه با استاتوس 200
      res.status(200).json({
        status: 'error',
        message: 'خطای پیکربندی سرور.',
        data: null,
      });
      return;
    }

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) {
        console.error(err.message);
        // ❌ خطا - همیشه با استاتوس 200
        res.status(200).json({
          status: 'error',
          message: 'خطا در ایجاد توکن.',
          data: null,
        });
        return;
      }
      // ✅ موفقیت - با استاتوس 200
      res.status(200).json({
        status: 'success',
        message: 'ورود با موفقیت انجام شد.',
        data: {
          token,
          user: userObj,
        },
      });
    });
  } catch (err) {
    const error = err as Error;
    console.error(error.message);
    // ❌ خطا - همیشه با استاتوس 200
    res.status(200).json({
      status: 'error',
      message: 'یک خطای پیش‌بینی نشده در سرور رخ داد.',
      data: null,
    });
  }
};
