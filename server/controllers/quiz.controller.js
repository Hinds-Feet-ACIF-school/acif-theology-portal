import * as QuizModel from "../models/quiz.model.js";
import * as WeekModel from "../models/week.model.js"; // Still needed for createQuiz
import * as UserModel from "../models/user.model.js"; // Assuming used by other functions if any
import * as CourseModel from "../models/course.model.js"; // Assuming used by other functions if any

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
        const submissionBody = req.body;
        const { uid, name: userName, displayName } = req.user;
        const { quizId } = req.params;

        console.log("QUIZ CONTROLLER (submitQuizAttempt): Received req.body:", JSON.stringify(req.body, null, 2));
        console.log("QUIZ CONTROLLER (submitQuizAttempt): Received req.params:", JSON.stringify(req.params, null, 2));

        if (!quizId) {
            return res.status(400).json({ message: "quizId parameter is required." });
        }
        
        if (!submissionBody.weekId) {
            return res.status(400).json({ message: "weekId is required in the submission payload." });
        }
        if (!submissionBody.courseId) {
            return res.status(400).json({ message: "courseId is required in the submission payload." });
        }
        if (!submissionBody.answers) {
            return res.status(400).json({ message: "Answers are required in the submission payload." });
        }

        const dataToSubmitToModel = {
            answers: submissionBody.answers,
            quizId: quizId, 
            userId: uid,
            userName: displayName || userName || "Unknown User",
            weekId: submissionBody.weekId,
            courseId: submissionBody.courseId,
        };

        console.log("QuizController: Data being sent to QuizModel.submitQuizAttempt:", dataToSubmitToModel);

        const newSubmissionResult = await QuizModel.submitQuizAttempt(dataToSubmitToModel);
        res.status(201).json({ 
            message: "Quiz attempt submitted successfully", 
            submissionId: newSubmissionResult.id,
            score: newSubmissionResult.score,
            status: newSubmissionResult.status 
        });

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

         if (gradeData.score === undefined || gradeData.score === null) { // Changed 'grade' to 'score' for consistency
            return res.status(400).json({ message: "A numeric score value is required." });
        }

        const submission = await QuizModel.getSubmissionById(submissionId);
        if (!submission) return res.status(404).json({ message: "Submission not found." });

        const gradePayload = { // Renamed for clarity
            score: Number(gradeData.score),
            feedback: gradeData.feedback || "",
            gradedBy: graderId
        };

        const updatedSubmission = await QuizModel.gradeQuizSubmission(submissionId, gradePayload);
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
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated."});
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
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated."});
        }
        const submissions = await QuizModel.getSubmissionsByUser(userId);
        res.status(200).json(submissions);
    } catch (error) {
        console.error(`Error getting user submissions for user ${req.user.uid}:`, error);
        res.status(500).json({ message: `Failed to get submissions: ${error.message}` });
    }
};

export const getAdminQuizOverview = async (req, res) => {
    try {
        // Get all quizzes with their submission counts
        const quizzes = await QuizModel.getAllQuizzes();
        const quizOverviews = await Promise.all(quizzes.map(async (quiz) => {
            try {
                const submissions = await QuizModel.getSubmissionsByQuiz(quiz.id);
                let courseName = 'Unknown Course';
                let totalEligible = 0;
                let monthOrder = 1;
                let weekNumber = 1;

                if (quiz.courseId) {
                    const course = await CourseModel.getCourseById(quiz.courseId);
                    if (course) {
                        courseName = course.title;
                        // Get all users and count those enrolled in the course's cohort
                        const users = await UserModel.getAllUsers();
                        totalEligible = users.filter(user => 
                            user.role === 'student' && 
                            user.enrollment && 
                            user.enrollment.cohortId
                        ).length;
                    }
                }

                if (quiz.weekId) {
                    const week = await WeekModel.getWeekById(quiz.weekId);
                    if (week) {
                        monthOrder = week.monthOrder || 1;
                        weekNumber = week.weekNumber || 1;
                    }
                }
                
                return {
                    id: quiz.id,
                    courseId: quiz.courseId,
                    title: quiz.title,
                    courseName,
                    submittedCount: submissions.length,
                    totalEligible,
                    monthOrder,
                    weekNumber
                };
            } catch (error) {
                console.error(`Error processing quiz ${quiz.id}:`, error);
                return null;
            }
        }));

        // Filter out any null results from failed processing
        const validQuizOverviews = quizOverviews.filter(overview => overview !== null);

        res.status(200).json(validQuizOverviews);
    } catch (error) {
        console.error("Error getting admin quiz overview:", error);
        res.status(500).json({ message: `Failed to get quiz overview: ${error.message}` });
    }
};