import { db } from "../config/firebase.config.js";
import { FieldValue } from 'firebase-admin/firestore';

const usersCollection = db.collection("users");

export const createUser = async (userData) => {
  console.log("Attempting createUser in user.model.js");

  console.log("Original userData received:", JSON.stringify(userData, null, 2));

  if (!userData || !userData.uid) {
    console.error("Error: userData or userData.uid is missing.");
    throw new Error("Cannot create user document without valid user data and UID.");
  }

  try {


    const dataToSet = {
      uid: userData.uid,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      displayName: userData.displayName,
      role: userData.role,
      country: userData.country,
      church: userData.church,
      enrollment: userData.enrollment,

      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),

      profileComplete: false,
      profilePicture: "",
      bio: "",
    };

    console.log(`Executing usersCollection.doc(${dataToSet.uid}).set() with data:`, JSON.stringify(dataToSet, null, 2));


    await usersCollection.doc(dataToSet.uid).set(dataToSet);

    console.log("Firestore document created successfully for UID:", dataToSet.uid);



    return { id: dataToSet.uid, ...dataToSet };

  } catch (error) {

    console.error("Firestore raw error object in createUser:", error);
    console.error("Error Code:", error.code);
    console.error("Error Details:", error.details);
    console.error("Error Message:", error.message);
    console.error("Stack Trace:", error.stack);


    throw new Error(`Error creating user document in Firestore for UID ${userData.uid}. Code: ${error.code}. Message: ${error.message}`);
  }
};




export const getUserById = async (userId) => {
  try {
    const userDoc = await usersCollection.doc(userId).get();

    if (!userDoc.exists) {
      console.log(`User not found in Firestore for ID: ${userId}`);
      return null;
    }

    const userData = userDoc.data();

     if (userData.createdAt && userData.createdAt.toDate) {
        userData.createdAt = userData.createdAt.toDate();
     }
     if (userData.updatedAt && userData.updatedAt.toDate) {
        userData.updatedAt = userData.updatedAt.toDate();
     }
     if (userData.enrollment?.enrollmentDate && userData.enrollment.enrollmentDate.toDate) {
        userData.enrollment.enrollmentDate = userData.enrollment.enrollmentDate.toDate();
     }
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
            console.log(`User not found in Firestore for email: ${email}`);
            return null;
        }
        const userDoc = querySnapshot.docs[0];

        const userData = userDoc.data();

        if (userData.createdAt && userData.createdAt.toDate) {
            userData.createdAt = userData.createdAt.toDate();
        }
        if (userData.updatedAt && userData.updatedAt.toDate) {
            userData.updatedAt = userData.updatedAt.toDate();
        }
        return { id: userDoc.id, ...userData };
    } catch (error) {
        console.error(`Error getting user by email (${email}):`, error);
        throw new Error(`Database error finding user by email: ${error.message}`);
    }
};


export const updateUser = async (userId, updateData) => {
  if (!userId) {
    console.error("updateUser called without userId");
    throw new Error("User ID is required for update.");
  }
  if (!updateData || Object.keys(updateData).length === 0) {
      console.warn(`updateUser called for ${userId} with no update data.`);
      return getUserById(userId);
  }

  try {

    const dataToUpdate = { ...updateData };
    delete dataToUpdate.uid;
    delete dataToUpdate.id;
    delete dataToUpdate.email;
    delete dataToUpdate.role;
    delete dataToUpdate.createdAt;
    delete dataToUpdate.enrollment;


     if (dataToUpdate.firstName !== undefined || dataToUpdate.lastName !== undefined) {
       const currentData = await getUserById(userId);
       if (currentData) {
           const firstName = dataToUpdate.firstName !== undefined ? dataToUpdate.firstName : currentData.firstName || '';
           const lastName = dataToUpdate.lastName !== undefined ? dataToUpdate.lastName : currentData.lastName || '';
           dataToUpdate.displayName = `${firstName} ${lastName}`.trim();
       }
     }


    dataToUpdate.updatedAt = FieldValue.serverTimestamp();

    console.log(`Updating user ${userId} with data:`, JSON.stringify(dataToUpdate, null, 2));
    await usersCollection.doc(userId).update(dataToUpdate);
    console.log(`User document updated successfully for UID: ${userId}`);


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


export const setUserEnrollment = async (userId, cohortId) => {
    if (!userId || !cohortId) {
        throw new Error("User ID and Cohort ID are required for enrollment.");
    }
    try {
        const userRef = usersCollection.doc(userId);
        const enrollmentData = {
            cohortId: cohortId,
            enrollmentDate: FieldValue.serverTimestamp()
        };

        await userRef.update({
            enrollment: enrollmentData,
            updatedAt: FieldValue.serverTimestamp()
        });
        console.log(`User ${userId} enrollment set for cohort ${cohortId}`);
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
       const userData = doc.data();

       if (userData.createdAt && userData.createdAt.toDate) {
          userData.createdAt = userData.createdAt.toDate();
       }
       if (userData.updatedAt && userData.updatedAt.toDate) {
          userData.updatedAt = userData.updatedAt.toDate();
       }
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
      const userData = doc.data();

       if (userData.createdAt && userData.createdAt.toDate) {
          userData.createdAt = userData.createdAt.toDate();
       }
       if (userData.updatedAt && userData.updatedAt.toDate) {
          userData.updatedAt = userData.updatedAt.toDate();
       }
      users.push({ id: doc.id, ...userData });
    });

    return users;
  } catch (error) {
    console.error(`Error getting users by role (${role}):`, error);
    throw new Error(`Database error getting users by role ${role}: ${error.message}`);
  }
};