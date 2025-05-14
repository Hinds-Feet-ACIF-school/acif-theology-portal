import express from "express";
import * as WeekController from "../controllers/week.controller.js";
import { isInstructor, isAdmin, verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
    "/by-course/:courseId",
    verifyToken,
    WeekController.getWeeksByCourse
);

router.get(
    "/:weekId/details",
    verifyToken,
    WeekController.getWeekWithDetails
);

router.get(
    "/:weekId/progress",
    verifyToken,
    WeekController.getUserProgress
);

router.put(
    "/:weekId/sections/:sectionId/progress",
    verifyToken,
    WeekController.updateUserSectionProgress
);

router.post(
    "/",
    verifyToken,
    isInstructor,
    WeekController.createWeek
);

router.put(
    "/:weekId",
    verifyToken,
    isInstructor,
    WeekController.updateWeek
);

router.delete(
    "/:weekId",
    verifyToken,
    isInstructor,
    WeekController.deleteWeek
);

export default router;