import express from 'express';
import { createComment, getCommentsByTarget } from '../controllers/comment.controller';
import { auth } from '../middlewares/auth.middleware'; // میدل‌ور احراز هویت

const router = express.Router();

// یک مسیر داینامیک برای مدیریت هر دو نوع هدف (پروژه و رویداد)
router.route('/:targetModel(Project|Event)/:targetId')
    // مسیر عمومی برای دریافت کامنت‌ها
    .get(getCommentsByTarget)
    // مسیر خصوصی برای ایجاد کامنت (نیاز به لاگین دارد)
    .post(auth, createComment);

export default router;