// server/models/pendingRegistration.model.js
import { db } from "../config/firebase.config.js";
import { FieldValue } from 'firebase-admin/firestore';

const pendingRegistrationsCollection = db.collection("pendingRegistrations");

export const createPendingRegistration = async (tx_ref, data) => {
  try {
    await pendingRegistrationsCollection.doc(tx_ref).set({
      ...data,
      status: 'pending_payment',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { tx_ref, ...data };
  } catch (error) {
    console.error("Error creating pending registration:", error);
    throw new Error("Could not save pending registration details.");
  }
};

export const getPendingRegistration = async (tx_ref) => {
  try {
    const doc = await pendingRegistrationsCollection.doc(tx_ref).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error("Error fetching pending registration:", error);
    throw new Error("Could not retrieve pending registration details.");
  }
};

export const updatePendingRegistrationStatus = async (tx_ref, status, extraData = {}) => {
  try {
    await pendingRegistrationsCollection.doc(tx_ref).update({
      status,
      ...extraData,
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error updating pending registration ${tx_ref} to status ${status}:`, error);
    // Don't throw, allow webhook to complete Chapa's 200 OK
  }
};

export const deletePendingRegistration = async (tx_ref) => {
  try {
    await pendingRegistrationsCollection.doc(tx_ref).delete();
  } catch (error) {
    console.error("Error deleting pending registration:", error);
    // Don't throw critical errors for cleanup
  }
};