import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import UserModel, { IUser } from '../models/User.model';
import SkillModel, { ISkill } from '../models/Skill.model';
import UserSkillModel from '../models/UserSkill.model';
import WorkExperienceModel from '../models/WorkExperience.model';

export const addSkillToUser = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'اطلاعات کاربر پیدا نشد. لطفاً وارد شوید.' });
    return;
  }

  const userId = (req.user as IUser).id;
  const { skillName } = req.body;

  if (!skillName) {
    res.status(400).json({ message: 'نام مهارت الزامی است.' });
    return;
  }

  // بررسی وجود مهارت یا ساخت آن
  let skill = (await SkillModel.findOne({ title: skillName })) as ISkill;
  if (!skill) {
    skill = (await SkillModel.create({ title: skillName })) as ISkill;
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    res.status(404).json({ message: 'کاربر یافت نشد' });
    return;
  }

  // بررسی اینکه آیا رابطه‌ی کاربر و مهارت قبلاً وجود دارد یا نه
  const existingUserSkill = await UserSkillModel.findOne({ user: userId, skill: skill._id });
  if (existingUserSkill) {
    res.status(400).json({ message: 'این مهارت قبلاً به این کاربر اضافه شده است.' });
    return;
  }

  // ایجاد رکورد در جدول UserSkill
  await UserSkillModel.create({ user: userId, skill: skill._id });

  res.status(200).json({ message: 'مهارت با موفقیت به کاربر اضافه شد' });
});

export const addWorkExperience = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as IUser).id;
  const { company, position, skillsUsed, start_date, end_date, is_current } = req.body;

  const workExp = new WorkExperienceModel({
    user: userId,
    company,
    position,
    skillsUsed,
    start_date,
    end_date,
    is_current,
  });

  await workExp.save();

  res.status(201).json({ message: 'سابقه شغلی ذخیره شد', workExperience: workExp });
});

export const getSkills = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as IUser).id;

  const userSkills = await UserSkillModel.find({ user: userId }).populate('skill');
  console.log(userSkills);
  const skills = userSkills
    .filter((us) => us.skill) // فقط آن‌هایی که skill دارند
    .map((us) => {
      const skill = us.skill as any;
      return {
        id: skill._id,
        title: skill.title,
      };
    });

  res.status(200).json({ skills });
});
export const getWorkExperiences = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as IUser).id;
  const experiences = await WorkExperienceModel.find({ user: userId });
  res.status(200).json({ workExperiences: experiences });
});
