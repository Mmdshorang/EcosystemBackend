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
  getUserTeams,
  rateTeam,
  getPublicTeamDetails,
  cancelJoinRequest,
  removeMember,
  getMyTeamJoinRequests,
  getMyRequestsHistory, // 1. میدل‌ور آپلود را اینجا ایمپورت کن
} from '../controllers/team.controller';
import { auth } from '../middlewares/auth.middleware';

const router = express.Router();

// مسیر برای گرفتن تمام تیم‌ها
router.get('/my-teams', auth, getUserTeams);
router.get('/my-join-requests', auth, getMyTeamJoinRequests);
router.get('/my-requests-history', auth, getMyRequestsHistory);
router.get('/', getTeams);

// مسیر برای ساخت یک تیم جدید
// 2. میدل‌ور uploadAvatar برای مدیریت فایل آواتار اضافه شد
router.post('/', auth, uploadAvatar, createTeam);
// مسیرهای مربوط به یک تیم خاص با ID
router.post('/:id/rate', auth, rateTeam);
router.get('/details/:id', getPublicTeamDetails);

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
// مسیر برای لغو درخواست عضویت در تیم
// DELETE /api/teams/:teamId/request-join
router.delete('/:teamId/request-join', auth, cancelJoinRequest);
// مسیر برای پذیرش درخواست عضویت توسط لیدر
// POST /api/teams/:teamId/accept-request/:userId
router.delete('/:teamId/remove-member/:memberId', auth, removeMember);
router.post('/:teamId/accept-request/:userId', auth, acceptJoinRequest);

export default router;
