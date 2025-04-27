import express from "express";
import * as WeekController from "../controllers/week.controller.js";
import { isInstructor, isAdmin, verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();


router.post("/", verifyToken, isInstructor, WeekController.createWeek);


router.get("/by-course/:courseId", verifyToken, isInstructor, WeekController.getWeeksByCourse);


router.put("/:weekId", verifyToken, isInstructor, WeekController.updateWeek);


router.delete("/:weekId", verifyToken, isInstructor, WeekController.deleteWeek);

export default router;