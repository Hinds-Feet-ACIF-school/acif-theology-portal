import express from "express";

import * as UserController from "../controllers/auth.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();


router.get("/profile", UserController.getCurrentUser);


router.put("/profile", UserController.updateUserProfile);


router.post("/change-password", UserController.changePassword);

export default router;