import { Request, Response } from 'express';
import User from '../models/User.model';
import catchAsync from '../utils/catchAsync';

export const getAllUsers = catchAsync(async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'خطا در دریافت کاربران', error });
  }
});


