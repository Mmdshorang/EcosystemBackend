import { Request, Response } from 'express';
import TeamRequest from '../models/TeamRequest.model';
import Team from '../models/Team.model';
import { UserPayload } from './profile.controller';
import mongoose from 'mongoose';

// 1. ایجاد درخواست تیم توسط کاربر
export const createTeamRequest = async (req: Request, res: Response) => {
  try {
    console.log('📥 Body:', req.body); // ببینیم چه چیزی از فرانت میاد
    console.log('👤 User:', req.user); // ببینیم middleware auth چی می‌ذاره

    const { name, description, avatar, category, contactInfo, reason, documents } = req.body;

    // چک کنیم user موجود باشه
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized: user not found in request' });
      return;
    }

    const userId = (req.user as UserPayload).id;

    // چک کنیم name خالی نباشه
    if (!name || name.trim() === '') {
       res.status(400).json({ success: false, message: 'نام تیم الزامی است' });return;
    }

    const teamRequest = await TeamRequest.create({
      name,
      description,
      avatar,
      category,
      contactInfo,
      reason,
      documents,
      requestedBy: new mongoose.Types.ObjectId(userId),
    });

    console.log('✅ TeamRequest created:', teamRequest);

    res.status(201).json({ success: true, data: teamRequest });
  } catch (error: any) {
    console.error('❌ Error in createTeamRequest:', error); // لاگ خطا کامل
    res.status(500).json({ success: false, message: error.message, stack: error.stack });
  }
};

// 2. گرفتن همه درخواست‌ها (ادمین)
export const getAllTeamRequests = async (req: Request, res: Response) => {
  try {
    const requests = await TeamRequest.find().populate('requestedBy', 'email');
    res.json({ success: true, data: requests });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. تایید یا رد درخواست تیم (ادمین)
export const updateTeamRequestStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const teamRequest = await TeamRequest.findById(id);
    if (!teamRequest) {
      res.status(404).json({ success: false, message: 'درخواست پیدا نشد' });
      return;
    }

    teamRequest.status = status;
    teamRequest.adminNote = adminNote;
    await teamRequest.save();

    // اگر تایید شد → تیم واقعی ساخته شود
    if (status === 'approved') {
      const team = await Team.create({
        name: teamRequest.name,
        description: teamRequest.description,
        avatar: teamRequest.avatar,
        leader: teamRequest.requestedBy,
        members: [{ user: teamRequest.requestedBy, roleInTeam: 'Leader' }],
      });

      res.json({
        success: true,
        message: 'درخواست تایید شد و تیم ساخته شد',
        data: { teamRequest, team },
      });
      return;
    }

    res.json({ success: true, message: 'درخواست بروزرسانی شد', data: teamRequest });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// 4. گرفتن جزئیات یک درخواست تیم (ادمین یا خود کاربر)
export const getTeamRequestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // پیدا کردن درخواست با populate روی کاربر درخواست‌دهنده
    const teamRequest = await TeamRequest.findById(id).populate('requestedBy', 'email name');

    if (!teamRequest) {
      res.status(404).json({ success: false, message: 'درخواست پیدا نشد' });
      return;
    }

    res.json({ success: true, data: teamRequest });
  } catch (error: any) {
    console.error('❌ Error in getTeamRequestById:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
