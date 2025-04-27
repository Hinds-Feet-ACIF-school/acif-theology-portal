import express from "express";
import * as AssignmentController from "../controllers/assignment.controller.js";
import { isInstructor, isAdmin, verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();


router.post("/", verifyToken, isInstructor, AssignmentController.createAssignment);


router.get("/:assignmentId", verifyToken, isInstructor, AssignmentController.getAssignmentById);


router.put("/:assignmentId", verifyToken, isInstructor, AssignmentController.updateAssignment);


router.delete("/:assignmentId", verifyToken, isInstructor, AssignmentController.deleteAssignment);


router.get("/:assignmentId/submissions", verifyToken, isInstructor, AssignmentController.getSubmissionsByAssignment);


router.post("/submissions/:submissionId/grade", verifyToken, isInstructor, AssignmentController.gradeSubmission);



router.post("/:assignmentId/submit", verifyToken, AssignmentController.submitAssignment);


router.get("/:assignmentId/my-submission", verifyToken, AssignmentController.getMySubmissionForAssignment);





export default router;