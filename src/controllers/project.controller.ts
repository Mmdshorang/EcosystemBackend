import { Request, Response } from 'express';
import Project, { IProject } from '../models/Project.model';
import Team, { ITeam } from '../models/Team.model';
import mongoose from 'mongoose';

// --- Interfaces moved to top-level for better organization ---
interface UserPayload {
  id: string;
  role: string;
}

type PopulatedProject = Omit<IProject, 'team'> & {
  team: ITeam;
};

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private (Team leaders only)
 */
export const createProject = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ status: 'error', message: 'Not authorized' });
    return;
  }

  const { title, description, link, team, tags, status, image } = req.body;

  try {
    if (!title || !description) {
      res.status(400).json({ status: 'error', message: 'Title and description are required.' });
      return;
    }

    // ✅ اصلاحیه اینجا اعمال شده است:
    // نوع آبجکت را به صورت کلی تعریف می‌کنیم تا بتوانیم پراپرتی جدید به آن اضافه کنیم.
    const projectData: { [key: string]: any } = {
      title,
      description,
      link,
      tags,
      status,
      image,
    };

    if (team) {
      const teamToAssign = await Team.findById(team);
      if (!teamToAssign) {
         res.status(404).json({ message: 'Team not found.' });
         return;
      }

      const user = req.user as UserPayload;
      if (teamToAssign.leader.toString() !== user.id) {
         res.status(403).json({ message: 'User is not authorized to create a project for this team.' });
         return;
      }

      // حالا این خط بدون خطا کار می‌کند
      projectData.team = team;
    }

    const newProject = new Project(projectData);
    const savedProject = await newProject.save();

    if (team) {
      await Team.findByIdAndUpdate(team, {
        $push: { projects: savedProject._id },
      });
    }

    res.status(201).json(savedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
/**
 * @desc    Get all projects with pagination
 * @route   GET /api/projects
 * @access  Public
 */
export const getProjects = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  try {
    const projects = await Project.find().populate('team', 'name avatar').sort({ createdAt: -1 }).skip(skip).limit(limit);

    const totalProjects = await Project.countDocuments();

    res.status(200).json({
      data: projects,
      totalPages: Math.ceil(totalProjects / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Update a project
 * @route   PUT /api/projects/:id
 * @access  Private (Team leaders only)
 */
export const updateProject = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  const { id } = req.params;
  const updates = req.body;

  try {
    const project = (await Project.findById(id).populate('team')) as unknown as PopulatedProject;

    if (!project || !project.team) {
      res.status(404).json({ message: 'پروژه یا تیم مرتبط یافت نشد.' });
      return;
    }

    const user = req.user as UserPayload;
    if (project.team.leader.toString() !== user.id) {
      res.status(403).json({ message: 'شما مجاز به ویرایش این پروژه نیستید.' });
      return;
    }

    const updatedProject = await Project.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

/**
 * @desc    Delete a project
 * @route   DELETE /api/projects/:id
 * @access  Private (Team leaders only)
 */
export const deleteProject = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
  }

  const { id } = req.params;

  try {
    // ✅ 1. پروژه و تیم مرتبط با آن را با یک دستور بهینه `populate` می‌گیریم
    const project = (await Project.findById(id).populate('team')) as unknown as PopulatedProject;

    if (!project || !project.team) {
      res.status(404).json({ message: 'Project or its team not found.' });
      return;
    }

    // ✅ 2. بررسی مجوز با استفاده از آبجکت کامل تیم که `populate` شده
    const user = req.user as UserPayload;
    if (project.team.leader.toString() !== user.id) {
      res.status(403).json({ message: 'User is not authorized to delete this project.' });
      return;
    }

    await Project.findByIdAndDelete(id);

    // ✅ 3. پروژه را با متد استاندارد و امن `.filter` از لیست پروژه‌های تیم حذف می‌کنیم
    project.team.projects = project.team.projects.filter(
      (projectId: mongoose.Types.ObjectId) => projectId.toString() !== id,
    );
    await project.team.save();

    res.status(200).json({ message: 'Project successfully deleted.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
