import { db } from "../config/firebase.config.js";
import { FieldValue } from 'firebase-admin/firestore';

const quizzesCollection = db.collection("quizzes");

const submissionsCollection = db.collection("submissions");

export const createQuiz = async (quizData) => {
  try {
    if (!quizData.weekId || !quizData.title) {
      throw new Error("weekId and title are required to create a quiz.");
    }

    const dataToWrite = {
      weekId: quizData.weekId,
      title: quizData.title,
      description: quizData.description || "",
      instructions: quizData.instructions || "",
      quizUrl: quizData.quizUrl || "",
      points: quizData.points === undefined ? null : quizData.points,
      dueDateOffsetDays: quizData.dueDateOffsetDays === undefined ? null : quizData.dueDateOffsetDays,
      order: quizData.order || 0,
      createdBy: quizData.createdBy || null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const quizRef = await quizzesCollection.add(dataToWrite);
    return { id: quizRef.id, ...dataToWrite };

  } catch (error) {
    console.error("Error creating quiz:", error);
    throw new Error(`Error creating quiz: ${error.message}`);
  }
};

export const getQuizById = async (quizId) => {
  try {
    const quizDoc = await quizzesCollection.doc(quizId).get();
    if (!quizDoc.exists) {
      return null;
    }
    return { id: quizDoc.id, ...quizDoc.data() };
  } catch (error) {
    console.error(`Error getting quiz by ID (${quizId}):`, error);
    throw new Error(`Error getting quiz: ${error.message}`);
  }
};

export const getQuizzesByWeekId = async (weekId) => {
  try {
    if (!weekId) throw new Error("weekId is required.");

    const quizzesSnapshot = await quizzesCollection
      .where("weekId", "==", weekId)
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

    delete quizData.id;
    delete quizData.weekId;
    delete quizData.createdAt;
    delete quizData.createdBy;

    const updateData = {
      ...quizData,

      points: quizData.points === undefined ? null : quizData.points,
      dueDateOffsetDays: quizData.dueDateOffsetDays === undefined ? null : quizData.dueDateOffsetDays,
      quizUrl: quizData.quizUrl === undefined ? "" : quizData.quizUrl,
      updatedAt: FieldValue.serverTimestamp(),
    };

    await quizzesCollection.doc(quizId).update(updateData);
    const updatedDoc = await quizzesCollection.doc(quizId).get();
    return { id: updatedDoc.id, ...updatedDoc.data() };

  } catch (error) {
    console.error(`Error updating quiz (${quizId}):`, error);
    throw new Error(`Error updating quiz: ${error.message}`);
  }
};

export const deleteQuiz = async (quizId) => {
  try {
    if (!quizId) throw new Error("quizId is required for deletion.");







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
    if (!submissionData.quizId || !submissionData.userId || !submissionData.weekId || !submissionData.courseId ) {
        throw new Error("quizId, userId, weekId, and courseId are required for submission.");
    }

    const dataToWrite = {
      quizId: submissionData.quizId,
      weekId: submissionData.weekId,
      courseId: submissionData.courseId,
      userId: submissionData.userId,
      userName: submissionData.userName || "Unknown User",


      status: "submitted",
      grade: submissionData.grade === undefined ? null : submissionData.grade,
      feedback: "",
      submittedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const submissionRef = await submissionsCollection.add(dataToWrite);
    return { id: submissionRef.id };

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
    if (gradeData.grade === undefined || gradeData.grade === null) {
        throw new Error("A grade value is required.");
    }

    const updateData = {
      grade: gradeData.grade,
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