import express from 'express';
import { createProject, getProjects, updateProject, deleteProject, getMyProjects, getProjectsByTeam, getProjectById } from '../controllers/project.controller';
import { auth } from '../middlewares/auth.middleware';

const router = express.Router();

// @route   GET /api/projects
// @desc    Get all projects (public with pagination)
// @access  Public
router.get('/', getProjects);

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post('/', auth, createProject);
router.get('/:teamId/projects', getProjectsByTeam);
// @route   PUT /api/projects/:id
// @desc    Update a specific project
// @access  Private
router.put('/:id', auth, updateProject);
router.get('/:id', getProjectById);
// @route   DELETE /api/projects/:id
// @desc    Delete a specific project
// @access  Private
router.get('/my-projects', auth, getMyProjects);
router.delete('/:id', auth, deleteProject);

export default router;
