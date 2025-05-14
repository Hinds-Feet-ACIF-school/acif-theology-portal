// server/routes/userCourseAccess.routes.js
import express from 'express';
import { getUserCourseAccessState } from '../controllers/userCourseAccess.controller.js';
import { checkOptionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// CHANGE THIS LINE:
router.get('/state', checkOptionalAuth, getUserCourseAccessState); // Now matches /api/users/state

export default router;