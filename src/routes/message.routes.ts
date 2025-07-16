import express from 'express';
import { sendMessage, getMessages, getConversations } from '../controllers/message.controller';
import { auth } from '../middlewares/auth.middleware';

const router = express.Router();

// تمام مسیرها نیاز به احراز هویت دارند
router.use(auth);

router.get('/conversations', getConversations);
router.get('/:otherUserId', getMessages);
router.post('/:receiverId', sendMessage);

export default router;