import * as QuizModel from "../models/quiz.model.js";
import * as WeekModel from "../models/week.model.js";
import * as UserModel from "../models/user.model.js";

export const createQuiz = async (req, res) => {
    try {
        const quizData = req.body;
        const { uid } = req.user;

        if (!quizData.weekId || !quizData.title) {
            return res.status(400).json({ message: "weekId and title are required." });
        }

        const week = await WeekModel.getWeekById(quizData.weekId);
        if (!week) {
            return res.status(404).json({ message: `Week with ID ${quizData.weekId} not found.` });
        }

        quizData.createdBy = uid;

        const newQuiz = await QuizModel.createQuiz(quizData);
        res.status(201).json({ message: "Quiz created successfully", quiz: newQuiz });

    } catch (error) {
        console.error("Error creating quiz:", error);
        res.status(500).json({ message: `Failed to create quiz: ${error.message}` });
    }
};

export const getQuizById = async (req, res) => {
    try {
        const { quizId } = req.params;
        const quiz = await QuizModel.getQuizById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }
        res.status(200).json(quiz);
    } catch (error) {
        console.error(`Error getting quiz ${req.params.quizId}:`, error);
        res.status(500).json({ message: `Failed to get quiz: ${error.message}` });
    }
};

export const getQuizzesByWeek = async (req, res) => {
    try {
        const { weekId } = req.params;
        if (!weekId) {
             return res.status(400).json({ message: "weekId parameter is required." });
        }
        const quizzes = await QuizModel.getQuizzesByWeekId(weekId);
        res.status(200).json(quizzes);
    } catch (error) {
        console.error(`Error getting quizzes for week ${req.params.weekId}:`, error);
        res.status(500).json({ message: `Failed to get quizzes: ${error.message}` });
    }
};

export const updateQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const quizData = req.body;

        const existing = await QuizModel.getQuizById(quizId);
        if (!existing) {
             return res.status(404).json({ message: "Quiz not found" });
        }

        const updatedQuiz = await QuizModel.updateQuiz(quizId, quizData);
        res.status(200).json({ message: "Quiz updated successfully", quiz: updatedQuiz });

    } catch (error) {
        console.error(`Error updating quiz ${req.params.quizId}:`, error);
        res.status(500).json({ message: `Failed to update quiz: ${error.message}` });
    }
};

export const deleteQuiz = async (req, res) => {
     try {
        const { quizId } = req.params;

        await QuizModel.deleteQuiz(quizId);
        res.status(200).json({ message: "Quiz deleted successfully." });
    } catch (error) {
        console.error(`Error deleting quiz ${req.params.quizId}:`, error);
        res.status(500).json({ message: `Failed to delete quiz: ${error.message}` });
    }
};




export const submitQuizAttempt = async (req, res) => {
    try {
        const submissionData = req.body;
        const { uid, name: userName, displayName } = req.user;
        const { quizId } = req.params;

        if (!quizId) {
             return res.status(400).json({ message: "quizId parameter is required." });
        }

        const quiz = await QuizModel.getQuizById(quizId);
        if (!quiz) return res.status(404).json({ message: "Quiz not found." });
        const week = await WeekModel.getWeekById(quiz.weekId);
        if (!week) return res.status(404).json({ message: "Parent week not found." });




        const dataToSubmit = {
            ...submissionData,
            quizId: quizId,
            userId: uid,
            userName: displayName || userName || "Unknown User",
            weekId: quiz.weekId,
            courseId: week.courseId,

        };

        const newSubmission = await QuizModel.submitQuizAttempt(dataToSubmit);
        res.status(201).json({ message: "Quiz attempt submitted successfully", submissionId: newSubmission.id });

    } catch (error) {
        console.error(`Error submitting quiz ${req.params.quizId} for user ${req.user.uid}:`, error);
        res.status(500).json({ message: `Failed to submit quiz attempt: ${error.message}` });
    }
};

export const gradeQuizSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const gradeData = req.body;
        const { uid: graderId } = req.user;

         if (gradeData.grade === undefined || gradeData.grade === null) {
            return res.status(400).json({ message: "A numeric grade value is required." });
        }

        const submission = await QuizModel.getSubmissionById(submissionId);
        if (!submission) return res.status(404).json({ message: "Submission not found." });


        gradeData.gradedBy = graderId;

        const updatedSubmission = await QuizModel.gradeQuizSubmission(submissionId, gradeData);
        res.status(200).json({ message: "Submission graded successfully", submission: updatedSubmission });

    } catch (error) {
         console.error(`Error grading quiz submission ${req.params.submissionId}:`, error);
         res.status(500).json({ message: `Failed to grade submission: ${error.message}` });
    }
};

export const getSubmissionsByQuiz = async (req, res) => {
     try {
        const { quizId } = req.params;
        if (!quizId) {
             return res.status(400).json({ message: "quizId parameter is required." });
        }
        const submissions = await QuizModel.getSubmissionsByQuiz(quizId);
        res.status(200).json(submissions);
    } catch (error) {
        console.error(`Error getting submissions for quiz ${req.params.quizId}:`, error);
        res.status(500).json({ message: `Failed to get submissions: ${error.message}` });
    }
};

export const getUserSubmissionForQuiz = async (req, res) => {
     try {
        const { quizId } = req.params;
        const { uid: userId } = req.user;
        if (!quizId) {
             return res.status(400).json({ message: "quizId parameter is required." });
        }
        const submission = await QuizModel.getUserSubmissionForQuiz(userId, quizId);
         if (!submission) {
            return res.status(404).json({ message: "No submission found for this quiz." });
        }
        res.status(200).json(submission);
    } catch (error) {
        console.error(`Error getting user submission for quiz ${req.params.quizId}:`, error);
        res.status(500).json({ message: `Failed to get submission: ${error.message}` });
    }
};


export const getMySubmissions = async (req, res) => {
     try {
        const { uid: userId } = req.user;

        const submissions = await QuizModel.getSubmissionsByUser(userId);
        res.status(200).json(submissions);
    } catch (error) {
        console.error(`Error getting user submissions for user ${req.user.uid}:`, error);
        res.status(500).json({ message: `Failed to get submissions: ${error.message}` });
    }
};