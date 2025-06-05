import express from "express";
import * as QuizController from "../controllers/quiz.controller.js";
import { isInstructor, isAdmin, verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();


router.post("/", verifyToken, isInstructor, QuizController.createQuiz);

router.get("/by-week/:weekId", verifyToken, isInstructor, QuizController.getQuizzesByWeek);

router.get("/:quizId", verifyToken, isInstructor, QuizController.getQuizById);

router.put("/:quizId", verifyToken, isInstructor, QuizController.updateQuiz);

router.delete("/:quizId", verifyToken, isInstructor, QuizController.deleteQuiz);


router.get("/:quizId/submissions", verifyToken, isInstructor, QuizController.getSubmissionsByQuiz);

router.get("/admin/overview", verifyToken, isAdmin, QuizController.getAdminQuizOverview);


router.post("/submissions/:submissionId/grade", verifyToken, isInstructor, QuizController.gradeQuizSubmission);


router.post("/:quizId/submit", verifyToken, QuizController.submitQuizAttempt);


router.get("/:quizId/my-submission", verifyToken, QuizController.getUserSubmissionForQuiz);

export default router;