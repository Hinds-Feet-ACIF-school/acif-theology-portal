import express from "express";
import * as MaterialController from "../controllers/material.controller.js";
import { verifyToken, isInstructor } from "../middleware/auth.middleware.js";
import upload from '../config/multer.config.js';

const router = express.Router();



router.get("/by-week/:weekId", verifyToken, isInstructor, MaterialController.getMaterialsByWeek);


router.get("/:materialId", verifyToken, isInstructor, MaterialController.getMaterialById);


router.post(
    "/",
    verifyToken,
    isInstructor,
    upload.single('file'),
    MaterialController.createMaterial
);


router.put(
    "/:materialId",
    verifyToken,
    isInstructor,
    upload.single('file'),
    MaterialController.updateMaterial
);


router.delete("/:materialId", verifyToken, isInstructor, MaterialController.deleteMaterial);

export default router;