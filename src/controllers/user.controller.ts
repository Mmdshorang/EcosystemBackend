// src/controllers/user.controller.ts

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User, { IUser } from '../models/User.model'; // مسیر مدل خود را وارد کنید
import { UserPayload } from './profile.controller';
import Project from '../models/Project.model';
import Team from '../models/Team.model';
import Event, { IEvent } from '../models/Event.model';
import TeamJoinRequest from '../models/TeamJoinRequest';
/**
 * @description تغییر نقش یک کاربر
 * @route PATCH /api/users/:id/role
 */
export const updateUserRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  // 1. اعتبارسنجی ورودی‌ها
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'آیدی کاربر معتبر نیست.' });
    return;
  }

  const allowedRoles: IUser['role'][] = ['user', 'team_lead', 'association_manager', 'admin'];
  if (!role || !allowedRoles.includes(role)) {
    res.status(400).json({ message: 'نقش ارسال شده معتبر نیست.' });
    return;
  }

  try {
    // 2. پیدا کردن و آپدیت کاربر
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role }, // فقط فیلد نقش آپدیت می‌شود
      { new: true, runValidators: true }, // بازگرداندن داکیومنت جدید و اجرای ولیدیشن‌های اسکیم
    ).select('-password'); // پسورد را از خروجی حذف کن

    if (!updatedUser) {
      res.status(404).json({ message: 'کاربری با این آیدی یافت نشد.' });
      return;
    }

    // 3. ارسال پاسخ موفقیت‌آمیز
    res.status(200).json(updatedUser);
    return;
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'خطای سرور هنگام آپدیت نقش کاربر' });
    return;
  }
};

/**
 * @description حذف یک کاربر
 * @route DELETE /api/users/:id
 */
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  // 1. اعتبارسنجی آیدی
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'آیدی کاربر معتبر نیست.' });
    return;
  }

  try {
    // 2. پیدا کردن و حذف کاربر
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      res.status(404).json({ message: 'کاربری با این آیدی یافت نشد.' });
      return;
    }

    res.status(200).json({ message: 'کاربر با موفقیت حذف شد.' });
    return;
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'خطای سرور هنگام حذف کاربر' });
    return;
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  try {
    const userId = (req.user as UserPayload).id;
    const now = new Date();

    // شمارش پروژه‌های فعال
    const activeProjectsCount = await Project.countDocuments({
      members: userId,
      status: { $in: ['In Progress', 'Active'] },
    });

    // شمارش تیم‌های کاربر
    const userTeamsCount = await Team.countDocuments({
      $or: [{ leader: userId }, { 'members.user': userId }],
    });

    // شمارش رویدادهای پیش رو
    const upcomingEventsCount = await Event.countDocuments({
      registeredUsers: userId,
      date: { $gte: now },
    });
    
    // ✅ شمارش درخواست‌های عضویت از مدل TeamJoinRequest
    const joinRequestsCount = await TeamJoinRequest.countDocuments({
      team: { $in: await Team.find({ leader: userId }).distinct('_id') },
      status: 'pending',
    });


    res.status(200).json({
      activeProjects: activeProjectsCount,
      myTeams: userTeamsCount,
      upcomingEvents: upcomingEventsCount,
      joinRequests: joinRequestsCount,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'خطای سرور در دریافت آمار داشبورد' });
  }
};
