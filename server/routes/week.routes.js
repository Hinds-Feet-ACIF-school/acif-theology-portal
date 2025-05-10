// server/routes/week.routes.js
import express from "express";
import * as WeekController from "../controllers/week.controller.js";
import { isInstructor, isAdmin, verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET a list of weeks for a specific course
router.get(
    "/by-course/:courseId",
    verifyToken,
    WeekController.getWeeksByCourse // This controller method must exist and be exported
);

// GET detailed information for a specific week, including its sections and content
router.get(
    "/:weekId/details",
    verifyToken,
    WeekController.getWeekWithDetails // This controller method MUST exist and be exported
);

// POST to create a new week
router.post(
    "/",
    verifyToken,
    isInstructor,
    WeekController.createWeek // This controller method must exist and be exported
);

// PUT to update an existing week
router.put(
    "/:weekId",
    verifyToken,
    isInstructor,
    WeekController.updateWeek // This controller method must exist and be exported
);

// DELETE a week
router.delete(
    "/:weekId",
    verifyToken,
    isInstructor,
    WeekController.deleteWeek // This controller method must exist and be exported
);

export default router;