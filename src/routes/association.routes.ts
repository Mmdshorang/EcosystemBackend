// src/routes/association.routes.ts

import { Router } from 'express';
import {
  createAssociation,
  getAllAssociations,
  getAssociationById,
  deleteAssociation,
  updateAssociation,
} from '../controllers/association.controller';
import { auth } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';

// میدل‌ورهایی که باید از قبل ساخته باشید

const router = Router();

// ===============================================
//                  روت‌های عمومی
// ===============================================

// دریافت لیست همه انجمن‌ها
router.get('/', getAllAssociations);

// دریافت یک انجمن با شناسه
router.get('/:id', getAssociationById);

router.post(
  '/',
  auth, // کاربر باید لاگین باشد
  authorize(['admin', 'association_manager']), // کاربر باید نقش ادمین داشته باشد
  createAssociation,
);
router.put(
  '/:id', // استفاده از متد PUT برای آپدیت کامل
  auth,
  authorize(['admin', 'association_manager']),
  updateAssociation, // اتصال به کنترلر جدید
);
// حذف یک انجمن
router.delete('/:id', auth, authorize(['admin']), deleteAssociation);

export default router;
