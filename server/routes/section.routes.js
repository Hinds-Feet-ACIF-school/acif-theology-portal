import express from "express";
import * as SectionController from "../controllers/section.controller.js";
import { isInstructor, verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply verifyToken middleware to all routes
router.use(verifyToken);

// Apply isInstructor middleware to all routes
router.use(isInstructor);

// Base routes
router.post("/", SectionController.createSection);
router.get("/by-week/:weekId", SectionController.getSectionsByWeek);
router.put("/:sectionId", SectionController.updateSection);
router.delete("/:sectionId", SectionController.deleteSection);

// Content routes
router.post("/:sectionId/content", SectionController.addContentToSection);
router.put("/:sectionId/content/:contentId", SectionController.updateContent);
router.delete("/:sectionId/content/:contentId", SectionController.deleteContent);

export default router; 