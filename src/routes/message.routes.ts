import express from 'express';
import { sendMessage, getMessages, getConversations, deleteConversation, deleteMessage, markAsRead } from '../controllers/message.controller';
import { auth } from '../middlewares/auth.middleware';

const router = express.Router();

// تمام مسیرها نیاز به احراز هویت دارند
router.use(auth);

router.get('/conversations', getConversations);
router.get('/:otherUserId', getMessages);
router.post('/:receiverId', sendMessage);
router.delete('/conversation/:otherUserId', deleteConversation);

// حذف یک پیام
router.delete('/message/:messageId', deleteMessage);

// خوانده شده کردن پیام
router.patch('/message/:messageId/read',markAsRead);
export default router;
