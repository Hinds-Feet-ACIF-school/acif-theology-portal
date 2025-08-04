import { db } from "../config/firebase.config.js";
import { FieldValue } from 'firebase-admin/firestore';

const usersCollection = db.collection("users");


// Converts to JS Date
const convertTimestamps = (userData) => {
    if (userData.createdAt && typeof userData.createdAt.toDate === 'function') {
        userData.createdAt = userData.createdAt.toDate();
    }
    if (userData.updatedAt && typeof userData.updatedAt.toDate === 'function') {
        userData.updatedAt = userData.updatedAt.toDate();
    }
    if (userData.enrollment && userData.enrollment.enrollmentDate && typeof userData.enrollment.enrollmentDate.toDate === 'function') {
        userData.enrollment.enrollmentDate = userData.enrollment.enrollmentDate.toDate();
    }
    return userData;
};

    export const createUser = async (userData) => {
        if (!userData || !userData.uid) {
            throw new Error("Cannot create user document without valid user data and UID.");
        }

        try {
            const displayName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();

            const dataToSet = {
                uid: userData.uid,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                displayName: displayName,
                role: userData.role || "student",
                country: userData.country,
                church: userData.church === undefined ? null : userData.church,
                enrollment: userData.enrollment ? {
                    cohortId: userData.enrollment.cohortId || null,
                    paymentTxRef: userData.enrollment.paymentTxRef || null,
                    paymentAmount: userData.enrollment.paymentAmount || null,
                    paymentCurrency: userData.enrollment.paymentCurrency || null,
                    enrollmentDate: userData.enrollment.enrollmentDate instanceof Date ? userData.enrollment.enrollmentDate : FieldValue.serverTimestamp(),
                } : null,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
                profileComplete: false,
                profilePicture: "",
                bio: "",
            };

            if (dataToSet.enrollment === undefined) {
                dataToSet.enrollment = null;
            }

            await usersCollection.doc(dataToSet.uid).set(dataToSet);
            const createdUser = await getUserById(dataToSet.uid);
            return createdUser;

        } catch (error) {
            console.error("Error creating user document in Firestore for UID " + userData.uid + ". Code: " + error.code + ". Message: " + error.message);
            throw new Error(`Error creating user document in Firestore for UID ${userData.uid}. Code: ${error.code}. Message: ${error.message}`);
        }
    };

export const getUserById = async (userId) => {
    try {
        const userDoc = await usersCollection.doc(userId).get();
        if (!userDoc.exists) {
            return null;
        }
        let userData = userDoc.data();
        userData = convertTimestamps(userData);
        return { id: userDoc.id, ...userData };
    } catch (error) {
        console.error(`Error getting user by ID (${userId}):`, error);
        throw new Error(`Database error fetching user ${userId}: ${error.message}`);
    }
};

export const getUserByEmail = async (email) => {
    try {
        const querySnapshot = await usersCollection.where('email', '==', email).limit(1).get();
        if (querySnapshot.empty) {
            return null;
        }
        const userDoc = querySnapshot.docs[0];
        let userData = userDoc.data();
        userData = convertTimestamps(userData);
        return { id: userDoc.id, ...userData };
    } catch (error) {
        console.error(`Error getting user by email (${email}):`, error);
        throw new Error(`Database error finding user by email: ${error.message}`);
    }
};

export const updateUser = async (userId, updateData) => {
    if (!userId) {
        throw new Error("User ID is required for update.");
    }
    if (!updateData || Object.keys(updateData).length === 0) {
        return getUserById(userId);
    }
    try {
        const dataToUpdate = { ...updateData };
        delete dataToUpdate.uid;
        delete dataToUpdate.id;
        delete dataToUpdate.email;
        delete dataToUpdate.role;
        delete dataToUpdate.createdAt;

        if (dataToUpdate.firstName !== undefined || dataToUpdate.lastName !== undefined) {
            const currentData = await getUserById(userId);
            if (currentData) {
                const firstName = dataToUpdate.firstName !== undefined ? dataToUpdate.firstName : currentData.firstName || '';
                const lastName = dataToUpdate.lastName !== undefined ? dataToUpdate.lastName : currentData.lastName || '';
                dataToUpdate.displayName = `${firstName} ${lastName}`.trim();
            }
        }

        dataToUpdate.updatedAt = FieldValue.serverTimestamp();

        if (updateData.hasOwnProperty('church') && updateData.church === undefined) {
            dataToUpdate.church = null;
        }
        if (updateData.hasOwnProperty('profilePicture') && updateData.profilePicture === undefined) {
            dataToUpdate.profilePicture = "";
        }
        if (updateData.hasOwnProperty('bio') && updateData.bio === undefined) {
            dataToUpdate.bio = "";
        }
        if (updateData.hasOwnProperty('enrollment') && updateData.enrollment === undefined) {
            dataToUpdate.enrollment = null;
        }
        if (updateData.enrollment && updateData.enrollment.enrollmentDate && !(updateData.enrollment.enrollmentDate instanceof Date) && !(updateData.enrollment.enrollmentDate instanceof FieldValue) ) {
            delete updateData.enrollment.enrollmentDate; 
        }


        await usersCollection.doc(userId).update(dataToUpdate);
        const updatedDocData = await getUserById(userId);
        return updatedDocData;
    } catch (error) {
        console.error(`Error updating user (${userId}):`, error);
        if (error.code === 5) {
            throw new Error(`Cannot update user: User with ID ${userId} not found.`);
        }
        throw new Error(`Database error updating user ${userId}: ${error.message}`);
    }
};

export const setUserEnrollment = async (userId, cohortId, paymentDetails = {}) => {
    if (!userId || !cohortId) {
        throw new Error("User ID and Cohort ID are required for enrollment.");
    }
    try {
        const userRef = usersCollection.doc(userId);
        const enrollmentData = {
            cohortId: cohortId,
            enrollmentDate: FieldValue.serverTimestamp(),
            paymentTxRef: paymentDetails.paymentTxRef || null,
            paymentAmount: paymentDetails.paymentAmount || null,
            paymentCurrency: paymentDetails.paymentCurrency || null,
        };
        await userRef.update({
            enrollment: enrollmentData,
            updatedAt: FieldValue.serverTimestamp()
        });
        return { success: true, message: "User enrollment updated successfully" };
    } catch (error) {
        console.error(`Error setting enrollment for user ${userId} in cohort ${cohortId}:`, error);
        if (error.code === 5) {
            throw new Error(`Cannot set enrollment: User with ID ${userId} not found.`);
        }
        throw new Error(`Database error setting user enrollment for ${userId}: ${error.message}`);
    }
};

export const getAllUsers = async () => {
    try {
        const usersSnapshot = await usersCollection.get();
        const users = [];
        usersSnapshot.forEach((doc) => {
            let userData = doc.data();
            userData = convertTimestamps(userData);
            users.push({ id: doc.id, ...userData });
        });
        return users;
    } catch (error) {
        console.error("Error getting all users:", error);
        throw new Error(`Database error getting all users: ${error.message}`);
    }
};

export const getUsersByRole = async (role) => {
    try {
        const usersSnapshot = await usersCollection.where("role", "==", role).get();
        const users = [];
        usersSnapshot.forEach((doc) => {
            let userData = doc.data();
            userData = convertTimestamps(userData);
            users.push({ id: doc.id, ...userData });
        });
        return users;
    } catch (error) {
        console.error(`Error getting users by role (${role}):`, error);
        throw new Error(`Database error getting users by role ${role}: ${error.message}`);
    }
};

export const deleteUser = async (userId) => {
    if (!userId) {
        throw new Error("User ID is required for deletion.");
    }
    try {
        const userRef = usersCollection.doc(userId);
        await userRef.delete();
        return { success: true, message: `User document ${userId} deleted successfully.` };
    } catch (error) {
        console.error(`Error deleting user document (${userId}):`, error);
        if (error.code === 5) {
             return { success: false, message: `User document with ID ${userId} not found for deletion.` };
        }
        throw new Error(`Database error deleting user document ${userId}: ${error.message}`);
    }
};