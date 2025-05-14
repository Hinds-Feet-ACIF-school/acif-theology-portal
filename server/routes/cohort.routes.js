// server/routes/cohort.routes.js
import express from 'express';
import { getAvailableCohorts } from '../controllers/cohort.controller.js';

const router = express.Router();

router.get('/available', getAvailableCohorts);

export default router;