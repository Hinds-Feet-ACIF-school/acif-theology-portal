import express from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import courseRoutes from "./course.routes.js";
import weekRoutes from "./week.routes.js";
import materialRoutes from "./material.routes.js";
import quizRoutes from "./quiz.routes.js";
import discussionRoutes from "./discussion.routes.js";
import cohortRoutes from './cohort.routes.js';
import adminRoutes from "./admin.routes.js";
import sectionRoutes from "./section.routes.js";
import uploadRoutes from "./upload.routes.js";
// REMOVED: import paymentRoutes from './payment.routes.js';
import utilityRoutes from './utility.routes.js'; 
import contentRoutes from "./content.routes.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import userCourseAccessRoutes from './userCourseAccess.routes.js';

const router = express.Router();

router.use("/users", userCourseAccessRoutes);
router.use("/users", verifyToken, userRoutes);
router.use("/auth", authRoutes);
router.use("/courses", courseRoutes);
router.use("/weeks", weekRoutes);
router.use("/materials", verifyToken, materialRoutes);
router.use("/quizzes", verifyToken, quizRoutes);
router.use("/discussions", verifyToken, discussionRoutes);
router.use("/admin", verifyToken, adminRoutes);
router.use("/sections", sectionRoutes);
router.use('/cohorts', cohortRoutes);
// REMOVED: router.use('/payments', paymentRoutes);
router.use("/content", contentRoutes); 
router.use(uploadRoutes);
router.use(utilityRoutes); 

export default router;