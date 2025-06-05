// server/models/quiz.model.js
import { db } from "../config/firebase.config.js";
import { FieldValue } from 'firebase-admin/firestore';

const quizzesCollection = db.collection("quizzes"); // This is your MAIN quizzes collection
const submissionsCollection = db.collection("submissions");

// --- NEW FUNCTION for creating a main quiz from rich content block data ---
export const createMainQuizFromContent = async (quizBlockData) => {
  try {
    // Validate essential data from the quiz block
    if (!quizBlockData.title || !quizBlockData.questions || !Array.isArray(quizBlockData.questions)) {
      throw new Error("Title and questions are required to create a main quiz entity.");
    }

    const dataToWrite = {
      title: quizBlockData.title,
      description: quizBlockData.description || "",
      questions: quizBlockData.questions, // Assuming this structure is correct for your main Quiz documents
      settings: quizBlockData.settings || {}, // Ensure settings are included
      // This main quiz entity might NOT be directly tied to a weekId or courseId at this level.
      // Its association comes from the ContentItem that references it via databaseQuizId.
      // Add other fields if your main 'Quizzes' documents require them by default.
      // e.g., isPublished: false, version: 1, etc.
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const quizRef = await quizzesCollection.add(dataToWrite);
    return { id: quizRef.id, ...dataToWrite }; // Return the created quiz with its new ID
  } catch (error) {
    console.error("Error creating main quiz from content block:", error);
    throw new Error(`Error creating main quiz: ${error.message}`);
  }
};

// --- getQuizById function (needed for auto-grading and potentially by QuizDisplay) ---
export const getQuizById = async (quizId) => {
  try {
    const quizDoc = await quizzesCollection.doc(quizId).get();
    if (!quizDoc.exists) {
      console.warn(`Quiz with ID ${quizId} not found in getQuizById.`);
      return null;
    }
    return { id: quizDoc.id, ...quizDoc.data() };
  } catch (error) {
    console.error(`Error getting quiz by ID (${quizId}):`, error);
    throw new Error(`Error getting quiz: ${error.message}`);
  }
};

// --- Your existing createQuiz (if still used for directly adding quizzes to weeks) ---
export const createQuiz = async (quizData) => {
  try {
    if (!quizData.weekId || !quizData.title) {
      throw new Error("weekId and title are required to create a quiz.");
    }
    const dataToWrite = {
      weekId: quizData.weekId, // Directly linked to a week
      title: quizData.title,
      description: quizData.description || "",
      instructions: quizData.instructions || "",
      questions: quizData.questions || [],
      settings: quizData.settings || {},
      quizUrl: quizData.quizUrl || "", // If you have external quiz links
      points: quizData.points === undefined ? null : quizData.points,
      dueDateOffsetDays: quizData.dueDateOffsetDays === undefined ? null : quizData.dueDateOffsetDays,
      order: quizData.order || 0,
      createdBy: quizData.createdBy || null, // Could be req.user.uid from controller
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    const quizRef = await quizzesCollection.add(dataToWrite);
    return { id: quizRef.id, ...dataToWrite };
  } catch (error) {
    console.error("Error creating quiz (direct to week):", error);
    throw new Error(`Error creating quiz (direct to week): ${error.message}`);
  }
};

export const getQuizzesByWeekId = async (weekId) => {
  try {
    if (!weekId) throw new Error("weekId is required.");
    const quizzesSnapshot = await quizzesCollection
      .where("weekId", "==", weekId) // This fetches quizzes directly linked to a week
      .orderBy("order", "asc")
      .orderBy("createdAt", "asc")
      .get();
    const quizzes = [];
    quizzesSnapshot.forEach((doc) => {
      quizzes.push({ id: doc.id, ...doc.data() });
    });
    return quizzes;
  } catch (error) {
    console.error(`Error getting quizzes for week (${weekId}):`, error);
    throw new Error(`Error getting quizzes by week: ${error.message}`);
  }
};

export const updateQuiz = async (quizId, quizData) => {
  try {
    if (!quizId) throw new Error("quizId is required for update.");
    
    // Prepare updateData carefully, only including fields meant to be updated.
    // Exclude fields that shouldn't change or are managed by timestamps.
    const { id, weekId, courseId, createdAt, createdBy, ...validQuizData } = quizData;

    const updateData = {
      ...validQuizData, // This will include title, description, questions, settings if sent
      points: quizData.points === undefined ? null : quizData.points, // Handle explicit nulls or values
      dueDateOffsetDays: quizData.dueDateOffsetDays === undefined ? null : quizData.dueDateOffsetDays,
      quizUrl: quizData.quizUrl === undefined ? "" : quizData.quizUrl, // Default to empty string if undefined
      updatedAt: FieldValue.serverTimestamp(),
    };

    await quizzesCollection.doc(quizId).update(updateData);
    const updatedDoc = await quizzesCollection.doc(quizId).get();
    if (!updatedDoc.exists) {
        throw new Error(`Quiz with ID ${quizId} not found after update.`);
    }
    return { id: updatedDoc.id, ...updatedDoc.data() };
  } catch (error) {
    console.error(`Error updating quiz (${quizId}):`, error);
    throw new Error(`Error updating quiz: ${error.message}`);
  }
};

export const deleteQuiz = async (quizId) => {
  try {
    if (!quizId) throw new Error("quizId is required for deletion.");
    // Before deleting a quiz, you might want to consider what happens to:
    // 1. RichContentItemBlocks that reference this quiz via databaseQuizId.
    //    Should they be updated to remove the link? Or show "Quiz not found"?
    // 2. Submissions for this quiz. Should they be archived or deleted?
    // For now, just deleting the quiz document:
    await quizzesCollection.doc(quizId).delete();
    console.log(`Quiz ${quizId} deleted.`);
    return { success: true, message: "Quiz deleted successfully" };
  } catch (error) {
    console.error(`Error deleting quiz (${quizId}):`, error);
    throw new Error(`Error deleting quiz: ${error.message}`);
  }
};

export const submitQuizAttempt = async (submissionData) => {
  try {
    if (!submissionData.quizId || !submissionData.userId || !submissionData.answers) { // weekId/courseId might come from quiz definition
        throw new Error("quizId, userId, and answers are required for submission.");
    }

    const quizDefinition = await getQuizById(submissionData.quizId);
    if (!quizDefinition) {
        throw new Error(`Quiz with ID ${submissionData.quizId} not found for grading.`);
    }
    const questions = quizDefinition.questions || [];
    
    let calculatedScore = null;
    if (questions.length > 0) {
        let correctCount = 0;
        questions.forEach(q => {
            const userAnswer = submissionData.answers[q.id];
            let isCorrect = false;
            if (q.type === 'multiple_choice' || q.type === 'checkbox') {
                const correctOptions = q.options?.filter(opt => opt.isCorrect).map(opt => opt.id) || [];
                if (q.type === 'multiple_choice') {
                    isCorrect = userAnswer === correctOptions[0];
                } else if (q.type === 'checkbox') {
                    const userAnswerArray = Array.isArray(userAnswer) ? userAnswer.sort() : [];
                    const sortedCorrectOptions = [...correctOptions].sort();
                    isCorrect = sortedCorrectOptions.length === userAnswerArray.length && 
                                sortedCorrectOptions.every((id, index) => id === userAnswerArray[index]);
                }
            }
            if (isCorrect) correctCount++;
        });
        calculatedScore = Math.round((correctCount / questions.length) * 100);
    }

    const dataToWrite = {
      quizId: submissionData.quizId,
      weekId: submissionData.weekId || quizDefinition.weekId || null, // Prefer submissionData, fallback to quizDef
      courseId: submissionData.courseId || quizDefinition.courseId || null, // Prefer submissionData, fallback to quizDef
      userId: submissionData.userId,
      userName: submissionData.userName || "Unknown User",
      answers: submissionData.answers,
      status: calculatedScore !== null ? "graded" : "submitted",
      score: calculatedScore, // Changed from 'grade' to 'score' to match UserQuizSubmission interface
      feedback: "",
      submittedAt: FieldValue.serverTimestamp(),
      gradedAt: calculatedScore !== null ? FieldValue.serverTimestamp() : null,
      updatedAt: FieldValue.serverTimestamp(),
    };

    const submissionRef = await submissionsCollection.add(dataToWrite);
    return { id: submissionRef.id, score: calculatedScore, status: dataToWrite.status };

  } catch (error) {
    console.error(`Error submitting quiz attempt for user ${submissionData.userId}, quiz ${submissionData.quizId}:`, error);
    throw new Error(`Error submitting quiz attempt: ${error.message}`);
  }
};

export const gradeQuizSubmission = async (submissionId, gradeData) => {
  try {
     if (!submissionId) {
        throw new Error("submissionId is required for grading.");
    }
    if (gradeData.score === undefined || gradeData.score === null) { // Changed from 'grade' to 'score'
        throw new Error("A score value is required.");
    }
    const updateData = {
      score: Number(gradeData.score), // Changed from 'grade' to 'score'
      feedback: gradeData.feedback || "",
      status: "graded",
      gradedBy: gradeData.gradedBy || null,
      gradedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await submissionsCollection.doc(submissionId).update(updateData);
    const updatedDoc = await submissionsCollection.doc(submissionId).get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  } catch (error) {
     console.error(`Error grading quiz submission (${submissionId}):`, error);
    throw new Error(`Error grading quiz submission: ${error.message}`);
  }
};

export const getSubmissionById = async (submissionId) => {
  try {
    const submissionDoc = await submissionsCollection.doc(submissionId).get();
    if (!submissionDoc.exists) {
      return null;
    }
    return { id: submissionDoc.id, ...submissionDoc.data() };
  } catch (error) {
    console.error(`Error getting submission by ID (${submissionId}):`, error);
    throw new Error(`Error getting submission: ${error.message}`);
  }
};

export const getSubmissionsByQuiz = async (quizId) => {
  try {
    if (!quizId) throw new Error("quizId is required.");
    const submissionsSnapshot = await submissionsCollection
        .where("quizId", "==", quizId)
        .orderBy("submittedAt", "desc")
        .get();
    const submissions = [];
    submissionsSnapshot.forEach((doc) => {
      submissions.push({ id: doc.id, ...doc.data() });
    });
    return submissions;
  } catch (error) {
    console.error(`Error getting submissions by quiz (${quizId}):`, error);
    throw new Error(`Error getting submissions by quiz: ${error.message}`);
  }
};

export const getSubmissionsByUser = async (userId) => {
  try {
     if (!userId) throw new Error("userId is required.");
    const submissionsSnapshot = await submissionsCollection
        .where("userId", "==", userId)
        .orderBy("submittedAt", "desc")
        .get();
    const submissions = [];
    submissionsSnapshot.forEach((doc) => {
      submissions.push({ id: doc.id, ...doc.data() });
    });
    return submissions;
  } catch (error)
    {
        console.error(`Error getting submissions by user (${userId}):`, error);
        throw new Error(`Error getting submissions by user: ${error.message}`);
    }
};

export const getUserSubmissionForQuiz = async (userId, quizId) => {
     try {
        if (!userId || !quizId) throw new Error("userId and quizId are required.");
        const submissionsSnapshot = await submissionsCollection
            .where("userId", "==", userId)
            .where("quizId", "==", quizId)
            .orderBy("submittedAt", "desc")
            .limit(1)
            .get();

        if (submissionsSnapshot.empty) {
            return null;
        }
        const doc = submissionsSnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    } catch (error) {
        console.error(`Error getting submission for user ${userId}, quiz ${quizId}:`, error);
        throw new Error(`Error getting user submission for quiz: ${error.message}`);
    }
};

export const getAllQuizzes = async () => {
  try {
    const quizzesSnapshot = await quizzesCollection
      .orderBy("createdAt", "desc")
      .get();
    const quizzes = [];
    quizzesSnapshot.forEach((doc) => {
      quizzes.push({ id: doc.id, ...doc.data() });
    });
    return quizzes;
  } catch (error) {
    console.error("Error getting all quizzes:", error);
    throw new Error(`Error getting all quizzes: ${error.message}`);
  }
};

export const getQuizzesByCourseId = async (courseId) => {
  try {
    if (!courseId) throw new Error("courseId is required.");
    const quizzesSnapshot = await quizzesCollection
      .where("courseId", "==", courseId)
      .orderBy("createdAt", "asc")
      .get();
    const quizzes = [];
    quizzesSnapshot.forEach((doc) => {
      quizzes.push({ id: doc.id, ...doc.data() });
    });
    return quizzes;
  } catch (error) {
    console.error(`Error getting quizzes for course (${courseId}):`, error);
    throw new Error(`Error getting quizzes by course: ${error.message}`);
  }
};

export const QuizModel = {
  createMainQuizFromContent,
  getQuizById,
  createQuiz,
  getQuizzesByWeekId,
  updateQuiz,
  deleteQuiz,
  submitQuizAttempt,
  gradeQuizSubmission,
  getSubmissionById,
  getSubmissionsByQuiz,
  getSubmissionsByUser,
  getUserSubmissionForQuiz,
  getAllQuizzes,
  getQuizzesByCourseId
};