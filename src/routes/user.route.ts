import express from 'express';
import { getAllUsers } from '../controllers/user.controller';
import auth from '../middlewares/auth';
import { register } from '../controllers/auth/register.controller';
import { login } from '../controllers/auth/login.controller';


const router = express.Router();

router.get('/', getAllUsers);
router.post('/register', register);
router.post('/login', login);

export default router;
