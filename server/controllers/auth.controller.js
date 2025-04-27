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
    console.log(`Firebase Auth user created: ${userRecord.uid}`);


    await auth.setCustomUserClaims(userRecord.uid, { role: role });
    console.log(`Custom claims set for user: ${userRecord.uid}`);


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
    console.log(`Calling UserModel.createUser for UID: ${userRecord.uid}`);
    await UserModel.createUser(userDataForFirestore);
    console.log(`Firestore document creation successful for user: ${userRecord.uid}`);


    res.status(201).json({
      message: "User registered successfully. Please log in.",
      userId: userRecord.uid,
    });

  } catch (error) {
    console.error("Error during registration process:", error);

    let errorMessage = "Registration failed due to an internal server error.";
    let statusCode = 500;


    if (error.message.includes("Firestore") && userRecord && userRecord.uid) {
         console.warn(`Firestore error occurred after Auth user creation (UID: ${userRecord.uid}). Attempting cleanup.`);

         errorMessage = "Registration partially failed during profile creation. Please try again or contact support.";
         statusCode = 500;


        try {
            await auth.deleteUser(userRecord.uid);
            console.log(`Orphaned Auth user ${userRecord.uid} deleted successfully.`);
        } catch (deleteError) {

             console.error(`CRITICAL: Failed to delete orphaned Auth user ${userRecord.uid} after Firestore failure:`, deleteError);
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
  console.log("--- Backend /api/auth/login endpoint hit ---");
  try {
    const { idToken } = req.body;
    console.log("Received idToken:", idToken ? "Present" : "MISSING!");

    if (!idToken) {
      console.log("Login failed: ID token missing.");
      return res.status(400).json({ message: "ID token is required." });
    }

    console.log("Verifying Firebase ID token...");
    const decodedFirebaseToken = await auth.verifyIdToken(idToken);
    const uid = decodedFirebaseToken.uid;
    console.log("Firebase ID token verified. UID:", uid);

    console.log("Getting user record for UID:", uid);
    const userRecord = await auth.getUser(uid);
    console.log("User record fetched. Email:", userRecord.email);

    if (userRecord.disabled) {
        console.log("Login failed: User account disabled. UID:", uid);
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
            console.log("Firestore user profile data fetched for UID:", uid);
        } else {

             console.warn(`Login Warning: Firestore document not found for UID ${uid}. Auth user exists.`);


             userProfileData = { enrollment: null };
        }
    } catch(dbError) {
        console.error(`Error fetching Firestore user profile during login for UID ${uid}:`, dbError);


         userProfileData = { enrollment: null };
    }

    const userRole = userRecord.customClaims?.role || 'student';
    console.log("User role determined:", userRole);

    console.log("Generating access token...");

    const accessToken = jwt.sign(
        { uid: uid, role: userRole },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );
    console.log("Access token generated.");

    console.log("Generating refresh token...");
    const refreshToken = jwt.sign(
        { uid: uid },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );
    console.log("Refresh token generated.");

    const secureFlag = process.env.NODE_ENV === 'production';
    console.log(`Setting refresh token cookie. Secure flag: ${secureFlag}`);

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: secureFlag,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
    });
    console.log("Refresh token cookie set in response headers.");

    console.log("Sending successful login response.");
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
    console.log("--- Backend /api/auth/login successful ---");

  } catch (error) {
    console.error("!!! Login Error Caught in /api/auth/login:", error);
    res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
    console.log("Cleared refresh token cookie due to error.");

    let statusCode = 500;
    let responseMessage = "Login failed due to a server error.";

    if (error.code) {
        console.log("Firebase Error Code:", error.code);
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

                if (error.message.includes("verifyIdToken")) {
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

    console.log(`Sending error response: Status ${statusCode}, Message: ${responseMessage}`);
    res.status(statusCode).json({ message: responseMessage, detail: error.message });
  }
};


export const refreshToken = async (req, res) => {
    console.log('--- Refresh Token Endpoint Hit ---');
    console.log('Request Cookies:', req.cookies);
    console.log('Request Origin:', req.headers.origin);

    const refreshTokenFromCookie = req.cookies?.refreshToken;

    if (!refreshTokenFromCookie) {
        console.log('Refresh token endpoint: No refresh token cookie found.');
        return res.status(401).json({ message: "Authentication required. Please log in." });
    }

    try {
        const decoded = jwt.verify(refreshTokenFromCookie, process.env.REFRESH_TOKEN_SECRET);
        const userId = decoded.uid;

        if (!userId) {
            console.log('Refresh token endpoint: Invalid refresh token payload (missing uid).');
            res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
            return res.status(403).json({ message: "Invalid session token. Please log in again." });
        }


        const userRecord = await auth.getUser(userId);
        if (userRecord.disabled) {
            console.log(`Refresh token endpoint: User ${userId} is disabled.`);
            res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
            return res.status(401).json({ message: "Your account has been disabled." });
        }


        const newAccessToken = jwt.sign(
            { uid: userId, role: userRecord.customClaims?.role || 'student' },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        console.log(`Refresh token endpoint: New access token generated for user ${userId}.`);
        res.status(200).json({
            message: "Token refreshed successfully",
            token: newAccessToken,
        });

    } catch (error) {
        console.error("Refresh token verification or user check failed:", error);
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
        console.log('--- Logout Endpoint Hit ---');

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        });
        console.log('Refresh token cookie cleared.');

        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Logout error (clearing cookie):", error);

        res.status(200).json({ message: "Logout processed, client should clear local session." });
    }
};


export const getCurrentUser = async (req, res) => {
    console.log('--- Get Current User (/me) Endpoint Hit ---');
    try {

        if (!req.user || !req.user.uid) {
            console.log('/me Error: Missing user information in request after verifyToken.');
            return res.status(401).json({ message: "Unauthorized: Invalid authentication token." });
        }
        const userId = req.user.uid;
        const userRoleFromToken = req.user.role;
        console.log(`/me: Fetching data for user UID: ${userId}, Role from token: ${userRoleFromToken}`);



        const userRecord = await auth.getUser(userId);
         console.log(`/me: Fetched Auth record for ${userId}. Email: ${userRecord.email}`);

        if (userRecord.disabled) {
             console.log(`/me Error: User ${userId} is disabled.`);
             return res.status(403).json({ message: "Account is disabled." });
        }


        let userProfileData = null;
        try {
            userProfileData = await UserModel.getUserById(userId);
            if (userProfileData) {
                console.log(`/me: Fetched Firestore profile for ${userId}.`);
            } else {

                 console.warn(`/me Warning: Firestore document NOT FOUND for authenticated user ${userId}.`);

                 userProfileData = { enrollment: null };
            }
        } catch (dbError) {
            console.error(`/me Error: Failed to fetch Firestore profile for user ${userId}:`, dbError);


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

        console.log(`/me: Sending combined user data for ${userId}.`);
        res.status(200).json(responseUserData);

    } catch (error) {
        console.error("Error fetching current user details (/me):", error);
        if (error.code === 'auth/user-not-found') {

            console.log(`/me Error: User ${req.user?.uid} not found in Firebase Auth.`);
            return res.status(404).json({ message: "User account not found." });
        }

        res.status(500).json({ message: "Failed to fetch user details due to a server error." });
    }
};


export const resetPassword = async (req, res) => {
    console.log('--- Reset Password Endpoint Hit ---');
    try {
        const { email } = req.body;
        if (!email) {
            console.log('Reset Password: Email missing from request.');
            return res.status(400).json({ message: "Email is required." });
        }
        console.log(`Reset Password: Attempting to send reset email to ${email}`);


        const actionCodeSettings = {

            url: process.env.PASSWORD_RESET_REDIRECT_URL || 'http://localhost:5173/login?reset=true',
            handleCodeInApp: false
        };


        await auth.sendPasswordResetEmail(email, actionCodeSettings);

        console.log(`Reset Password: Reset email successfully requested for ${email}.`);

        res.status(200).json({
            message: "If an account with that email exists, a password reset email has been sent.",
        });

    } catch (error) {
        console.error("Error sending password reset email:", error);

        if (error.code === 'auth/invalid-email') {
            return res.status(400).json({ message: "Invalid email format provided." });
        }
        if (error.code === 'auth/user-not-found') {

            console.log(`Reset Password: User not found for email ${req.body.email}, sending generic success response.`);
            return res.status(200).json({ message: "If an account with that email exists, a password reset email has been sent." });
        }


        res.status(500).json({ message: "Failed to send password reset email due to a server error.", detail: error.message });
    }
};



export const updateUserProfile = async (req, res) => {
    console.log('--- Update User Profile Endpoint Hit ---');
    try {

        if (!req.user || !req.user.uid) {
            console.log('Update Profile Error: Missing user identification from token.');
            return res.status(401).json({ message: "Unauthorized: No user identification found." });
        }
        const { uid } = req.user;
        console.log(`Update Profile: Attempting update for UID: ${uid}`);



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
                console.log(`Update Profile (${uid}): Preparing display name update to "${newDisplayName}"`);
            }
        }


        if (country !== undefined) {
            updatedFirestoreData.country = country;
            console.log(`Update Profile (${uid}): Preparing country update to "${country}"`);
        }
        if (church !== undefined) {

            updatedFirestoreData.church = church || null;
            console.log(`Update Profile (${uid}): Preparing church update to "${updatedFirestoreData.church}"`);
        }





        const authUpdatesExist = Object.keys(updatedFirebaseAuthData).length > 0;
        const firestoreUpdatesExist = Object.keys(updatedFirestoreData).length > 0;

        if (!authUpdatesExist && !firestoreUpdatesExist) {
            console.log(`Update Profile (${uid}): No valid or changed update data provided.`);

             const currentUserData = await UserModel.getUserById(uid);
             return res.status(200).json({
                message: "No changes detected in profile data.",
                user: currentUserData
             });
        }


        if (authUpdatesExist) {
            await auth.updateUser(uid, updatedFirebaseAuthData);
            console.log(`Update Profile (${uid}): Firebase Auth record updated.`);
        }

        if (firestoreUpdatesExist) {

            await UserModel.updateUser(uid, updatedFirestoreData);
            console.log(`Update Profile (${uid}): Firestore document updated.`);
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

        console.log(`Update Profile (${uid}): Update successful. Sending updated user data.`);
        res.status(200).json({
            message: "User profile updated successfully",
            user: responseUser,
        });

    } catch (error) {
        console.error(`Error updating user profile for UID ${req.user?.uid}:`, error);
        if (error.code === 'auth/user-not-found') {
            return res.status(404).json({ message: "User not found in Authentication." });
        }
        if (error.message.includes("User with ID") && error.message.includes("not found")) {

             return res.status(404).json({ message: "User profile data not found." });
        }

        res.status(500).json({ message: "Failed to update profile due to a server error.", detail: error.message });
    }
};


export const changePassword = async (req, res) => {
    console.log('--- Change Password Endpoint Hit ---');
    try {

        if (!req.user || !req.user.uid) {
            console.log('Change Password Error: Missing user identification from token.');
            return res.status(401).json({ message: "Unauthorized: Invalid authentication token." });
        }
        const { uid } = req.user;
        const { newPassword } = req.body;
         console.log(`Change Password: Attempting password change for UID: ${uid}`);


        if (!newPassword || newPassword.length < 6) {
            console.log(`Change Password (${uid}): Invalid new password provided.`);
            return res.status(400).json({ message: "New password must be at least 6 characters long." });
        }


        await auth.updateUser(uid, {
            password: newPassword,
        });

        console.log(`Change Password (${uid}): Password successfully updated.`);



        res.status(200).json({ message: "Password changed successfully" });

    } catch (error) {
        console.error(`Error changing password for UID ${req.user?.uid}:`, error);

        if (error.code === 'auth/requires-recent-login') {

             console.log(`Change Password (${req.user?.uid}): Operation requires recent login.`);
            return res.status(403).json({
                message: "This operation requires you to have logged in recently. Please log out and log back in to change your password.",
                code: error.code
            });
        }
        if (error.code === 'auth/user-not-found') {
            console.log(`Change Password (${req.user?.uid}): User not found.`);
            return res.status(404).json({ message: "User account not found." });
        }
        if (error.code === 'auth/weak-password') {

             console.log(`Change Password (${req.user?.uid}): Weak password provided.`);
             return res.status(400).json({ message: "Password is too weak. Please choose a stronger password." });
        }


        res.status(500).json({ message: "Failed to change password due to a server error.", detail: error.message });
    }
};