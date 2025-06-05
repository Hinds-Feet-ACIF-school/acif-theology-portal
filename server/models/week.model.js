import { db } from "../config/firebase.config.js";
import { FieldValue } from 'firebase-admin/firestore';

const weeksCollection = db.collection("weeks");
const materialsCollection = db.collection("materials");
const quizzesCollection = db.collection("quizzes");
const sectionsCollection = db.collection("sections");
const progressCollection = db.collection("userWeekProgress");

export const createWeek = async (weekData) => {
  try {
    if (!weekData.courseId || !weekData.weekNumber || !weekData.title) {
      throw new Error("courseId, weekNumber, and title are required to create a week.");
    }

    const existingCheck = await weeksCollection
        .where('courseId', '==', weekData.courseId)
        .where('weekNumber', '==', parseInt(String(weekData.weekNumber), 10))
        .limit(1)
        .get();

    if (!existingCheck.empty) {
        throw new Error(`Week ${weekData.weekNumber} already exists for course ${weekData.courseId}. Use update instead.`);
    }

    const dataToWrite = {
      courseId: weekData.courseId,
      weekNumber: parseInt(String(weekData.weekNumber), 10),
      title: weekData.title,
      description: weekData.description || "",
      monthOrder: Math.ceil(parseInt(String(weekData.weekNumber), 10) / 4),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const weekRef = await weeksCollection.add(dataToWrite);
    const newWeekDoc = await weekRef.get();
    const newWeekData = newWeekDoc.data() || {};
    if (newWeekData.createdAt && typeof newWeekData.createdAt.toDate === 'function') newWeekData.createdAt = newWeekData.createdAt.toDate();
    if (newWeekData.updatedAt && typeof newWeekData.updatedAt.toDate === 'function') newWeekData.updatedAt = newWeekData.updatedAt.toDate();

    return { id: weekRef.id, ...newWeekData };

  } catch (error) {
    console.error("Error creating week:", error);
    const message = (error && typeof error === 'object' && error.message) ? error.message : "Unknown error";
    throw new Error(`Error creating week: ${message}`);
  }
};
export const getWeekById = async (weekId) => {
  try {
    if (!weekId) throw new Error("weekId is required.");
    const weekDoc = await weeksCollection.doc(weekId).get();
    if (!weekDoc.exists) {
      return null;
    }
     const weekData = weekDoc.data() || {};
     if (weekData.createdAt && typeof weekData.createdAt.toDate === 'function') {
        weekData.createdAt = weekData.createdAt.toDate();
     }
     if (weekData.updatedAt && typeof weekData.updatedAt.toDate === 'function') {
        weekData.updatedAt = weekData.updatedAt.toDate();
     }
    return { id: weekDoc.id, ...weekData };
  } catch (error) {
    console.error(`Error getting week by ID (${weekId}):`, error);
    const message = (error && typeof error === 'object' && error.message) ? error.message : "Unknown error";
    throw new Error(`Database error getting week ${weekId}: ${message}`);
  }
};
export const getWeeksByCourseId = async (courseId) => {
  try {
    if (!courseId) throw new Error("courseId is required.");

    const weeksSnapshot = await weeksCollection
      .where("courseId", "==", courseId)
      .orderBy("weekNumber", "asc")
      .get();

    const weeks = [];
    weeksSnapshot.forEach((doc) => {
       const weekData = doc.data() || {};
        if (weekData.createdAt && typeof weekData.createdAt.toDate === 'function') {
            weekData.createdAt = weekData.createdAt.toDate();
        }
        if (weekData.updatedAt && typeof weekData.updatedAt.toDate === 'function') {
            weekData.updatedAt = weekData.updatedAt.toDate();
        }
       weeks.push({ id: doc.id, ...weekData });
    });

    return weeks;
  } catch (error) {
    console.error(`Error getting weeks for course (${courseId}):`, error);
    const message = (error && typeof error === 'object' && error.message) ? error.message : "Unknown error";
    throw new Error(`Database error getting weeks by course: ${message}`);
  }
};
export const updateWeek = async (weekId, weekDataToUpdate) => {
  try {
    if (!weekId) throw new Error("weekId is required for update.");

    const { id, courseId, createdAt, ...updatePayload } = weekDataToUpdate;

    const dataForUpdate = {
      ...updatePayload,
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (dataForUpdate.weekNumber !== undefined) {
        dataForUpdate.weekNumber = parseInt(String(dataForUpdate.weekNumber), 10);
    }

    const weekRef = weeksCollection.doc(weekId);
    const docSnapshot = await weekRef.get();
    if (!docSnapshot.exists) {
        throw new Error(`Cannot update week: Week with ID ${weekId} not found.`);
    }

    await weekRef.update(dataForUpdate);
    const updatedDocData = await getWeekById(weekId);
    return updatedDocData;

  } catch (error) {
    console.error(`Error updating week (${weekId}):`, error);
    const message = (error && typeof error === 'object' && error.message) ? error.message : "Unknown error";
    const errorCode = (error && typeof error === 'object' && error.code) ? error.code : null;
     if (errorCode === 5 || errorCode === 'not-found' || message.includes("not found")) {
        throw new Error(`Cannot update week: Week with ID ${weekId} not found.`);
    }
    throw new Error(`Database error updating week ${weekId}: ${message}`);
  }
};
export const deleteWeek = async (weekId) => {
  try {
    if (!weekId) throw new Error("weekId is required for deletion.");

    const weekDocRef = weeksCollection.doc(weekId);
    const weekDoc = await weekDocRef.get();
    if (!weekDoc.exists) {
        return { success: false, message: `Week with ID ${weekId} not found, cannot delete.` };
    }

    const batch = db.batch();
    batch.delete(weekDocRef);

    const sectionsSnapshot = await sectionsCollection.where('weekId', '==', weekId).get();
    sectionsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    console.log(`Marked ${sectionsSnapshot.size} sections for deletion with week ${weekId}.`);

    const materialsSnapshot = await materialsCollection.where('weekId', '==', weekId).get();
    materialsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    console.log(`Marked ${materialsSnapshot.size} materials for deletion.`);

    const quizzesSnapshot = await quizzesCollection.where('weekId', '==', weekId).get();
    quizzesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    console.log(`Marked ${quizzesSnapshot.size} quizzes for deletion.`);

    await batch.commit();

    console.log(`Week ${weekId} and its associated content deleted successfully.`);
    return { success: true, message: "Week and associated content deleted successfully" };

  } catch (error) {
    console.error(`Error deleting week (${weekId}) and its content:`, error);
    const message = (error && typeof error === 'object' && error.message) ? error.message : "Unknown error";
    const errorCode = (error && typeof error === 'object' && error.code) ? error.code : null;
    if (errorCode === 5 || errorCode === 'not-found') {
        return { success: false, message: `Error during deletion process: Week with ID ${weekId} may not have been found or an issue occurred with related content.` };
    }
    throw new Error(`Database error deleting week ${weekId}: ${message}`);
  }
};
export const getSectionsByWeekId = async (weekId) => {
    try {
        if (!weekId) throw new Error("weekId is required.");

        const sectionsSnapshot = await sectionsCollection
            .where("weekId", "==", weekId)
            .orderBy("order", "asc")
            .get();

        const sections = [];
        sectionsSnapshot.forEach((doc) => {
            const sectionData = doc.data() || {};
            if (sectionData.createdAt && typeof sectionData.createdAt.toDate === 'function') {
                sectionData.createdAt = sectionData.createdAt.toDate();
            }
            if (sectionData.updatedAt && typeof sectionData.updatedAt.toDate === 'function') {
                sectionData.updatedAt = sectionData.updatedAt.toDate();
            }
            sections.push({ id: doc.id, ...sectionData });
        });

        return sections;
    } catch (error) {
        console.error(`Error getting sections for week (${weekId}):`, error);
        const message = (error && typeof error === 'object' && error.message) ? error.message : "Unknown error";
        throw new Error(`Database error getting sections by week: ${message}`);
    }
};
export const getUserProgressForWeek = async (userId, weekId) => {
    try {
        if (!userId || !weekId) {
            throw new Error("userId and weekId are required.");
        }
        const progressQuery = progressCollection
            .where('userId', '==', userId)
            .where('weekId', '==', weekId)
            .limit(1);

        const snapshot = await progressQuery.get();

        if (snapshot.empty) {
            console.log(`No progress document found for user ${userId} on week ${weekId}.`);
            return {};
        }

        const progressDoc = snapshot.docs[0];
        const progressData = progressDoc.data();
        return progressData.sectionStatuses || {};

    } catch (error) {
        console.error(`Error getting progress for user ${userId}, week ${weekId}:`, error);
        throw new Error(`Database error getting user progress: ${error.message}`);
    }
};
export const updateSectionProgress = async (userId, weekId, sectionId, completed) => {
    try {
        if (!userId || !weekId || !sectionId || typeof completed !== 'boolean') {
            throw new Error("userId, weekId, sectionId, and completed (boolean) status are required.");
        }

        const progressQuery = progressCollection
            .where('userId', '==', userId)
            .where('weekId', '==', weekId)
            .limit(1);

        const snapshot = await progressQuery.get();

        const updateTimestamp = FieldValue.serverTimestamp();
        const sectionStatusUpdate = { [`sectionStatuses.${sectionId}`]: completed };

        if (snapshot.empty) {
            console.log(`Creating new progress document for user ${userId}, week ${weekId}.`);
            const newProgressData = {
                userId: userId,
                weekId: weekId,
                sectionStatuses: {
                    [sectionId]: completed
                },
                createdAt: updateTimestamp,
                updatedAt: updateTimestamp
            };
            await progressCollection.add(newProgressData);
        } else {
            const progressDocRef = snapshot.docs[0].ref;
            console.log(`Updating existing progress document ${progressDocRef.id} for user ${userId}, week ${weekId}.`);
            await progressDocRef.update({
                ...sectionStatusUpdate,
                updatedAt: updateTimestamp
            });
        }
        console.log(`Successfully updated progress for section ${sectionId} to ${completed} for user ${userId}, week ${weekId}.`);

    } catch (error) {
        console.error(`Error updating progress for user ${userId}, week ${weekId}, section ${sectionId}:`, error);
        throw new Error(`Database error updating section progress: ${error.message}`);
    }
};