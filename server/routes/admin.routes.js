import express from "express";
import * as AdminController from "../controllers/admin.controller.js";
import * as AuthController from "../controllers/auth.controller.js"; // Import auth controller for user management
import { isAdmin } from "../middleware/auth.middleware.js"; // Assuming verifyToken is applied globally or before this router

const router = express.Router();

// User Management Routes (using AuthController as requested)
router.get("/users", isAdmin, AuthController.getAllUsersForAdmin);
router.post("/users", isAdmin, AuthController.createUserByAdmin);
router.delete("/users/:userId", isAdmin, AuthController.deleteUserAdmin);

// Other User/Role related routes (using AdminController)
router.get("/users/role/:role", isAdmin, AdminController.getUsersByRole);
router.put("/users/:userId/role", isAdmin, AdminController.updateUserRole);

// Cohort Routes (using AdminController)
router.post("/cohorts", isAdmin, AdminController.createCohort);
router.get("/cohorts", isAdmin, AdminController.getAllCohorts);
router.post("/cohorts/:cohortId/enroll", isAdmin, AdminController.enrollUserInCohort);

// Other Admin Routes (using AdminController)
router.get("/stats", isAdmin, AdminController.getSystemStats);
router.get("/reported-posts", isAdmin, AdminController.getReportedPosts);

export default router;