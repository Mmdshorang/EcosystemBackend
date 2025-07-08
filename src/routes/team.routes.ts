import express from 'express';
import {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  requestToJoinTeam,
  acceptJoinRequest,
} from '../controllers/team.controller';
import { auth } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/teams', getTeams);


router.post('/', auth, createTeam);


router.route('/:id')
  .get(getTeamById)
  .put(auth, updateTeam)
  .delete(auth, deleteTeam);


// --- مسیرهای مدیریت عضویت ---
// POST /api/team/:id/request-join
router.post('/:id/request-join', auth, requestToJoinTeam);

// POST /api/team/:teamId/accept-request/:userId
router.post('/:teamId/accept-request/:userId', auth, acceptJoinRequest);

export default router;