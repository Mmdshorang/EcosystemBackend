import express from 'express';
import {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  requestToJoinTeam,
  acceptJoinRequest,
  uploadAvatar,
  inviteUserToTeam,
  getUserTeams, // 1. میدل‌ور آپلود را اینجا ایمپورت کن
} from '../controllers/team.controller';
import { auth } from '../middlewares/auth.middleware';

const router = express.Router();

// مسیر برای گرفتن تمام تیم‌ها
router.get('/my-teams', auth, getUserTeams);
router.get('/', getTeams);

// مسیر برای ساخت یک تیم جدید
// 2. میدل‌ور uploadAvatar برای مدیریت فایل آواتار اضافه شد
router.post('/', auth, uploadAvatar, createTeam);
// مسیرهای مربوط به یک تیم خاص با ID
router
  .route('/:id')
  .get(getTeamById)
  // 3. میدل‌ور uploadAvatar برای مدیریت فایل آواتار در زمان ویرایش اضافه شد
  .put(auth, uploadAvatar, updateTeam)
  .delete(auth, deleteTeam);

// --- مسیرهای مدیریت عضویت ---
router.post('/:teamId/invite/:userId', auth, inviteUserToTeam);
// مسیر برای ارسال درخواست عضویت به تیم
// POST /api/teams/:id/request-join
router.post('/:id/request-join', auth, requestToJoinTeam);

// مسیر برای پذیرش درخواست عضویت توسط لیدر
// POST /api/teams/:teamId/accept-request/:userId
router.post('/:teamId/accept-request/:userId', auth, acceptJoinRequest);

export default router;
