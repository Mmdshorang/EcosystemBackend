// فایل: team.controller.ts

import { Request, Response } from 'express';
import Team from '../models/Team.model';
import User from '../models/User.model';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import { UserPayload } from './profile.controller';
import fs from 'fs';
import TeamJoinRequest, { ITeamJoinRequest } from '../models/TeamJoinRequest';

// --- تنظیمات Multer برای آپلود آواتار ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'public/uploads/avatars/';
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });
export const uploadAvatar = upload.single('avatar');

// --- ۱. ساخت تیم جدید ---
export const createTeam = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  const { name, description } = req.body;

  if (!name) {
    res.status(400).json({ message: 'نام تیم الزامی است.' });
    return;
  }

  try {
    const user = req.user as UserPayload;
    const avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;

    const newTeam = new Team({
      name,
      description,
      avatar: avatarUrl,
      leader: user.id,
      members: [{ user: new mongoose.Types.ObjectId(user.id), roleInTeam: 'Leader' }],
    });

    await newTeam.save();
    await User.findByIdAndUpdate(user.id, { role: 'team_lead' });
    res.status(201).json(newTeam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

// --- ۲. گرفتن لیست تمام تیم‌ها ---
export const getTeams = async (req: Request, res: Response) => {
  try {
    const teams = await Team.find().populate('leader', 'username profile').sort({ createdAt: -1 });
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

// --- ۴. گرفتن جزئیات عمومی تیم ---
export const getPublicTeamDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const teamId = req.params.id;
    const team = await Team.findById(teamId)
      .populate({
        path: 'leader',
        select: 'username fullName',
      })
      .populate({
        path: 'members.user',
        select: 'username fullName avatar',
      });

    if (!team) {
      res.status(404).json({ message: 'تیم با این ID یافت نشد.' });
      return;
    }
    res.status(200).json(team);
  } catch (error: any) {
    console.error('Error in getPublicTeamDetails:', error.message);
    res.status(500).json({ message: 'خطای سرور', error: error.message });
  }
};

// --- ۵. امتیازدهی به تیم ---
export const rateTeam = async (req: Request, res: Response): Promise<void> => {
  const { score } = req.body;
  const userPayload = req.user as UserPayload;

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

    const existingRatingIndex = team.ratings.findIndex((r) => r.user.toString() === userPayload.id);

    if (existingRatingIndex > -1) {
      team.ratings[existingRatingIndex].score = score;
    } else {
      team.ratings.push({ user: userPayload.id as any, score });
    }

    await team.save();
    res.status(200).json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

// --- ۶. به‌روزرسانی اطلاعات تیم ---
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

    const updateData = { ...req.body };

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

// --- ۷. حذف تیم ---
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
    res.status(200).json({ message: 'تیم با موفقیت حذف شد.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

// --- ۸. ارسال درخواست عضویت در تیم (اصلاح‌شده) ---
export const requestToJoinTeam = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }
  const user = req.user as UserPayload;
  const { teamId } = req.params;

  try {
    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: 'تیم یافت نشد.' });
      return;
    }

    const existingRequest = await TeamJoinRequest.findOne({
      user: user.id,
      team: teamId,
      status: { $in: ['pending', 'accepted'] },
    });
    if (existingRequest) {
      res.status(400).json({ message: 'شما قبلاً برای این تیم درخواست داده‌اید یا عضو آن هستید.' });
      return;
    }

    if (team.members.some((m) => m.user.toString() === user.id)) {
      res.status(400).json({ message: 'شما از قبل عضو این تیم هستید.' });
      return;
    }

    const newRequest = new TeamJoinRequest({
      user: new mongoose.Types.ObjectId(user.id),
      team: new mongoose.Types.ObjectId(teamId),
    });
    await newRequest.save();

    res.status(200).json({ message: 'درخواست شما برای عضویت ارسال شد.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

// --- ۹. پذیرش درخواست عضویت (اصلاح‌شده) ---
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

    // ✅ پیدا کردن درخواست از مدل TeamJoinRequest و بروزرسانی وضعیت
    const updatedRequest = await TeamJoinRequest.findOneAndUpdate(
      { user: userId, team: teamId, status: 'pending' },
      { status: 'accepted', respondedAt: new Date() },
      { new: true },
    );

    if (!updatedRequest) {
      res.status(400).json({ message: 'درخواست در حال انتظار برای این کاربر یافت نشد.' });
      return;
    }

    // کاربر را به لیست اعضا اضافه می‌کنیم
    if (!team.members.some((m) => m.user.toString() === userId)) {
      team.members.push({ user: new mongoose.Types.ObjectId(userId), roleInTeam: 'Member' });
      await team.save();
    }

    res.status(200).json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

// --- ۱۰. دعوت کاربر به تیم ---
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

    if (team.leader.toString() !== leader.id.toString()) {
      res.status(403).json({ message: 'شما مجاز به دعوت عضو جدید نیستید.' });
      return;
    }

    // بررسی اینکه آیا کاربر از قبل عضو یا در لیست انتظار هست یا نه
    const existingRequest = await TeamJoinRequest.findOne({
      user: userId,
      team: teamId,
      status: { $in: ['pending', 'accepted'] },
    });
    if (existingRequest) {
      res.status(400).json({ message: 'این کاربر از قبل عضو تیم است یا درخواست در حال انتظار دارد.' });
      return;
    }

    // یک درخواست جدید به عنوان دعوت ایجاد می‌کنیم
    const newInvitation = new TeamJoinRequest({
      user: new mongoose.Types.ObjectId(userId),
      team: new mongoose.Types.ObjectId(teamId),
      status: 'pending',
    });
    await newInvitation.save();

    // تیم آپدیت شده را برمی‌گردانیم
    res.status(200).json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

// --- ۱۱. لغو درخواست عضویت (اصلاح‌شده) ---
export const cancelJoinRequest = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }
  const user = req.user as UserPayload;
  const { teamId } = req.params;

  try {
    const request = await TeamJoinRequest.findOne({ user: user.id, team: teamId, status: 'pending' });

    if (!request) {
      res.status(400).json({ message: 'درخواست شما برای این تیم یافت نشد.' });
      return;
    }

    request.status = 'rejected';
    request.respondedAt = new Date();
    await request.save();

    res.status(200).json({ message: 'درخواست عضویت با موفقیت لغو شد.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

// --- ۱۲. حذف عضو از تیم (اصلاح‌شده) ---
export const removeMember = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  const { teamId, memberId } = req.params;
  const user = req.user as UserPayload;

  try {
    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: 'تیم یافت نشد.' });
      return;
    }

    if (team.leader.toString() !== user.id.toString()) {
      res.status(403).json({ message: 'شما مجاز به حذف عضو نیستید.' });
      return;
    }

    if (team.leader.toString() === memberId) {
      res.status(400).json({ message: 'نمی‌توانید لیدر تیم را حذف کنید.' });
      return;
    }

    // حذف عضو از آرایه members
    const initialMemberCount = team.members.length;
    team.members = team.members.filter((m) => m.user.toString() !== memberId);

    if (team.members.length === initialMemberCount) {
      res.status(404).json({ message: 'عضو در تیم یافت نشد.' });
      return;
    }
    await team.save();

    // ✅ وضعیت درخواست را به 'rejected' تغییر می‌دهیم
    await TeamJoinRequest.findOneAndUpdate(
      { user: memberId, team: teamId, status: 'accepted' },
      { status: 'rejected', respondedAt: new Date() },
    );

    res.status(200).json({ message: 'عضو با موفقیت از تیم حذف شد.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

// --- ۱۳. گرفتن تیم‌های کاربر ---
export const getUserTeams = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  try {
    const userId = (req.user as UserPayload).id;
    const teams = await Team.find({
      $or: [{ leader: userId }, { 'members.user': userId }],
    })
      .populate('leader', 'username')
      .populate('members.user', 'username')
      .select('name description avatar leader members averageRating');

    res.status(200).json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- ۱۴. گرفتن درخواست‌های تیم‌های کاربر ---

// تایپ برای خروجی هر تیم
interface GroupedRequest {
  teamId: string;
  teamName: string;
  requests: { userId: string; username: string }[];
}
interface TeamLean {
  _id: mongoose.Types.ObjectId;
  name: string;
}
interface PendingRequestLean extends Omit<ITeamJoinRequest, 'user'> {
  user: {
    _id: mongoose.Types.ObjectId;
    username: string;
  };
}

export const getMyTeamJoinRequests = async (req: Request, res: Response) => {
  if (!req.user) {
     res.status(401).json({ message: 'Not authorized' });
     return;
  }

  try {
    const userId = (req.user as UserPayload).id;

    // ✅ گرفتن تیم‌هایی که کاربر لیدر آن‌هاست
    const teams: TeamLean[] = await Team.find({ leader: userId }).select('_id name').lean<TeamLean[]>(); // lean باعث می‌شود plain object برگردد و TS راحت تایپ کند

    const teamIds = teams.map((team) => team._id);

    // ✅ گرفتن درخواست‌های معلق و populate کردن user
 const pendingRequests: PendingRequestLean[] = await TeamJoinRequest.find({
  team: { $in: teamIds },
  status: 'pending',
})
  .populate<{ user: { _id: mongoose.Types.ObjectId; username: string } }>('user', 'username')
  .lean<PendingRequestLean[]>(); 

    // ✅ گروه‌بندی درخواست‌ها بر اساس تیم
    const groupedRequests: Record<string, GroupedRequest> = {};
    teams.forEach((team) => {
      groupedRequests[team._id.toString()] = {
        teamId: team._id.toString(),
        teamName: team.name,
        requests: [],
      };
    });

pendingRequests.forEach((request) => {
  const teamId = request.team.toString();
  if (groupedRequests[teamId] && request.user) {
    groupedRequests[teamId].requests.push({
      userId: request.user._id.toString(),
      username: request.user.username,
    });
  }
});

    res.status(200).json(Object.values(groupedRequests));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};
// --- ۱۵. گرفتن تاریخچه درخواست‌های کاربر ---
export const getMyRequestsHistory = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  try {
    const userId = (req.user as UserPayload).id;
    const requests = await TeamJoinRequest.find({ user: userId }).populate('team', 'name avatar').sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};
