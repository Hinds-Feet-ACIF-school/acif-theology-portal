import jwt from "jsonwebtoken";
import { auth } from "../config/firebase.config.js";
import * as UserModel from "../models/user.model.js";

// Helper function to safely convert various date/timestamp formats to a JS Date object
function convertToDate(timestampField) {
    if (!timestampField) return null;
    // If it's a Firestore Timestamp object (has toDate method)
    if (typeof timestampField.toDate === 'function') {
        return timestampField.toDate();
    }
    // If it's already a Date object
    if (timestampField instanceof Date) {
        return timestampField;
    }
    // If it's a string (e.g., ISO 8601, or format parsable by new Date())
    // Firebase Auth metadata times like creationTime are strings.
    if (typeof timestampField === 'string') {
        const date = new Date(timestampField);
        return isNaN(date.getTime()) ? null : date; // Check if parsing was successful
    }
    // If it's a number (Unix timestamp in milliseconds)
    if (typeof timestampField === 'number') {
        const date = new Date(timestampField);
        return isNaN(date.getTime()) ? null : date;
    }
    console.warn('Unknown date format encountered:', timestampField);
    return null;
}

export const register = async (req, res) => {
  let userRecord = null;
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      country,
      church,
      role = "student"
    } = req.body;

    if (!email || !password || !firstName || !lastName || !country) {
      return res.status(400).json({ message: "Missing required fields (email, password, firstName, lastName, country)." });
    }
     if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long." });
     }

    userRecord = await auth.createUser({
      email,
      password: password,
      displayName: `${firstName} ${lastName}`,
    });

    await auth.setCustomUserClaims(userRecord.uid, { role: role });

    // Ensure UserModel.createUser sets createdAt and updatedAt using FieldValue.serverTimestamp()
    const userDataForFirestore = {
        uid: userRecord.uid,
        email: email,
        firstName: firstName,
        lastName: lastName,
        displayName: `${firstName} ${lastName}`,
        role: role,
        country: country,
        church: church || null,
        enrollment: null,
        profileComplete: !!(firstName && lastName && country), // Initial completeness
        // bio and profilePicture can be added here if provided during registration
    };
    await UserModel.createUser(userDataForFirestore);

    res.status(201).json({
      message: "User registered successfully. Please log in.",
      userId: userRecord.uid,
    });
  } catch (error) {
    let errorMessage = "Registration failed due to an internal server error.";
    let statusCode = 500;

    if (error.message && error.message.includes("Firestore") && userRecord && userRecord.uid) {
         errorMessage = "Registration partially failed during profile creation. Please try again or contact support.";
        try {
            await auth.deleteUser(userRecord.uid);
        } catch (deleteError) {
             errorMessage = "Registration failed critically. Please contact support immediately.";
        }
    }
    else if (error.code === "auth/email-already-exists") {
      errorMessage = "The email address is already in use by another account.";
      statusCode = 409;
    } else if (error.code === "auth/invalid-password") {
      errorMessage = "Password should be at least 6 characters.";
      statusCode = 400;
    } else if (error.code === "auth/invalid-email") {
        errorMessage = "The email address is not valid.";
        statusCode = 400;
    } else if (!userRecord && error.code?.startsWith('auth/')) {
        errorMessage = `Registration failed: ${error.message}`;
        statusCode = 400;
    }

    const responsePayload = { message: errorMessage };
    if (process.env.NODE_ENV !== 'production' && error.message) {
        responsePayload.detail = error.message;
        responsePayload.code = error.code;
    }
    res.status(statusCode).json(responsePayload);
  }
};

export const login = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "ID token is required." });
    }

    const decodedFirebaseToken = await auth.verifyIdToken(idToken);
    const uid = decodedFirebaseToken.uid;
    const userRecord = await auth.getUser(uid);

    if (userRecord.disabled) {
        return res.status(403).json({ message: "Account is disabled." });
    }

    let userProfileData = {};
    try {
        const firestoreUser = await UserModel.getUserById(uid);
        if (firestoreUser) {
            userProfileData = {
                firstName: firestoreUser.firstName,
                lastName: firestoreUser.lastName,
                country: firestoreUser.country,
                church: firestoreUser.church,
                enrollment: firestoreUser.enrollment,
                profileComplete: firestoreUser.profileComplete,
                profilePicture: firestoreUser.profilePicture,
                bio: firestoreUser.bio,
                createdAt: convertToDate(firestoreUser.createdAt), // Use helper
                updatedAt: convertToDate(firestoreUser.updatedAt), // Use helper
            };
        } else {
             // Fallback if Firestore profile doesn't exist
             console.warn(`Firestore profile not found for UID ${uid} during login. User exists in Auth.`);
             userProfileData = { 
                enrollment: null,
                firstName: userRecord.displayName?.split(' ')[0] || null,
                lastName: userRecord.displayName?.split(' ').slice(1).join(' ') || null,
                createdAt: convertToDate(userRecord.metadata.creationTime),
                updatedAt: convertToDate(userRecord.metadata.lastSignInTime),
             };
        }
    } catch(dbError) {
         console.error(`Error fetching Firestore profile for UID ${uid} during login:`, dbError);
         userProfileData = { 
            enrollment: null,
            createdAt: convertToDate(userRecord.metadata.creationTime),
            updatedAt: convertToDate(userRecord.metadata.lastSignInTime),
        };
    }

    const userRole = userRecord.customClaims?.role || 'student';
    const accessToken = jwt.sign(
        { uid: uid, role: userRole },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
    );
    const refreshToken = jwt.sign(
        { uid: uid },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );

    const secureFlag = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: secureFlag,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, 
        path: '/'
    });

    res.status(200).json({
      message: "Login successful",
      token: accessToken,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userProfileData?.displayName || userRecord.displayName, // Prefer profile displayName
        role: userRole,
        ...userProfileData // Spreads firstName, lastName, country, etc., including converted dates
      },
    });
  } catch (error) {
    res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
    let statusCode = 500;
    let responseMessage = "Login failed due to a server error.";

    if (error.code) {
        switch (error.code) {
            case 'auth/id-token-expired':
            case 'auth/argument-error':
            case 'auth/id-token-revoked':
                statusCode = 401;
                responseMessage = "Invalid or expired credentials. Please log in again.";
                break;
            case 'auth/user-disabled':
                statusCode = 403;
                responseMessage = "Account is disabled.";
                break;
            case 'auth/user-not-found':
                if (error.message && error.message.includes("verifyIdToken")) {
                     statusCode = 401;
                     responseMessage = "Invalid credentials.";
                } else {
                     statusCode = 404;
                     responseMessage = "User account not found.";
                }
                break;
            default:
                responseMessage = error.message?.startsWith('Firebase:') || error.code?.startsWith('auth/') ? error.message : `Login failed: ${error.message}`;
        }
    } else {
        responseMessage = error.message || responseMessage;
    }
    res.status(statusCode).json({ message: responseMessage, detail: process.env.NODE_ENV !== 'production' ? error.message : undefined });
  }
};

export const refreshToken = async (req, res) => {
    const refreshTokenFromCookie = req.cookies?.refreshToken;
    if (!refreshTokenFromCookie) {
        return res.status(401).json({ message: "Authentication required. Please log in." });
    }
    try {
        const decoded = jwt.verify(refreshTokenFromCookie, process.env.REFRESH_TOKEN_SECRET);
        const userId = decoded.uid;
        if (!userId) {
            res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
            return res.status(403).json({ message: "Invalid session token. Please log in again." });
        }
        const userRecord = await auth.getUser(userId);
        if (userRecord.disabled) {
            res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
            return res.status(401).json({ message: "Your account has been disabled." });
        }
        const newAccessToken = jwt.sign(
            { uid: userId, role: userRecord.customClaims?.role || 'student' },
            process.env.JWT_SECRET,
            { expiresIn: "2h" } 
        );
        res.status(200).json({
            message: "Token refreshed successfully",
            token: newAccessToken,
        });
    } catch (error) {
        res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(403).json({ message: "Your session has expired. Please log in again." });
        }
        if (error.code === 'auth/user-not-found') {
            return res.status(401).json({ message: "User account associated with this session no longer exists." });
        }
        return res.status(500).json({ message: "Failed to refresh session due to a server error.", detail: process.env.NODE_ENV !== 'production' ? error.message : undefined });
    }
};

export const logout = (req, res) => {
    try {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        });
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        res.status(200).json({ message: "Logout processed, client should clear local session." });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        if (!req.user || !req.user.uid) {
            return res.status(401).json({ message: "Unauthorized: Invalid authentication token." });
        }
        const userId = req.user.uid;
        const userRoleFromToken = req.user.role; 
        
        const userRecord = await auth.getUser(userId); 

        if (userRecord.disabled) {
             return res.status(403).json({ message: "Account is disabled." });
        }

        const authoritativeRole = userRecord.customClaims?.role || 'student';
        if (userRoleFromToken !== authoritativeRole) {
            console.warn(`Role mismatch for UID ${userId}: Token role "${userRoleFromToken}", Firebase Auth role "${authoritativeRole}". Using Firebase Auth role.`);
        }

        let userProfileData = null;
        try {
            userProfileData = await UserModel.getUserById(userId);
            if (!userProfileData) {
                 console.warn(`Firestore profile not found for UID ${userId}. User exists in Auth. Will use Auth data as fallback.`);
                 userProfileData = { 
                    firstName: userRecord.displayName?.split(' ')[0] || null,
                    lastName: userRecord.displayName?.split(' ').slice(1).join(' ') || null,
                    displayName: userRecord.displayName,
                    // other fields might be null or default
                 }; 
            }
        } catch (dbError) {
            console.error(`Error fetching Firestore profile for UID ${userId}:`, dbError);
            return res.status(500).json({ message: "Failed to retrieve user profile data." });
        }

        const responseUserData = {
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userProfileData?.displayName || userRecord.displayName,
            firstName: userProfileData?.firstName,
            lastName: userProfileData?.lastName,
            role: authoritativeRole, 
            country: userProfileData?.country,
            church: userProfileData?.church,
            enrollment: userProfileData?.enrollment,
            createdAt: convertToDate(userProfileData?.createdAt) || convertToDate(userRecord.metadata.creationTime),
            updatedAt: convertToDate(userProfileData?.updatedAt) || convertToDate(userRecord.metadata.lastSignInTime),
            profileComplete: userProfileData?.profileComplete,
            profilePicture: userProfileData?.profilePicture || userRecord.photoURL, // Prefer Firestore, fallback to Auth
            bio: userProfileData?.bio,
        };
        res.status(200).json(responseUserData);
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            return res.status(404).json({ message: "User account not found." });
        }
        console.error("Error in getCurrentUser:", error); // Log the actual error object
        res.status(500).json({ message: "Failed to fetch user details due to a server error.", detail: process.env.NODE_ENV !== 'production' ? error.message : undefined });
    }
};


export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }
        const actionCodeSettings = {
            url: process.env.PASSWORD_RESET_REDIRECT_URL || 'http://localhost:5173/login?reset=true',
            handleCodeInApp: false 
        };
        await auth.sendPasswordResetEmail(email, actionCodeSettings);
        res.status(200).json({
            message: "A a password reset email has been sent.",
        });
    } catch (error) {
        if (error.code === 'auth/invalid-email') {
            return res.status(400).json({ message: "Invalid email format provided." });
        }
        if (error.code === 'auth/user-not-found') {
            return res.status(200).json({ message: "A password reset email has been sent." });
        }
        console.error("Error in resetPassword:", error);
        res.status(500).json({ message: "Failed to send password reset email due to a server error.", detail: process.env.NODE_ENV !== 'production' ? error.message : undefined });
    }
};

export const confirmPasswordReset = async (req, res) => {
    try {
        const { oobCode, newPassword } = req.body;

        if (!oobCode || !newPassword) {
            return res.status(400).json({ message: "Reset code and new password are required." });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long." });
        }

        // Verify the password reset code.
        const email = await auth.verifyPasswordResetCode(oobCode);

        // If the code is valid, update the user's password.
        await auth.confirmPasswordReset(oobCode, newPassword);

        // Optionally, you might want to get the user and update their Firestore record
        // if you store any password-related metadata there (though typically not needed for just password reset).
        // const userRecord = await auth.getUserByEmail(email);
        // await UserModel.updateUser(userRecord.uid, { /* some_field_if_needed: true */ });

        res.status(200).json({ message: "Password has been reset successfully. You can now log in with your new password." });

    } catch (error) {
        console.error("Error in confirmPasswordReset:", error);
        let errorMessage = "Failed to reset password. The link may be invalid or expired.";
        let statusCode = 400; // Default for invalid code type errors

        if (error.code === 'auth/expired-action-code') {
            errorMessage = "The password reset link has expired. Please request a new one.";
        } else if (error.code === 'auth/invalid-action-code') {
            errorMessage = "The password reset link is invalid. It may have already been used or malformed. Please request a new one.";
        } else if (error.code === 'auth/user-disabled') {
            errorMessage = "Your account has been disabled.";
            statusCode = 403;
        } else if (error.code === 'auth/user-not-found') {
            errorMessage = "User not found. The account may have been deleted.";
            statusCode = 404;
        } else if (error.code === 'auth/weak-password') {
            errorMessage = "The new password is too weak.";
        } else {
            // Generic server error
            errorMessage = "An unexpected error occurred while resetting your password.";
            statusCode = 500;
        }
        res.status(statusCode).json({ message: errorMessage, detail: process.env.NODE_ENV !== 'production' ? error.message : undefined });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.uid) {
            return res.status(401).json({ message: "Unauthorized: No user identification found." });
        }
        const { uid } = req.user;
        const { firstName, lastName, country, church, bio, profilePicture } = req.body;
        
        const updatedFirebaseAuthData = {};
        const updatedFirestoreData = {};
        let existingProfile = null; // To store fetched profile for reuse

        // Fetch existing profile once if any profile-completeness-related fields are changing
        if (firstName !== undefined || lastName !== undefined || country !== undefined || 
            church !== undefined || bio !== undefined || profilePicture !== undefined) {
             existingProfile = await UserModel.getUserById(uid);
             if (!existingProfile) {
                 // This case should ideally not happen if user exists in Auth.
                 // If it does, it means Firestore profile is missing. We might need to create it.
                 // For now, let's assume it might be created by UserModel.updateUser if it handles upsert logic.
                 // Or, we can simply proceed, and if UserModel.updateUser fails, it will be caught.
                 console.warn(`Firestore profile for user ${uid} not found during update. Update might partially fail or create a new profile entry.`);
             }
        }


        if (firstName !== undefined || lastName !== undefined) {
            const currentAuthUserRecord = await auth.getUser(uid); // Get current Firebase Auth user for displayName reference
            const currentFirstName = firstName !== undefined ? firstName : (existingProfile?.firstName || currentAuthUserRecord.displayName?.split(' ')[0] || '');
            const currentLastName = lastName !== undefined ? lastName : (existingProfile?.lastName || currentAuthUserRecord.displayName?.split(' ').slice(1).join(' ') || '');
            
            const newDisplayName = `${currentFirstName} ${currentLastName}`.trim();

            if (newDisplayName && newDisplayName !== currentAuthUserRecord.displayName) { 
                updatedFirebaseAuthData.displayName = newDisplayName;
            }
            if (firstName !== undefined) updatedFirestoreData.firstName = firstName;
            if (lastName !== undefined) updatedFirestoreData.lastName = lastName;
            if (newDisplayName) updatedFirestoreData.displayName = newDisplayName; // Also update in Firestore
        }

        if (country !== undefined) updatedFirestoreData.country = country;
        if (church !== undefined) updatedFirestoreData.church = church || null;
        if (bio !== undefined) updatedFirestoreData.bio = bio || null;
        
        if (profilePicture !== undefined) { 
            if (profilePicture !== (existingProfile?.profilePicture || (await auth.getUser(uid)).photoURL)) { // Check if it's actually changing
                updatedFirebaseAuthData.photoURL = profilePicture || null;
            }
            updatedFirestoreData.profilePicture = profilePicture || null;
        }
        
        // Logic for profileComplete: update if key fields (firstName, lastName, country) are changing
        if (firstName !== undefined || lastName !== undefined || country !== undefined) {
            if(!existingProfile) existingProfile = await UserModel.getUserById(uid); // Fetch if not already done

            const finalFirstName = firstName !== undefined ? firstName : existingProfile?.firstName;
            const finalLastName = lastName !== undefined ? lastName : existingProfile?.lastName;
            const finalCountry = country !== undefined ? country : existingProfile?.country;
            
            const newProfileCompleteStatus = !!(finalFirstName && finalLastName && finalCountry);

            if (existingProfile?.profileComplete !== newProfileCompleteStatus || existingProfile?.profileComplete === undefined) {
                updatedFirestoreData.profileComplete = newProfileCompleteStatus;
            }
        }

        const authUpdatesExist = Object.keys(updatedFirebaseAuthData).length > 0;
        const firestoreUpdatesExist = Object.keys(updatedFirestoreData).length > 0;

        if (!authUpdatesExist && !firestoreUpdatesExist) {
             const finalUserRecordForNoChange = await auth.getUser(uid);
             const finalUserDocForNoChange = existingProfile || await UserModel.getUserById(uid); // Use already fetched if available
             return res.status(200).json({
                message: "No changes detected in profile data.",
                user: {
                    uid: finalUserRecordForNoChange.uid,
                    email: finalUserRecordForNoChange.email,
                    displayName: finalUserDocForNoChange?.displayName || finalUserRecordForNoChange.displayName,
                    firstName: finalUserDocForNoChange?.firstName,
                    lastName: finalUserDocForNoChange?.lastName,
                    role: finalUserRecordForNoChange.customClaims?.role || 'student',
                    country: finalUserDocForNoChange?.country,
                    church: finalUserDocForNoChange?.church,
                    enrollment: finalUserDocForNoChange?.enrollment,
                    createdAt: convertToDate(finalUserDocForNoChange?.createdAt) || convertToDate(finalUserRecordForNoChange.metadata.creationTime),
                    updatedAt: convertToDate(finalUserDocForNoChange?.updatedAt) || convertToDate(finalUserRecordForNoChange.metadata.lastModifiedTime || finalUserRecordForNoChange.metadata.lastSignInTime),
                    profileComplete: finalUserDocForNoChange?.profileComplete,
                    profilePicture: finalUserDocForNoChange?.profilePicture || finalUserRecordForNoChange.photoURL,
                    bio: finalUserDocForNoChange?.bio,
                }
             });
        }

        if (authUpdatesExist) {
            await auth.updateUser(uid, updatedFirebaseAuthData);
        }
        if (firestoreUpdatesExist) {
            // UserModel.updateUser should handle cases where the document might not exist yet (e.g., by using set with merge:true, or specific logic)
            // It must also ensure `updatedAt` is set to FieldValue.serverTimestamp()
            await UserModel.updateUser(uid, updatedFirestoreData);
        }

        const finalUserRecord = await auth.getUser(uid);
        const finalUserDoc = await UserModel.getUserById(uid); // Fetch fresh data

        const responseUser = {
            uid: finalUserRecord.uid,
            email: finalUserRecord.email,
            displayName: finalUserDoc?.displayName || finalUserRecord.displayName,
            firstName: finalUserDoc?.firstName,
            lastName: finalUserDoc?.lastName,
            role: finalUserRecord.customClaims?.role || 'student',
            country: finalUserDoc?.country,
            church: finalUserDoc?.church,
            enrollment: finalUserDoc?.enrollment,
            createdAt: convertToDate(finalUserDoc?.createdAt) || convertToDate(finalUserRecord.metadata.creationTime),
            updatedAt: convertToDate(finalUserDoc?.updatedAt) || convertToDate(finalUserRecord.metadata.lastModifiedTime || finalUserRecord.metadata.lastSignInTime), // Using lastModifiedTime or lastSignInTime as fallback
            profileComplete: finalUserDoc?.profileComplete,
            profilePicture: finalUserDoc?.profilePicture || finalUserRecord.photoURL,
            bio: finalUserDoc?.bio,
        };

        res.status(200).json({
            message: "User profile updated successfully",
            user: responseUser,
        });
    } catch (error) {
        console.error("Error in updateUserProfile:", error);
        if (error.code === 'auth/user-not-found') {
            return res.status(404).json({ message: "User not found in Authentication." });
        }
        // Check for Firestore-specific "not found" if UserModel.updateUser throws a custom error or a specific Firestore error code
        if (error.message && error.message.toLowerCase().includes("not found") && (error.message.includes("Firestore") || error.message.includes("database"))) {
             return res.status(404).json({ message: "User profile data not found in database for update." });
        }
        res.status(500).json({ message: "Failed to update profile due to a server error.", detail: process.env.NODE_ENV !== 'production' ? error.message : undefined });
    }
};


export const changePassword = async (req, res) => {
    try {
        if (!req.user || !req.user.uid) {
            return res.status(401).json({ message: "Unauthorized: Invalid authentication token." });
        }
        const { uid } = req.user;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters long." });
        }

        await auth.updateUser(uid, {
            password: newPassword,
        });

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Error in changePassword:", error);
        if (error.code === 'auth/requires-recent-login') {
            return res.status(403).json({
                message: "This operation requires you to have logged in recently. Please log out and log back in to change your password.",
                code: error.code 
            });
        }
        if (error.code === 'auth/user-not-found') {
            return res.status(404).json({ message: "User account not found." });
        }
        if (error.code === 'auth/weak-password') { 
             return res.status(400).json({ message: "Password is too weak. Please choose a stronger password." });
        }
        res.status(500).json({ message: "Failed to change password due to a server error.", detail: process.env.NODE_ENV !== 'production' ? error.message : undefined });
    }
};

// Admin specific functions
export const createUserByAdmin = async (req, res) => {
    let userRecord = null;
    try {
        const {
            email,
            password,
            firstName,
            lastName,
            country,
            church,
            role 
        } = req.body;

        if (!email || !password || !firstName || !lastName || !country || !role) {
            return res.status(400).json({ message: "Missing required fields (email, password, firstName, lastName, country, role)." });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long." });
        }
        if (!['student', 'admin', 'instructor'].includes(role)) {
             return res.status(400).json({ message: "Invalid role specified. Allowed roles: student, admin, instructor." });
        }

        userRecord = await auth.createUser({
            email,
            password: password,
            displayName: `${firstName} ${lastName}`,
        });

        await auth.setCustomUserClaims(userRecord.uid, { role: role });

        // UserModel.createUser should set createdAt/updatedAt with FieldValue.serverTimestamp()
        const userDataForFirestore = {
            uid: userRecord.uid,
            email: email,
            firstName: firstName,
            lastName: lastName,
            displayName: `${firstName} ${lastName}`,
            role: role, 
            country: country,
            church: church || null,
            enrollment: null, 
            profileComplete: !!(firstName && lastName && country), 
        };
        await UserModel.createUser(userDataForFirestore);

        res.status(201).json({
            message: `User '${email}' created successfully with role '${role}'.`,
            userId: userRecord.uid,
            user: { 
               uid: userRecord.uid,
               email: email,
               displayName: `${firstName} ${lastName}`,
               role: role,
               country: country
            }
        });
    } catch (error) {
        let errorMessage = "User creation failed due to an internal server error.";
        let statusCode = 500;

        if (error.message && error.message.includes("Firestore") && userRecord && userRecord.uid) {
            errorMessage = "User creation partially failed (profile storage). Please try again or contact support.";
            try {
                await auth.deleteUser(userRecord.uid); 
            } catch (deleteError) {
                console.error(`CRITICAL: Failed to delete Firebase Auth user ${userRecord.uid} after Firestore save error:`, deleteError);
                errorMessage = "User creation failed critically. Orphaned account may exist. Contact support immediately.";
            }
        }
        else if (error.code === "auth/email-already-exists") {
            errorMessage = "The email address is already in use.";
            statusCode = 409;
        } else if (error.code === "auth/invalid-password") {
            errorMessage = "Password should be at least 6 characters.";
            statusCode = 400;
        } else if (error.code === "auth/invalid-email") {
            errorMessage = "The email address is not valid.";
            statusCode = 400;
        } else if (error.code?.startsWith('auth/')) { 
             errorMessage = `User creation failed: ${error.message}`;
             statusCode = 400;
        }

        const responsePayload = { message: errorMessage };
        if (process.env.NODE_ENV !== 'production' && error.message) {
            responsePayload.detail = error.message;
            responsePayload.code = error.code; 
        }
        console.error("Error in createUserByAdmin:", error);
        res.status(statusCode).json(responsePayload);
    }
};

export const getAllUsersForAdmin = async (req, res) => {
    try {
        const listUsersResult = await auth.listUsers(1000); 
        
        const usersWithFirestoreData = await Promise.all(
            listUsersResult.users.map(async (userRecord) => {
                let firestoreData = null;
                try {
                    firestoreData = await UserModel.getUserById(userRecord.uid);
                } catch (dbError) {
                    console.warn(`Could not fetch Firestore data for user ${userRecord.uid}:`, dbError.message);
                }
                return {
                    uid: userRecord.uid,
                    email: userRecord.email,
                    displayName: firestoreData?.displayName || userRecord.displayName,
                    firstName: firestoreData?.firstName,
                    lastName: firestoreData?.lastName,
                    role: userRecord.customClaims?.role || 'student', 
                    country: firestoreData?.country,
                    church: firestoreData?.church,
                    enrollment: firestoreData?.enrollment,
                    createdAt: convertToDate(firestoreData?.createdAt) || convertToDate(userRecord.metadata.creationTime),
                    lastSignInTime: convertToDate(userRecord.metadata.lastSignInTime),
                    disabled: userRecord.disabled,
                    emailVerified: userRecord.emailVerified,
                };
            })
        );
        res.status(200).json(usersWithFirestoreData);
    } catch (error) {
        console.error("Error in getAllUsersForAdmin:", error);
        res.status(500).json({ message: "Failed to retrieve user list.", detail: process.env.NODE_ENV !== 'production' ? error.message : undefined });
    }
};

export const deleteUserAdmin = async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).json({ message: "User ID is required." });
    }
    try {
        await auth.deleteUser(userId); 
        
        try {
            await UserModel.deleteUser(userId); 
        } catch (dbError) {
            console.warn(`User ${userId} deleted from Auth, but failed to delete from Firestore:`, dbError.message);
        }
        
        res.status(200).json({ message: `User ${userId} deleted successfully.` });
    } catch (error) {
        console.error(`Error deleting user ${userId} by admin:`, error);
        if (error.code === 'auth/user-not-found') {
             try {
                await UserModel.deleteUser(userId);
                return res.status(200).json({ message: `User ${userId} not found in Authentication but was removed from database if present.` });
             } catch (dbError) {
                return res.status(404).json({ message: "User not found in Firebase Authentication and database record could not be verified/removed." });
             }
        }
        res.status(500).json({ message: "Failed to delete user.", detail: process.env.NODE_ENV !== 'production' ? error.message : undefined });
    }
};

export const updateUserStatusAdmin = async (req, res) => {
    const { userId } = req.params;
    const { role, disabled } = req.body;

    if (!userId) {
        return res.status(400).json({ message: "User ID is required." });
    }
    if (role === undefined && disabled === undefined) {
        return res.status(400).json({ message: "At least one field (role or disabled status) must be provided for update." });
    }

    const updates = {};
    const firestoreUpdates = {};

    if (role !== undefined) {
        if (!['student', 'admin', 'instructor'].includes(role)) {
            return res.status(400).json({ message: "Invalid role specified. Allowed roles: student, admin, instructor." });
        }
        updates.customClaims = { role }; 
        firestoreUpdates.role = role;     
    }

    if (disabled !== undefined) {
        if (typeof disabled !== 'boolean') {
            return res.status(400).json({ message: "Disabled status must be a boolean." });
        }
        updates.disabled = disabled; 
    }

    try {
        await auth.updateUser(userId, updates);
        if (Object.keys(firestoreUpdates).length > 0) {
            // UserModel.updateUser should also set updatedAt via FieldValue.serverTimestamp()
            await UserModel.updateUser(userId, firestoreUpdates);
        }
        
        const updatedUserRecord = await auth.getUser(userId);
        const updatedFirestoreUser = await UserModel.getUserById(userId);

        res.status(200).json({
            message: `User ${userId} status updated successfully.`,
            user: {
                uid: updatedUserRecord.uid,
                email: updatedUserRecord.email,
                displayName: updatedFirestoreUser?.displayName || updatedUserRecord.displayName,
                role: updatedUserRecord.customClaims?.role,
                disabled: updatedUserRecord.disabled,
            }
        });
    } catch (error) {
        console.error(`Error updating status for user ${userId} by admin:`, error);
        if (error.code === 'auth/user-not-found') {
            return res.status(404).json({ message: "User not found." });
        }
        res.status(500).json({ message: "Failed to update user status.", detail: process.env.NODE_ENV !== 'production' ? error.message : undefined });
    }
};