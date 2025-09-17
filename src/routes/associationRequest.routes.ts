// routes/associationRequest.routes.ts
import { Router } from 'express';
import { createAssociationRequest } from '../controllers/association.controller';
import {
  getAllAssociationRequests,
  getAssociationRequestById,
  getMyAssociationRequests,
  updateAssociationRequestStatus,
} from '../controllers/admin.controller';

import { auth } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';

const router = Router();

// -------------------
// مسیرهای کاربر عادی
// -------------------
router.post('/', auth, createAssociationRequest); // ایجاد درخواست
router.get('/me', auth, getMyAssociationRequests); // گرفتن درخواست‌های خود کاربر
router.get('/me/:id', auth, getAssociationRequestById); // گرفتن جزئیات درخواست خود کاربر

// -------------------
// مسیرهای ادمین
// -------------------
router.get('/', auth, authorize(['admin']), getAllAssociationRequests); // همه درخواست‌ها
router.get('/:id', auth, authorize(['admin']), getAssociationRequestById); // جزئیات درخواست
router.patch('/:id/status', auth, authorize(['admin']), updateAssociationRequestStatus); // تایید/رد درخواست

export default router;
