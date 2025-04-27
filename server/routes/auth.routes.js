import express from "express";
import * as AuthController from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();


router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/reset-password", AuthController.resetPassword);


router.post("/refresh-token", AuthController.refreshToken);


router.get("/me", verifyToken, AuthController.getCurrentUser);
router.post("/logout", verifyToken, AuthController.logout);

export default router;