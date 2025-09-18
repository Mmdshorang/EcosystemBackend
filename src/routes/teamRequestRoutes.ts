import { Router } from 'express';
import { createTeamRequest, getAllTeamRequests, getTeamRequestById, updateTeamRequestStatus } from '../controllers/teamRequestController';
import { auth } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';

const router = Router();

// کاربر → ایجاد درخواست
router.post('/', auth, createTeamRequest);

// ادمین → دیدن همه درخواست‌ها
router.get('/', auth, authorize(['admin']), getAllTeamRequests);
router.get('/:id', auth, getTeamRequestById); 
// ادمین → تایید یا رد
router.put('/:id/status', auth, authorize(['admin']), updateTeamRequestStatus);

export default router;
