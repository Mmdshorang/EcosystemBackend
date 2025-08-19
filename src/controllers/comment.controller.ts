import { Request, Response } from 'express';
import Comment from '../models/Comment.model';
import Project from '../models/Project.model'; // مدل پروژه برای آپدیت
import Event from '../models/Event.model';   // مدل رویداد برای آپدیت
import { UserPayload } from './profile.controller';



/**
 * @desc ایجاد یک کامنت جدید برای یک هدف مشخص (پروژه یا رویداد)
 * @route POST /api/comments/:targetModel/:targetId
 * @access Private
 */
// src/controllers/comment.controller.ts

export const createComment = async (req: Request, res: Response): Promise<void> => {
  const { text } = req.body;
  const { targetModel, targetId } = req.params;
  const authorId = (req.user as { id: string }).id;

  if (!text || !text.trim()) {
    res.status(400).json({ message: 'متن کامنت نمی‌تواند خالی باشد.' });
    return;
  }

  try {
    let targetExists = null;

    // Use an if/else block to handle each model type separately
    if (targetModel === 'Project') {
      targetExists = await Project.findById(targetId);
    } else if (targetModel === 'Event') {
      targetExists = await Event.findById(targetId);
    } else {
      res.status(400).json({ message: 'نوع هدف نامعتبر است.' });
      return;
    }

    if (!targetExists) {
      res.status(404).json({ message: 'پروژه یا رویداد مورد نظر یافت نشد.' });
      return;
    }

    // The rest of the logic remains the same
    const newComment = new Comment({
      text,
      author: authorId,
      target: targetId,
      targetModel,
    });
    await newComment.save();

    const populatedComment = await newComment.populate('author', 'username fullName avatar');
    res.status(201).json(populatedComment);

  } catch (error: any) {
    console.error('Create Comment Error:', error.message);
    res.status(500).json({ message: 'خطای سرور' });
  }
};


/**
 * @desc دریافت تمام کامنت‌های یک هدف مشخص
 * @route GET /api/comments/:targetModel/:targetId
 * @access Public
 */
export const getCommentsByTarget = async (req: Request, res: Response): Promise<void> => {
    const { targetModel, targetId } = req.params;

    try {
        const comments = await Comment.find({
            target: targetId,
            targetModel: targetModel,
        })
        .populate('author', 'username fullName avatar') // اطلاعات نویسنده را اضافه کن
        .sort({ createdAt: -1 }); // جدیدترین کامنت‌ها اول نمایش داده شوند

        res.status(200).json(comments);

    } catch (error: any) {
        console.error('Get Comments Error:', error.message);
        res.status(500).json({ message: 'خطای سرور' });
    }
};

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  const { commentId } = req.params;
  const userId = (req.user as UserPayload).id;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({ message: 'کامنت یافت نشد.' });
      return;
    }

    // بررسی می‌کنیم که کاربر فعلی، نویسنده کامنت باشد
    if (comment.author.toString() !== userId) {
      res.status(403).json({ message: 'شما مجاز به حذف این کامنت نیستید.' });
      return;
    }

    await Comment.findByIdAndDelete(commentId);
    res.status(200).json({ message: 'کامنت با موفقیت حذف شد.' });
  } catch (error: any) {
    console.error('Delete Comment Error:', error.message);
    res.status(500).json({ message: 'خطای سرور' });
  }
};