import { db } from "../config/firebase.config.js";
import { FieldValue } from 'firebase-admin/firestore';

const assignmentsCollection = db.collection("assignments");
const submissionsCollection = db.collection("submissions");

export const createAssignment = async (assignmentData) => {
  try {

    if (!assignmentData.weekId || !assignmentData.title) {
      throw new Error("weekId and title are required to create an assignment.");
    }


    const dataToWrite = {
      weekId: assignmentData.weekId,
      title: assignmentData.title,
      description: assignmentData.description || "",
      instructions: assignmentData.instructions || "",
      type: assignmentData.type || "essay",
      points: assignmentData.points === undefined ? 100 : assignmentData.points,
      dueDateOffsetDays: assignmentData.dueDateOffsetDays === undefined ? null : assignmentData.dueDateOffsetDays,
      order: assignmentData.order || 0,
      createdBy: assignmentData.createdBy || null,


      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const assignmentRef = await assignmentsCollection.add(dataToWrite);
    return { id: assignmentRef.id, ...dataToWrite };

  } catch (error) {
    console.error("Error creating assignment:", error);
    throw new Error(`Error creating assignment: ${error.message}`);
  }
};

export const getAssignmentById = async (assignmentId) => {
  try {
    const assignmentDoc = await assignmentsCollection.doc(assignmentId).get();
    if (!assignmentDoc.exists) {
      return null;
    }
    return { id: assignmentDoc.id, ...assignmentDoc.data() };
  } catch (error) {
    console.error(`Error getting assignment by ID (${assignmentId}):`, error);
    throw new Error(`Error getting assignment: ${error.message}`);
  }
};

export const getAssignmentsByWeekId = async (weekId) => {
  try {
    if (!weekId) throw new Error("weekId is required.");

    const assignmentsSnapshot = await assignmentsCollection
      .where("weekId", "==", weekId)
      .orderBy("order", "asc")
      .orderBy("createdAt", "asc")
      .get();

    const assignments = [];
    assignmentsSnapshot.forEach((doc) => {
      assignments.push({ id: doc.id, ...doc.data() });
    });

    return assignments;
  } catch (error) {
    console.error(`Error getting assignments for week (${weekId}):`, error);
    throw new Error(`Error getting assignments by week: ${error.message}`);
  }
};

export const updateAssignment = async (assignmentId, assignmentData) => {
  try {
    if (!assignmentId) throw new Error("assignmentId is required for update.");


    delete assignmentData.id;
    delete assignmentData.weekId;
    delete assignmentData.createdAt;
    delete assignmentData.createdBy;

    const updateData = {
      ...assignmentData,

      points: assignmentData.points === undefined ? FieldValue.delete() : assignmentData.points,
      dueDateOffsetDays: assignmentData.dueDateOffsetDays === undefined ? null : assignmentData.dueDateOffsetDays,
      updatedAt: FieldValue.serverTimestamp(),
    };

    await assignmentsCollection.doc(assignmentId).update(updateData);

    const updatedDoc = await assignmentsCollection.doc(assignmentId).get();
    return { id: updatedDoc.id, ...updatedDoc.data() };

  } catch (error) {
    console.error(`Error updating assignment (${assignmentId}):`, error);
    throw new Error(`Error updating assignment: ${error.message}`);
  }
};

export const deleteAssignment = async (assignmentId) => {
  try {
    if (!assignmentId) throw new Error("assignmentId is required for deletion.");


    const submissionsSnapshot = await submissionsCollection.where('assignmentId', '==', assignmentId).get();
    if (!submissionsSnapshot.empty) {
      const batch = db.batch();
      submissionsSnapshot.docs.forEach(doc => {

        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`Deleted ${submissionsSnapshot.size} submissions for assignment ${assignmentId}.`);
    }


    await assignmentsCollection.doc(assignmentId).delete();
    console.log(`Assignment ${assignmentId} deleted.`);
    return { success: true, message: "Assignment and associated submissions deleted successfully" };
  } catch (error) {
    console.error(`Error deleting assignment (${assignmentId}):`, error);
    throw new Error(`Error deleting assignment: ${error.message}`);
  }
};



export const submitAssignment = async (submissionData) => {
  try {

    if (!submissionData.assignmentId || !submissionData.userId || !submissionData.weekId || !submissionData.courseId ) {
        throw new Error("assignmentId, userId, weekId, and courseId are required for submission.");
    }


    const dataToWrite = {
      assignmentId: submissionData.assignmentId,
      weekId: submissionData.weekId,
      courseId: submissionData.courseId,
      userId: submissionData.userId,
      userName: submissionData.userName || "Unknown User",
      content: submissionData.content || "",
      attachments: submissionData.attachments || [],
      status: "submitted",
      grade: null,
      feedback: "",
      submittedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const submissionRef = await submissionsCollection.add(dataToWrite);
    return { id: submissionRef.id };

  } catch (error) {
    console.error(`Error submitting assignment for user ${submissionData.userId}, assignment ${submissionData.assignmentId}:`, error);
    throw new Error(`Error submitting assignment: ${error.message}`);
  }
};

export const gradeSubmission = async (submissionId, gradeData) => {
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
     console.error(`Error grading submission (${submissionId}):`, error);
    throw new Error(`Error grading submission: ${error.message}`);
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

export const getSubmissionsByAssignment = async (assignmentId) => {
  try {
    if (!assignmentId) throw new Error("assignmentId is required.");

    const submissionsSnapshot = await submissionsCollection
        .where("assignmentId", "==", assignmentId)
        .orderBy("submittedAt", "desc")
        .get();

    const submissions = [];
    submissionsSnapshot.forEach((doc) => {
      submissions.push({ id: doc.id, ...doc.data() });
    });

    return submissions;
  } catch (error) {
    console.error(`Error getting submissions by assignment (${assignmentId}):`, error);
    throw new Error(`Error getting submissions by assignment: ${error.message}`);
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


export const getUserSubmissionForAssignment = async (userId, assignmentId) => {
     try {
        if (!userId || !assignmentId) throw new Error("userId and assignmentId are required.");

        const submissionsSnapshot = await submissionsCollection
            .where("userId", "==", userId)
            .where("assignmentId", "==", assignmentId)
            .limit(1)
            .get();

        if (submissionsSnapshot.empty) {
            return null;
        }
        const doc = submissionsSnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    } catch (error) {
        console.error(`Error getting submission for user ${userId}, assignment ${assignmentId}:`, error);
        throw new Error(`Error getting user submission: ${error.message}`);
    }
}