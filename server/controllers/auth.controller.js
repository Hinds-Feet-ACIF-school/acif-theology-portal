import jwt from "jsonwebtoken";
import { auth } from "../config/firebase.config.js";
import * as UserModel from "../models/user.model.js";

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
                createdAt: firestoreUser.createdAt,
                updatedAt: firestoreUser.updatedAt,
            };
        } else {
             userProfileData = { enrollment: null };
        }
    } catch(dbError) {
         userProfileData = { enrollment: null };
    }

    const userRole = userRecord.customClaims?.role || 'student';
    const accessToken = jwt.sign(
        { uid: uid, role: userRole },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
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
        displayName: userRecord.displayName,
        role: userRole,
        ...userProfileData
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
                responseMessage = `Login failed: ${error.message}`;
        }
    } else {
        responseMessage = error.message || responseMessage;
    }
    res.status(statusCode).json({ message: responseMessage, detail: error.message });
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
            { expiresIn: "15m" }
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
        return res.status(500).json({ message: "Failed to refresh session due to a server error." });
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
        let userProfileData = null;
        try {
            userProfileData = await UserModel.getUserById(userId);
            if (!userProfileData) {
                 userProfileData = { enrollment: null };
            }
        } catch (dbError) {
            return res.status(500).json({ message: "Failed to retrieve user profile data." });
        }
        const responseUserData = {
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userProfileData?.displayName || userRecord.displayName || `${userProfileData?.firstName} ${userProfileData?.lastName}`.trim() || 'N/A',
            firstName: userProfileData?.firstName || userRecord.displayName?.split(' ')[0] || null,
            lastName: userProfileData?.lastName || userRecord.displayName?.split(' ').slice(1).join(' ') || null,
            role: userRoleFromToken,
            country: userProfileData?.country || null,
            church: userProfileData?.church || null,
            enrollment: userProfileData?.enrollment || null,
            createdAt: userProfileData?.createdAt || null,
            updatedAt: userProfileData?.updatedAt || null,
            profileComplete: userProfileData?.profileComplete,
            profilePicture: userProfileData?.profilePicture,
            bio: userProfileData?.bio,
        };
        res.status(200).json(responseUserData);
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            return res.status(404).json({ message: "User account not found." });
        }
        res.status(500).json({ message: "Failed to fetch user details due to a server error." });
    }
};

export const resetPassword = async (req, res) => {
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
            message: "If an account with that email exists, a password reset email has been sent.",
        });
    } catch (error) {
        if (error.code === 'auth/invalid-email') {
            return res.status(400).json({ message: "Invalid email format provided." });
        }
        if (error.code === 'auth/user-not-found') {
            return res.status(200).json({ message: "If an account with that email exists, a password reset email has been sent." });
        }
        res.status(500).json({ message: "Failed to send password reset email due to a server error.", detail: error.message });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.uid) {
            return res.status(401).json({ message: "Unauthorized: No user identification found." });
        }
        const { uid } = req.user;
        const { firstName, lastName, country, church } = req.body;
        const updatedFirebaseAuthData = {};
        const updatedFirestoreData = {};

        if (firstName !== undefined || lastName !== undefined) {
            const currentUserRecord = await auth.getUser(uid);
            const currentFirstName = currentUserRecord.displayName?.split(' ')[0] || '';
            const currentLastName = currentUserRecord.displayName?.split(' ').slice(1).join(' ') || '';
            const newFirstName = firstName !== undefined ? firstName : currentFirstName;
            const newLastName = lastName !== undefined ? lastName : currentLastName;
            const newDisplayName = `${newFirstName} ${newLastName}`.trim();
            if (newDisplayName) {
                updatedFirebaseAuthData.displayName = newDisplayName;
                if (firstName !== undefined) updatedFirestoreData.firstName = newFirstName;
                if (lastName !== undefined) updatedFirestoreData.lastName = newLastName;
                updatedFirestoreData.displayName = newDisplayName;
            }
        }
        if (country !== undefined) {
            updatedFirestoreData.country = country;
        }
        if (church !== undefined) {
            updatedFirestoreData.church = church || null;
        }
        const authUpdatesExist = Object.keys(updatedFirebaseAuthData).length > 0;
        const firestoreUpdatesExist = Object.keys(updatedFirestoreData).length > 0;

        if (!authUpdatesExist && !firestoreUpdatesExist) {
             const currentUserData = await UserModel.getUserById(uid);
             return res.status(200).json({
                message: "No changes detected in profile data.",
                user: currentUserData
             });
        }
        if (authUpdatesExist) {
            await auth.updateUser(uid, updatedFirebaseAuthData);
        }
        if (firestoreUpdatesExist) {
            await UserModel.updateUser(uid, updatedFirestoreData);
        }
        const finalUserRecord = await auth.getUser(uid);
        const finalUserDoc = await UserModel.getUserById(uid);
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
            profileComplete: finalUserDoc?.profileComplete,
            profilePicture: finalUserDoc?.profilePicture,
            bio: finalUserDoc?.bio,
            createdAt: finalUserDoc?.createdAt,
            updatedAt: finalUserDoc?.updatedAt,
        };
        res.status(200).json({
            message: "User profile updated successfully",
            user: responseUser,
        });
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            return res.status(404).json({ message: "User not found in Authentication." });
        }
        if (error.message && error.message.includes("User with ID") && error.message.includes("not found")) {
             return res.status(404).json({ message: "User profile data not found." });
        }
        res.status(500).json({ message: "Failed to update profile due to a server error.", detail: error.message });
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
        res.status(500).json({ message: "Failed to change password due to a server error.", detail: error.message });
    }
};

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
                    // Silently ignore if Firestore data is missing for a user for now
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
                    createdAt: firestoreData?.createdAt || userRecord.metadata.creationTime,
                    disabled: userRecord.disabled,
                };
            })
        );
        res.status(200).json(usersWithFirestoreData);
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve user list.", detail: error.message });
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
            // Log warning but don't fail the request if Firestore delete fails after Auth delete
        }
        res.status(200).json({ message: `User ${userId} deleted successfully.` });
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            return res.status(404).json({ message: "User not found in Firebase Authentication." });
        }
        res.status(500).json({ message: "Failed to delete user.", detail: error.message });
    }
};