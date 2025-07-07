// file: controllers/profile.controller.ts

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Profile from '../models/Profile.model';

interface UserPayload {
  id: string;
  role: string;
}

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserPayload;

    const profile = await Profile.findOne({ user: user?.id });

    if (!profile) {
      res.status(200).json({ success: 'error', message: 'پروفایلی برای این کاربر یافت نشد.' });
      return;
    }

    res.status(200).json({ success: 'success', data: profile });
  } catch (err) {
    console.error((err as Error).message);
    res.status(200).json({ success: 'error', message: 'خطای سرور' });
  }
};

export const updateMyProfile = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: 'error', message: 'خطاهای اعتبارسنجی', errors: errors.array() });
    return;
  }

  const user = req.user as UserPayload;

  const { fullName, avatar, fieldOfStudy, bio, skills, workExperience, socialLinks } = req.body;

  const profileFields: any = { user: user?.id }; // <-- از user.id استفاده کنید
  if (fullName) profileFields.fullName = fullName;
  if (avatar) profileFields.avatar = avatar;
  if (fieldOfStudy) profileFields.fieldOfStudy = fieldOfStudy;
  if (bio) profileFields.bio = bio;
  if (skills) {
    profileFields.skills = Array.isArray(skills) ? skills : skills.split(',').map((skill: string) => skill.trim());
  }
  if (workExperience) profileFields.workExperience = workExperience;
  if (socialLinks) profileFields.socialLinks = socialLinks;

  try {
    const profile = await Profile.findOneAndUpdate(
      { user: user?.id }, // <-- از user.id استفاده کنید
      { $set: profileFields },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).populate('user', ['username', 'email']);

    res.status(200).json({ success: 'success', message: 'پروفایل با موفقیت به‌روزرسانی شد.', data: profile });
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ success: 'error', message: 'خطای سرور' });
  }
};
