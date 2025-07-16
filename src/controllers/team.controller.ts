import { Request, Response } from 'express';
import Team from '../models/Team.model';
import User from '../models/User.model';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import { UserPayload } from './profile.controller';
import fs from 'fs';
// --- تنظیمات Multer برای آپلود آواتار ---
// فایل‌ها در پوشه 'uploads/avatars' ذخیره می‌شوند
// نام فایل برای جلوگیری از تداخل، با یک timestamp همراه می‌شود
const storage = multer.diskStorage({
  // ✅ مسیر را به پوشه‌ای داخل 'public' تغییر بده
  destination: (req, file, cb) => {
    const uploadPath = 'public/uploads/avatars/';
    // اگر پوشه‌ها وجود نداشتند، آن‌ها را می‌سازیم
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });
export const uploadAvatar = upload.single('avatar');

// --- ۱. ساخت تیم جدید (اصلاح‌شده برای آپلود فایل) ---
export const createTeam = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  // فیلدهای متنی از req.body خوانده می‌شوند
  const { name, description } = req.body;

  if (!name) {
    res.status(400).json({ message: 'نام تیم الزامی است.' });
    return;
  }

  try {
    const user = req.user as UserPayload;

    // مسیر فایل آپلود شده از req.file در دسترس است (اگر فایلی ارسال شده باشد)
    const avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;

    const newTeam = new Team({
      name,
      description,
      avatar: avatarUrl, // مسیر فایل را در دیتابیس ذخیره کن
      leader: user.id,
      members: [{ user: new mongoose.Types.ObjectId(user.id), roleInTeam: 'Leader' }],
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

// --- ۲. گرفتن لیست تمام تیم‌ها (بدون تغییر) ---
export const getTeams = async (req: Request, res: Response) => {
  try {
    const teams = await Team.find().populate('leader', 'username profile').sort({ createdAt: -1 });
    res.status(200).json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

// --- ۳. گرفتن اطلاعات یک تیم خاص (بدون تغییر) ---
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
export const getPublicTeamDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const teamId = req.params.id;

    // ۱. پیدا کردن تیم با ID
    const team = await Team.findById(teamId)
      // ۲. جایگزینی ID با اطلاعات واقعی از کالکشن‌های دیگر
      .populate({
        path: 'leader',
        select: 'username fullName', // فقط این فیلدها از لیدر را برگردان
      })
      .populate({
        path: 'members.user',
        select: 'username fullName avatar', // فیلدهای مورد نظر از اعضا
      })
      .populate('projects', 'title status'); // فیلدهای مورد نظر از پروژه‌ها

    // ۳. بررسی وجود تیم
    if (!team) {
      res.status(404).json({ message: 'تیم با این ID یافت نشد.' });
      return;
    }

    // ۴. ارسال پاسخ موفقیت‌آمیز
    res.status(200).json(team);

  } catch (error: any) {
    // مدیریت خطاهای احتمالی مثل ID نامعتبر
    console.error('Error in getPublicTeamDetails:', error.message);
    res.status(500).json({ message: 'خطای سرور', error: error.message });
  }
};

export const rateTeam = async (req: Request, res: Response): Promise<void> => {
    const { score } = req.body;
    const userPayload = req.user as UserPayload;

    // ۱. اعتبار سنجی امتیاز
    if (!score || score < 1 || score > 5) {
        res.status(400).json({ message: 'امتیاز باید عددی بین ۱ تا ۵ باشد.' });
        return;
    }

    try {
        const team = await Team.findById(req.params.id);
        if (!team) {
            res.status(404).json({ message: 'تیم یافت نشد.' });
            return;
        }

        // ۲. بررسی اینکه آیا کاربر قبلاً امتیاز داده است یا خیر
        const existingRatingIndex = team.ratings.findIndex(
            (r) => r.user.toString() === userPayload.id
        );

        if (existingRatingIndex > -1) {
            // اگر قبلاً امتیاز داده، امتیاز او را آپدیت کن
            team.ratings[existingRatingIndex].score = score;
        } else {
            // اگر اولین بار است، یک امتیاز جدید اضافه کن
            team.ratings.push({ user: userPayload.id as any, score });
        }

        await team.save();
        res.status(200).json(team);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'خطای سرور' });
    }
};
// --- ۴. به‌روزرسانی اطلاعات تیم (اصلاح‌شده برای آپلود فایل) ---
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
    if (team.leader.toString() !== user.id.toString()) {
      res.status(403).json({ message: 'شما مجاز به ویرایش این تیم نیستید.' });
      return;
    }

    // داده‌های جدید را از req.body بگیرید
    const updateData = { ...req.body };

    // اگر فایل جدیدی آپلود شده بود، مسیر آن را به داده‌های آپدیت اضافه کنید
    if (req.file) {
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    const updatedTeam = await Team.findByIdAndUpdate(req.params.id, updateData, { new: true });
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
export const inviteUserToTeam = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  const { teamId, userId } = req.params;
  const leader = req.user as UserPayload;

  try {
    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: 'تیم یافت نشد.' });
      return;
    }

    // فقط لیدر تیم می‌تواند کاربر دعوت کند
    if (team.leader.toString() !== leader.id.toString()) {
      res.status(403).json({ message: 'شما مجاز به دعوت عضو جدید نیستید.' });
      return;
    }

    // بررسی اینکه آیا کاربر از قبل عضو یا در لیست انتظار هست یا نه
    if (
      team.members.some((m) => m.user.toString() === userId) ||
      team.pendingRequests.some((id) => id.toString() === userId)
    ) {
       res.status(400).json({ message: 'این کاربر از قبل عضو تیم است یا در لیست انتظار قرار دارد.' });
       return;
    }

    team.pendingRequests.push(new mongoose.Types.ObjectId(userId));
    await team.save();

    // تیم آپدیت شده را با اطلاعات کامل populate করে برگردان
    const updatedTeam = await Team.findById(teamId)
      .populate('leader', 'username')
      .populate('members.user', 'username')
      .populate('pendingRequests', 'username'); // <-- مهم

    res.status(200).json(updatedTeam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};


export const getUserTeams = async (req: Request, res: Response) => {
  if (!req.user) {
     res.status(401).json({ message: 'Not authorized' });
     return;
  }

  try {
    const userId = (req.user as UserPayload).id;

    // پیدا کردن تیم‌هایی که کاربر یا لیدر است یا عضو
    const teams = await Team.find({
      $or: [{ leader: userId }, { 'members.user': userId }],
    }).select('name'); // فقط نام و آیدی تیم را برای دراپ‌دان نیاز داریم

    res.status(200).json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};