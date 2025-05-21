// server/routes/auth.routes.js
import express from "express";
import * as AuthController from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// Renamed controller function for clarity
router.post("/request-password-reset", AuthController.requestPasswordReset); // Changed from /reset-password
// New route for confirming the password reset
router.post("/confirm-password-reset", AuthController.confirmPasswordReset);

router.post("/refresh-token", AuthController.refreshToken);
router.get("/me", verifyToken, AuthController.getCurrentUser); // Changed from /current-user to /me for convention
router.put("/profile", verifyToken, AuthController.updateUserProfile);
router.post("/change-password", verifyToken, AuthController.changePassword);
router.post("/logout", AuthController.logout); // verifyToken might be optional here or handled differently

export default router;