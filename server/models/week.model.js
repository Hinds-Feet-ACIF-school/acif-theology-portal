import { db } from "../config/firebase.config.js";
import { FieldValue } from 'firebase-admin/firestore';

const weeksCollection = db.collection("weeks");
const materialsCollection = db.collection("materials");
const quizzesCollection = db.collection("quizzes");

export const createWeek = async (weekData) => {
  try {
    if (!weekData.courseId || !weekData.weekNumber || !weekData.title) {
      throw new Error("courseId, weekNumber, and title are required to create a week.");
    }
    if (weekData.weekNumber < 1 || weekData.weekNumber > 4) {
        throw new Error("weekNumber must be between 1 and 4.");
    }

    const existingCheck = await weeksCollection
        .where('courseId', '==', weekData.courseId)
        .where('weekNumber', '==', weekData.weekNumber)
        .limit(1)
        .get();

    if (!existingCheck.empty) {
        throw new Error(`Week ${weekData.weekNumber} already exists for course ${weekData.courseId}. Use update instead.`);
    }

    const dataToWrite = {
      courseId: weekData.courseId,
      weekNumber: weekData.weekNumber,
      title: weekData.title,
      description: weekData.description || "",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const weekRef = await weeksCollection.add(dataToWrite);
    return { id: weekRef.id, ...dataToWrite };

  } catch (error) {
    console.error("Error creating week:", error);
    throw new Error(`Error creating week: ${error.message}`);
  }
};

export const getWeekById = async (weekId) => {
  try {
    const weekDoc = await weeksCollection.doc(weekId).get();
    if (!weekDoc.exists) {
      return null;
    }
     const weekData = weekDoc.data();
     if (weekData.createdAt && weekData.createdAt.toDate) {
        weekData.createdAt = weekData.createdAt.toDate();
     }
     if (weekData.updatedAt && weekData.updatedAt.toDate) {
        weekData.updatedAt = weekData.updatedAt.toDate();
     }
    return { id: weekDoc.id, ...weekData };
  } catch (error) {
    console.error(`Error getting week by ID (${weekId}):`, error);
    throw new Error(`Database error getting week ${weekId}: ${error.message}`);
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
       const weekData = doc.data();
        if (weekData.createdAt && weekData.createdAt.toDate) {
            weekData.createdAt = weekData.createdAt.toDate();
        }
        if (weekData.updatedAt && weekData.updatedAt.toDate) {
            weekData.updatedAt = weekData.updatedAt.toDate();
        }
       weeks.push({ id: doc.id, ...weekData });
    });

    return weeks;
  } catch (error) {
    console.error(`Error getting weeks for course (${courseId}):`, error);

    throw new Error(`Database error getting weeks by course: ${error.message}`);
  }
};

export const updateWeek = async (weekId, weekData) => {
  try {
    if (!weekId) throw new Error("weekId is required for update.");
    if (weekData.weekNumber && (weekData.weekNumber < 1 || weekData.weekNumber > 4)) {
        throw new Error("weekNumber must be between 1 and 4.");
    }

    delete weekData.id;
    delete weekData.courseId;
    delete weekData.createdAt;

    const updateData = {
      ...weekData,
      updatedAt: FieldValue.serverTimestamp(),
    };

    await weeksCollection.doc(weekId).update(updateData);
    const updatedDocData = await getWeekById(weekId);
    return updatedDocData;

  } catch (error) {
    console.error(`Error updating week (${weekId}):`, error);
     if (error.code === 5) {
        throw new Error(`Cannot update week: Week with ID ${weekId} not found.`);
    }
    throw new Error(`Database error updating week ${weekId}: ${error.message}`);
  }
};

export const deleteWeek = async (weekId) => {
  try {
    if (!weekId) throw new Error("weekId is required for deletion.");


    const batch = db.batch();


    const weekRef = weeksCollection.doc(weekId);
    batch.delete(weekRef);


    const materialsSnapshot = await materialsCollection.where('weekId', '==', weekId).get();
    materialsSnapshot.docs.forEach(doc => {

        batch.delete(doc.ref);
    });
    console.log(`Marked ${materialsSnapshot.size} materials for deletion.`);


    const quizzesSnapshot = await quizzesCollection.where('weekId', '==', weekId).get();
    quizzesSnapshot.docs.forEach(doc => {

        batch.delete(doc.ref);
    });
     console.log(`Marked ${quizzesSnapshot.size} quizzes for deletion.`);


    await batch.commit();

    console.log(`Week ${weekId} and its associated content deleted successfully.`);
    return { success: true, message: "Week and associated content deleted successfully" };

  } catch (error) {
    console.error(`Error deleting week (${weekId}) and its content:`, error);
    if (error.code === 5) {
        return { success: false, message: `Week with ID ${weekId} not found.` };
    }
    throw new Error(`Database error deleting week ${weekId}: ${error.message}`);
  }
};