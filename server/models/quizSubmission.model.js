// server/models/quizSubmission.model.js
import { db } from "../config/firebase.config.js";
import { FieldValue } from 'firebase-admin/firestore';

const quizSubmissionsCollection = db.collection("quizSubmissions");

// Call this when a user submits a quiz from QuizDisplay.tsx
export const recordQuizSubmission = async (userId, quizBlockId, courseId, weekId, answers, score, passed, quizTitle) => {
    try {
        const submissionData = {
            userId,
            quizBlockId, // The ID of the quiz block from RichContent
            courseId,
            weekId,
            answers, // The answers object { questionId: answerValue }
            score,   // Percentage score
            passed,  // Boolean
            quizTitle,
            submittedAt: FieldValue.serverTimestamp(),
        };
        const docRef = await quizSubmissionsCollection.add(submissionData);
        return { id: docRef.id, ...submissionData };
    } catch (error) {
        console.error("Error recording quiz submission:", error);
        throw new Error(`Database error recording quiz submission: ${error.message}`);
    }
};

// Used by the grades controller
export const getSubmissionForQuizBlock = async (userId, quizBlockId) => {
    try {
        const snapshot = await quizSubmissionsCollection
            .where("userId", "==", userId)
            .where("quizBlockId", "==", quizBlockId)
            .orderBy("submittedAt", "desc") // Get the latest submission
            .limit(1)
            .get();

        if (snapshot.empty) {
            return null; // No submission found
        }
        const submissionDoc = snapshot.docs[0];
        const data = submissionDoc.data();
        return {
            id: submissionDoc.id,
            ...data,
            submittedAt: data.submittedAt.toDate ? data.submittedAt.toDate() : data.submittedAt
        };
    } catch (error) {
        console.error(`Error getting submission for quizBlockId ${quizBlockId}, user ${userId}:`, error);
        throw new Error(`Database error getting quiz submission: ${error.message}`);
    }
};

// You might also want functions like:
// getAllSubmissionsForUserInCourse(userId, courseId)
// getAllSubmissionsForUserInWeek(userId, weekId)