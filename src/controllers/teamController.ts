// controllers/teamController.ts
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import TeamModel from '../models/Team.model';
import TeamMemberModel from '../models/TeamMember.model.';
import { IUser } from '../models/User.model';
import ApiError from '../utils/ApiError';

export const getTopTeams = catchAsync(async (req: Request, res: Response) => {
  const topTeams = await TeamModel.aggregate([
    {
      $project: {
        name: 1,
        description: 1,
        image: 1,
        ratingsCount: { $size: { $ifNull: ['$ratings', []] } },
      },
    },
    { $sort: { ratingsCount: -1 } },
    { $limit: 10 },
  ]);

  res.status(200).json({ teams: topTeams });
});

export const createTeam = catchAsync(async (req: Request, res: Response) => {
  const { name, description, image } = req.body;
  const user = req.user as { id: string; role: string };

  const team = await TeamModel.create({ name, description, image });
  console.log(team);
  await TeamMemberModel.create({
    user: user.id, // ✅ به جای user._id
    team: team._id,
    role: user.role,
  });

  res.status(201).json({ message: 'تیم با موفقیت ساخته شد', team });
});

export const getUserTeams = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as IUser).id;
  console.log(userId);
  // ابتدا همه تیم‌هایی که کاربر عضوشان است را از TeamMember بگیر
  const teamMemberships = await TeamMemberModel.find({ user: userId }).populate('team');
  console.log(teamMemberships);
  // استخراج اطلاعات تیم‌ها
  const teams = teamMemberships
    .filter((tm) => tm.team) // حذف null احتمالی
    .map((tm) => ({
      id: (tm.team as any)._id,
      name: (tm.team as any).name,
      description: (tm.team as any).description,
      image: (tm.team as any).image,
      role: tm.role,
      joined_at: tm.joined_at,
    }));

  res.status(200).json({ teams });
});
export const addMemberToTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { targetUserId, teamId, role } = req.body;

    if (!targetUserId || !teamId || !role) {
      return next(new ApiError(400, 'اطلاعات ناقص است.'));
    }

    // بررسی عضویت قبلی
    const existingMember = await TeamMemberModel.findOne({
      user: targetUserId,
      team: teamId,
    });

    if (existingMember) {
        res.status(400).json({
            message: 'این کاربر قبلاً عضو این تیم شده است.',
          });
    }

    const newMember = await TeamMemberModel.create({
      user: targetUserId,
      team: teamId,
      role,
    });

    res.status(201).json({
      message: 'عضو جدید با موفقیت اضافه شد',
      member: newMember,
    });
  } catch (err) {
    next(err);
  }
};

export const getTeamMembers = catchAsync(async (req: Request, res: Response) => {
  const { teamId } = req.body;

  if (!teamId) {
    res.status(400).json({ message: 'teamId الزامی است.' });
    return;
  }
  console.log(teamId);
  // استفاده از populate برای بارگذاری اطلاعات کاربر
  const teamMembers = await TeamMemberModel.find({ team: teamId })
    .populate({
      path: 'user', // فیلد user که می‌خواهیم populate شود
      select: 'fullName profileImage', // فقط فیلدهایی که نیاز داریم
    })
    .lean();
  console.log(teamMembers);

  // استخراج اطلاعات اعضای تیم
  const members = teamMembers.map((tm) => ({
    userId: tm.user._id,
    fullName: tm.user.fullName,
    profileImage: tm.user.profileImage,
    role: tm.role,
    joined_at: tm.joined_at,
  }));

  res.status(200).json({ members });
});
