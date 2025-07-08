import { Request, Response } from 'express';
import Team from '../models/Team.model';
import User from '../models/User.model'; 
import mongoose from 'mongoose';
import { UserPayload } from './profile.controller';

export const createTeam = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  const { name, description, avatar } = req.body;

  if (!name) {
    res.status(400).json({ message: 'نام تیم الزامی است.' });
    return;
  }

  try {
    const user = req.user as UserPayload;
    const newTeam = new Team({
      name,
      description,
      avatar,
      leader: user.id,
      members: [{ user: user.id, roleInTeam: 'Leader' }],
    });

    await newTeam.save();

    // به‌روزرسانی نقش کاربر به 'team_lead'
    await User.findByIdAndUpdate(user.id, { role: 'team_lead' });

    res.status(201).json(newTeam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

export const getTeams = async (req: Request, res: Response) => {
  try {
    const teams = await Team.find()
      .populate('leader', 'username') // اطلاعات لیدر را از مدل User می‌گیریم
      .sort({ createdAt: -1 });
    res.status(200).json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

// --- ۳. گرفتن اطلاعات یک تیم خاص ---
export const getTeamById = async (req: Request, res: Response) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('leader', 'username profile')
      .populate('members.user', 'username profile')
      .populate('projects', 'title status');

    if (!team) {
      res.status(404).json({ message: 'تیم یافت نشد.' });
      return;
    }
    res.status(200).json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

// --- ۴. به‌روزرسانی اطلاعات تیم ---
export const updateTeam = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      res.status(404).json({ message: 'تیم یافت نشد.' });
      return;
    }
    const user = req.user as UserPayload;
    // فقط لیدر تیم می‌تواند اطلاعات را ویرایش کند
    if (team.leader.toString() !== user.id.toString()) {
      res.status(403).json({ message: 'شما مجاز به ویرایش این تیم نیستید.' });
      return;
    }

    const updatedTeam = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedTeam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

// --- ۵. حذف تیم ---
export const deleteTeam = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      res.status(404).json({ message: 'تیم یافت نشد.' });
      return;
    }
    const user = req.user as UserPayload;
    if (team.leader.toString() !== user.id.toString()) {
      res.status(403).json({ message: 'شما مجاز به حذف این تیم نیستید.' });
      return;
    }

    await Team.findByIdAndDelete(req.params.id);
    // نکته: در یک اپلیکیشن واقعی، باید پروژه‌های مرتبط با این تیم را نیز مدیریت کرد.
    res.status(200).json({ message: 'تیم با موفقیت حذف شد.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

// --- ۶. ارسال درخواست عضویت در تیم ---
export const requestToJoinTeam = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }
  const user = req.user as UserPayload;

  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      res.status(404).json({ message: 'تیم یافت نشد.' });
      return;
    }
    // بررسی اینکه آیا کاربر از قبل عضو یا در لیست انتظار هست یا نه
    if (
      team.members.some((m) => m.user.toString() === user.id.toString()) ||
      team.pendingRequests.includes(new mongoose.Types.ObjectId(user.id))
    ) {
      res.status(400).json({ message: 'شما از قبل عضو این تیم هستید یا درخواست داده‌اید.' });
      return;
    }

    team.pendingRequests.push(new mongoose.Types.ObjectId(user.id));
    await team.save();
    res.status(200).json({ message: 'درخواست شما برای عضویت ارسال شد.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

// --- ۷. پذیرش درخواست عضویت ---
export const acceptJoinRequest = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  const { teamId, userId } = req.params;
  const user = req.user as UserPayload;
  try {
    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: 'تیم یافت نشد.' });
      return;
    }

    if (team.leader.toString() !== user.id.toString()) {
      res.status(403).json({ message: 'شما مجاز به پذیرش عضو نیستید.' });
      return;
    }

    // کاربر را از لیست انتظار حذف و به لیست اعضا اضافه کن
    team.pendingRequests = team.pendingRequests.filter((id) => id.toString() !== userId);
    team.members.push({ user: new mongoose.Types.ObjectId(userId), roleInTeam: 'Member' });

    await team.save();
    res.status(200).json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};
