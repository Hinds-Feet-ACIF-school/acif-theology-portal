import express from "express";
import * as AdminController from "../controllers/admin.controller.js";


import { isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();


router.get("/users", isAdmin, AdminController.getAllUsers);
router.get("/users/role/:role", isAdmin, AdminController.getUsersByRole);
router.put("/users/:userId/role", isAdmin, AdminController.updateUserRole);

router.post("/users", isAdmin, AdminController.createUser);
router.delete("/users/:userId", isAdmin, AdminController.deleteUser);


router.post("/cohorts", isAdmin, AdminController.createCohort);
router.get("/cohorts", isAdmin, AdminController.getAllCohorts);

router.post("/cohorts/:cohortId/enroll", isAdmin, AdminController.enrollUserInCohort);


router.get("/stats", isAdmin, AdminController.getSystemStats);


router.get("/reported-posts", isAdmin, AdminController.getReportedPosts);

export default router;