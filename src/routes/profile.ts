import express from 'express';
import { protect } from '../middlewares/auth';
import { getCurrentUserProfile, getProfileByUsername, updateUserProfile } from '../middlewares/profileController';



const router = express.Router();

// مسیر برای دریافت و ویرایش پروفایل کاربر لاگین کرده (نیازمند توکن)
router.route('/me')
  .get(protect, getCurrentUserProfile)
  .put(protect, updateUserProfile);

// مسیر عمومی برای مشاهده پروفایل دیگران با نام کاربری
router.get('/user/:username', getProfileByUsername);

export default router;