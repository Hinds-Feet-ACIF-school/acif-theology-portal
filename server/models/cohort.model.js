import { db } from "../config/firebase.config.js";
import { FieldValue } from 'firebase-admin/firestore';

const cohortsCollection = db.collection("cohorts");

export const createCohort = async (cohortData) => {
  try {
    if (!cohortData.name || !cohortData.startDate) {
      throw new Error("Cohort name and startDate are required.");
    }


    let startDateTimestamp = cohortData.startDate;
    if (!(startDateTimestamp instanceof FieldValue) && !(startDateTimestamp instanceof Date) && typeof startDateTimestamp === 'string') {

        startDateTimestamp = new Date(startDateTimestamp);
        if (isNaN(startDateTimestamp.getTime())) {
             throw new Error("Invalid startDate format. Please provide a valid Date object or ISO string.");
        }
    } else if (startDateTimestamp instanceof Date) {

    } else if (!(startDateTimestamp instanceof FieldValue)) {
         throw new Error("startDate must be a Date, ISO string, or Firestore Timestamp.");
    }


    const dataToWrite = {
      name: cohortData.name,
      startDate: startDateTimestamp,
      createdAt: FieldValue.serverTimestamp(),
    };

    const cohortRef = await cohortsCollection.add(dataToWrite);
    return { id: cohortRef.id, ...dataToWrite };

  } catch (error) {
    console.error("Error creating cohort:", error);
    throw new Error(`Error creating cohort: ${error.message}`);
  }
};

export const getCohortById = async (cohortId) => {
  try {
    const cohortDoc = await cohortsCollection.doc(cohortId).get();
    if (!cohortDoc.exists) {
      return null;
    }
    const data = cohortDoc.data();


    return { id: cohortDoc.id, ...data };

  } catch (error) {
    console.error(`Error getting cohort by ID (${cohortId}):`, error);
    throw new Error(`Error getting cohort: ${error.message}`);
  }
};

export const getAllCohorts = async () => {
  try {

    const cohortsSnapshot = await cohortsCollection.orderBy("startDate", "desc").get();
    const cohorts = [];
    cohortsSnapshot.forEach((doc) => {
       const data = doc.data();


       cohorts.push({ id: doc.id, ...data });
    });
    return cohorts;
  } catch (error) {
    console.error("Error getting all cohorts:", error);
    throw new Error(`Error getting all cohorts: ${error.message}`);
  }
};

export const updateCohort = async (cohortId, cohortData) => {
   try {
    if (!cohortId) throw new Error("cohortId is required for update.");


    let startDateTimestamp = cohortData.startDate;
     if (startDateTimestamp && !(startDateTimestamp instanceof FieldValue) && !(startDateTimestamp instanceof Date) && typeof startDateTimestamp === 'string') {
        startDateTimestamp = new Date(startDateTimestamp);
        if (isNaN(startDateTimestamp.getTime())) {
             throw new Error("Invalid startDate format.");
        }
    } else if (startDateTimestamp && !(startDateTimestamp instanceof FieldValue) && !(startDateTimestamp instanceof Date)) {
         throw new Error("startDate must be a Date, ISO string, or Firestore Timestamp.");
    }


    delete cohortData.id;
    delete cohortData.createdAt;

    const updateData = {
      ...cohortData,
      ...(startDateTimestamp && { startDate: startDateTimestamp }),

    };

    await cohortsCollection.doc(cohortId).update(updateData);
    return { id: cohortId, ...updateData };

  } catch (error) {
    console.error(`Error updating cohort (${cohortId}):`, error);
    throw new Error(`Error updating cohort: ${error.message}`);
  }
};

export const deleteCohort = async (cohortId) => {
  try {
    if (!cohortId) throw new Error("cohortId is required for deletion.");


    await cohortsCollection.doc(cohortId).delete();
    return { success: true, message: "Cohort deleted successfully" };
  } catch (error) {
    console.error(`Error deleting cohort (${cohortId}):`, error);
    throw new Error(`Error deleting cohort: ${error.message}`);
  }
};