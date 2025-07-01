import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import TeamMemberModel from '../models/TeamMember.model';
import ProjectModel from '../models/Project.model';
import RatingModel from '../models/Rating.model';
import { IUser } from '../models/User.model';

export const addProject = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

  const userId = (req.user as IUser).id;
  console.log(userId)
  const { title, description, link, teamId } = req.body;

  if (!title || !description || !teamId) {
    res.status(400).json({ message: 'اطلاعات ناقص است.' });
  }

  const member = await TeamMemberModel.findOne({ user: userId, team: teamId });
    
  if (!member) {
    res.status(403).json({ message: 'شما عضو این تیم نیستید.' });
  }

  const newProject = await ProjectModel.create({ title, description, link, team: teamId });
  res.status(201).json({ message: 'پروژه با موفقیت اضافه شد.', project: newProject });
});

export const deleteProject = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.user as { id: string }).id;
  const { projectId } = req.params;

  const project = await ProjectModel.findById(projectId);
  if (!project) res.status(404).json({ message: 'پروژه یافت نشد.' });

  const leader = await TeamMemberModel.findOne({ user: userId, team: project?.team, role: 'leader' });
  if (!leader) res.status(403).json({ message: 'فقط لیدر تیم می‌تواند پروژه را حذف کند.' });

  await ProjectModel.findByIdAndDelete(projectId);
  res.status(200).json({ message: 'پروژه حذف شد.' });
});

export const getProjectsByTeam = catchAsync(async (req: Request, res: Response) => {
  const { teamId } = req.params;
  const projects = await ProjectModel.find({ team: teamId }).populate('ratings');
  res.status(200).json({ projects });
});

export const rateProject = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.user as { id: string }).id;
  const { projectId, score, comment } = req.body;

  if (score < 0 || score > 5) {
    res.status(400).json({ message: 'امتیاز باید بین 0 تا 5 باشد.' });
  }

  const existingRating = await RatingModel.findOne({ byUser: userId, 'to.item': projectId, 'to.kind': 'project' });
  if (existingRating) {
    res.status(400).json({ message: 'شما قبلاً به این پروژه امتیاز داده‌اید.' });
  }

  const rating = await RatingModel.create({
    byUser: userId,
    to: { kind: 'project', item: projectId },
    score,
    comment,
  });

  await ProjectModel.findByIdAndUpdate(projectId, { $push: { ratings: rating._id } });

  res.status(201).json({ message: 'امتیاز با موفقیت ثبت شد.', rating });
});
