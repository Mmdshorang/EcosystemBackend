import { Request, Response } from 'express';
import Profile from '../models/Profile.model';
import User from '../models/User.model';

// ۱. یک اینترفیس ساده برای شکل داده‌ای که در req.user قرار دارد تعریف می‌کنیم
interface RequestUser {
  id: string;
  role: string;
}

/**
 * @desc    دریافت پروفایل کاربر لاگین کرده
 * @route   GET /api/profiles/me
 * @access  Private
 */
export const getCurrentUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // ۲. راه‌حل قطعی: ما به صورت دستی نوع req.user را به تایپ‌اسکریپت می‌فهمانیم
    const userPayload = req.user as RequestUser;

    const profile = await Profile.findOne({ user: userPayload?.id })
      .populate('user', ['username', 'email'])
      .populate('teams');

    if (!profile) {
      res.status(404).json({ msg: 'پروفایلی برای این کاربر یافت نشد' });
      return;
    }

    res.json(profile);
  } catch (err) {
    const error = err as Error;
    console.error(error.message);
    res.status(500).send('خطای سرور');
  }
};

/**
 * @desc    ایجاد یا به‌روزرسانی پروفایل کاربر
 * @route   PUT /api/profiles/me
 * @access  Private
 */
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  const { fullName, bio, skills, workExperience, socialLinks, avatar } = req.body;

  const profileFields: any = {};
  if (fullName) profileFields.fullName = fullName;
  if (bio) profileFields.bio = bio;
  if (avatar) profileFields.avatar = avatar;
  if (socialLinks) profileFields.socialLinks = socialLinks;
  if (Array.isArray(skills)) {
    profileFields.skills = skills.map((skill: string) => skill.trim());
  }
  if (workExperience) profileFields.workExperience = workExperience;

  try {
    // ۲. راه‌حل قطعی: اینجا هم نوع req.user را به صورت دستی مشخص می‌کنیم
    const userPayload = req.user as RequestUser;

    const profile = await Profile.findOneAndUpdate(
      { user: userPayload?.id },
      { $set: profileFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate('user', ['username', 'email']);

    res.json(profile);
  } catch (err) {
    const error = err as Error;
    console.error(error.message);
    res.status(500).send('خطای سرور');
  }
};

/**
 * @desc    دریافت پروفایل یک کاربر بر اساس نام کاربری
 * @route   GET /api/profiles/user/:username
 * @access  Public
 */
export const getProfileByUsername = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      res.status(404).json({ msg: 'کاربر یافت نشد' });
      return;
    }

    const profile = await Profile.findOne({ user: user._id })
      .populate('user', ['username', 'email', 'role'])
      .populate('teams');
    
    if (!profile) {
      res.status(404).json({ msg: 'پروفایل یافت نشد' });
      return;
    }

    res.json(profile);
  } catch (err) {
    const error = err as Error;
    console.error(error.message);
    res.status(500).send('خطای سرور');
  }
};

