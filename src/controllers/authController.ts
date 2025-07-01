import { Request, Response } from 'express';
import mongoose from 'mongoose'; // Mongoose را برای دسترسی به ObjectId وارد کنید
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.model';
import Profile from '../models/Profile.model';


export const register = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { username, email, password, fullName, fieldOfStudy } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({ msg: 'کاربری با این ایمیل از قبل وجود دارد' });
      return;
    }

    const newUser = new User({ username, email, password });
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);
    const newProfile = new Profile({
      user: newUser._id,
      fullName,
      fieldOfStudy,
    });
    newUser.profile = newProfile._id as mongoose.Types.ObjectId;
    await newUser.save({ session });
    await newProfile.save({ session });
    await session.commitTransaction();

    const payload = {
      user: {
        // --- اصلاح نهایی: تأیید نوع _id قبل از فراخوانی متد ---
        id: (newUser._id as mongoose.Types.ObjectId).toString(),
        role: newUser.role,
      },
    };

    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET تعریف نشده است');

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token });
      }
    );
  } catch (err) {
    await session.abortTransaction();
    const error = err as Error;
    console.error(error.message);
    res.status(500).send('خطای سرور');
  } finally {
    session.endSession();
  }
};


export const login = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ msg: 'ایمیل یا رمز عبور نامعتبر است' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ msg: 'ایمیل یا رمز عبور نامعتبر است' });
      return;
    }

    const payload = {
      user: {
        // --- اصلاح نهایی: تأیید نوع _id قبل از فراخوانی متد ---
        id: (user._id as mongoose.Types.ObjectId).toString(),
        role: user.role,
      },
    };

    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET تعریف نشده است');

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    const error = err as Error;
    console.error(error.message);
    res.status(500).send('خطای سرور');
  }
};