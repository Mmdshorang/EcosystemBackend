import express from 'express';
// مسیر کنترلر خود را وارد کن
import { auth } from '../middlewares/auth.middleware'; // میدل‌ور احراز هویت
import { getAllUsers, getUserById, searchUsers } from '../controllers/profile.controller';

import { updateUserRole, deleteUser, getDashboardStats } from '../controllers/user.controller';
import { authorize } from '../middlewares/authorize.middleware';

const router = express.Router();

// روت برای گرفتن تمام کاربران
// GET /api/users/
router.get('/', auth, getAllUsers);

// روت برای جستجوی کاربران
// GET /api/users/search?q=...
// نکته: این روت باید قبل از روت /:id قرار بگیرد تا "search" به عنوان id در نظر گرفته نشود.
router.get('/search', auth, searchUsers);
router.get('/dashboard/stats', auth, getDashboardStats);
// روت برای گرفتن یک کاربر خاص با ID
// GET /api/users/:id
router.get('/:id', auth, getUserById);
router.patch('/:id/role', auth, authorize(['admin','association_manager']), updateUserRole);

router.delete('/:id', auth, authorize(['admin']), deleteUser);
export default router;
