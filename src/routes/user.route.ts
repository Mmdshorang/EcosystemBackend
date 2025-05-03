import express from 'express';
import { addSkillToUser, addWorkExperience, getSkills, getWorkExperiences } from '../controllers/user.controller';

import { register } from '../controllers/auth/register.controller';
import { login } from '../controllers/auth/login.controller';
import authenticateJWT from '../middlewares/authenticateJWT';
import { addMemberToTeam, createTeam, getTeamMembers, getTopTeams, getUserTeams } from '../controllers/teamController';


const router = express.Router();

router.post('/profile/addexperiences',authenticateJWT,addWorkExperience);
router.post('/profile/addskills',authenticateJWT,addSkillToUser);
router.post('/profile/getskills',authenticateJWT,getSkills);
router.post('/profile/getWorkExperiences',authenticateJWT,getWorkExperiences);

router.post('/myteams', authenticateJWT, getUserTeams);

router.post('/createteam', authenticateJWT, createTeam);
router.post('/addmember', authenticateJWT, addMemberToTeam);
router.post('/members', authenticateJWT, getTeamMembers);
router.post('/topteam', getTopTeams);

router.post('/register', register);
router.post('/login', login);

export default router;
