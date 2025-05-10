import express from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import courseRoutes from "./course.routes.js";
import weekRoutes from "./week.routes.js";
import materialRoutes from "./material.routes.js";
import quizRoutes from "./quiz.routes.js"; 
import discussionRoutes from "./discussion.routes.js";
import adminRoutes from "./admin.routes.js";
import sectionRoutes from "./section.routes.js";

import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", verifyToken, userRoutes);
router.use("/courses", courseRoutes);
router.use("/weeks", weekRoutes);
router.use("/materials", verifyToken, materialRoutes);
router.use("/quizzes", verifyToken, quizRoutes); 
router.use("/discussions", verifyToken, discussionRoutes);
router.use("/admin", verifyToken, adminRoutes);
router.use("/sections", sectionRoutes);

export default router;