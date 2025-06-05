// server/routes/router.js
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
import paymentRoutes from './payment.routes.js';
import utilityRoutes from './utility.routes.js'; 
import contentRoutes from "./content.routes.js";

import { verifyToken } from "../middleware/auth.middleware.js";
import userCourseAccessRoutes from './userCourseAccess.routes.js'; // This router itself defines /me/course-access-state

const router = express.Router();

// Mount specific user-related routes that have different auth needs first
// The userCourseAccessRoutes internally defines '/me/course-access-state'
// So, to make the full path /api/users/me/course-access-state, we mount it at /users
router.use("/users", userCourseAccessRoutes); // Handles /users/me/course-access-state with checkOptionalAuth

// General user routes that require strict authentication
router.use("/users", verifyToken, userRoutes); // Handles other /users/... routes with verifyToken

// Other routes
router.use("/auth", authRoutes);
router.use("/courses", courseRoutes);
router.use("/weeks", weekRoutes);
router.use("/materials", verifyToken, materialRoutes); // Assuming materials always require auth
router.use("/quizzes", verifyToken, quizRoutes);       // Assuming quizzes always require auth
router.use("/discussions", verifyToken, discussionRoutes);
router.use("/admin", verifyToken, adminRoutes);
router.use("/sections", sectionRoutes);
router.use('/cohorts', cohortRoutes);
router.use('/payments', paymentRoutes);
router.use("/content", contentRoutes); 
router.use(uploadRoutes); // Upload routes likely define their own full paths starting with /upload
router.use(utilityRoutes); 

export default router;