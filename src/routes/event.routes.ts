// src/routes/event.routes.ts

import { Router } from 'express';
import {
  createEvent,
  getEventsByAssociation,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getAllEvents,
  getEventRegistrations,
  archiveEvent,
  getMyAssociation,
  getEventById,
} from '../controllers/event.controller';
import { auth } from '../middlewares/auth.middleware';

const router = Router();

// ### روت‌های عمومی (برای همه کاربران) ###
router.get('/', getAllEvents); // دریافت همه رویدادهای آینده
router.get('/association/:associationId', getEventsByAssociation); // دریافت رویدادهای یک انجمن خاص

// ### روت‌های کاربران احراز هویت شده ###
router.post('/:id/register', auth, registerForEvent); // ثبت‌نام در یک رویداد

// ### روت‌های مخصوص مدیر انجمن ###
// تمام روت‌های زیر نیاز به احراز هویت دارند

// دریافت اطلاعات انجمنی که کاربر فعلی مدیر آن است
router.get('/associations/my-association', auth, getMyAssociation);

// ایجاد یک رویداد جدید برای انجمن خود
router.post('/', auth, createEvent);

// آپدیت یک رویداد
router.put('/:id', auth, updateEvent);
router.get('/:id', getEventById);
// حذف یک رویداد
router.delete('/:id', auth, deleteEvent);

// بایگانی کردن یک رویداد
router.patch('/:id/archive', auth, archiveEvent);

// دریافت لیست ثبت‌نامی‌های یک رویداد
router.get('/:id/registrations', auth, getEventRegistrations);

export default router;
