import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth";
import * as apiService from "../services/api.js";
import { getToken } from "../services/api.js";
import { Loader2 } from "lucide-react";
const firebaseConfig = {
    apiKey: "AIzaSyDxTr1s-l6CQc7OBA4Vr_8l2eVrGiN-BEg",
    authDomain: "acif-theology-school.firebaseapp.com",
    projectId: "acif-theology-school",
    storageBucket: "acif-theology-school.appspot.com",
    messagingSenderId: "990145954838",
    appId: "1:990145954838:web:49fcb99ea88b0fd900e137",
    measurementId: "G-SW5S5FRPM0"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const AuthContext = createContext(undefined);
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
const goldAccent = 'text-[#C5A467]';
const sectionBgLight = "bg-[#FFF8F0]";
const sectionBgDark = "dark:bg-gray-950";
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchUserProfile = useCallback(async () => {
        console.log("AuthContext: Attempting to fetch user profile...");
        try {
            const token = getToken();
            if (!token) {
                console.log("AuthContext: No token found, user is likely logged out.");
                setCurrentUser(null);
                return null;
            }
            console.log("AuthContext: Token found, calling apiService.getUserProfile().");
            const userData = await apiService.getUserProfile();
            console.log("AuthContext: User profile fetched successfully:", userData?.uid);
            setCurrentUser(userData);
            setError(null);
            return userData;
        }
        catch (err) {
            console.warn("AuthContext: Failed to fetch user profile -", err.message);
            setCurrentUser(null);
            if (err.response?.status === 401 || err.response?.status === 403) {
                console.log("AuthContext: Received 401/403 on profile fetch, removing token.");
                apiService.removeToken();
            }
            return null;
        }
    }, []);
    useEffect(() => {
        const initializeAuth = async () => {
            console.log("AuthContext: Initializing authentication...");
            setLoading(true);
            await fetchUserProfile();
            console.log("AuthContext: Initialization fetch complete.");
            setLoading(false);
        };
        initializeAuth();
    }, [fetchUserProfile]);
    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        console.log("AuthContext: Attempting Firebase sign in...");
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            console.log("AuthContext: Firebase sign in successful, getting ID token...");
            const idToken = await firebaseUser.getIdToken(true);
            console.log("AuthContext: Got ID token, calling backend login...");
            const backendResponse = await apiService.loginUser({ idToken });
            console.log("AuthContext: Backend login successful, setting current user.");
            setCurrentUser(backendResponse.user);
            return backendResponse.user;
        }
        catch (err) {
            console.error("AuthContext: Login process error:", err);
            setCurrentUser(null);
            apiService.removeToken();
            let errorMessage = "Login failed. Please check credentials.";
            if (err.code && err.code.startsWith('auth/')) {
                switch (err.code) {
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                    case 'auth/invalid-credential':
                        errorMessage = 'Invalid email or password.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Invalid email format.';
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = 'Access temporarily disabled due to too many failed login attempts. Please reset your password or try again later.';
                        break;
                    case 'auth/network-request-failed':
                        errorMessage = 'Network error. Please check your internet connection.';
                        break;
                    default:
                        errorMessage = `An unexpected authentication error occurred (${err.code}).`;
                        break;
                }
            }
            else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
            throw new Error(errorMessage);
        }
        finally {
            setLoading(false);
        }
    };
    const register = async (userData) => {
        setLoading(true);
        setError(null);
        console.log("AuthContext: Attempting registration via API...");
        try {
            const response = await apiService.registerUser(userData);
            console.log("AuthContext: Backend registration successful. User ID:", response.userId);
            console.log("AuthContext: Fetching profile immediately after registration...");
            const newUserProfile = await fetchUserProfile();
            if (newUserProfile) {
                setCurrentUser(newUserProfile);
                return newUserProfile;
            }
            else {
                console.warn("AuthContext: Could not fetch profile immediately after registration.");
                setCurrentUser(null);
                setError("Registration successful, but failed to load profile. Please log in.");
                return null;
            }
        }
        catch (err) {
            console.error("AuthContext: Registration error:", err);
            setCurrentUser(null);
            apiService.removeToken();
            let errorMessage = "Registration failed. Please try again.";
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
            throw new Error(errorMessage);
        }
        finally {
            setLoading(false);
        }
    };
    const logout = async () => {
        setLoading(true);
        setError(null);
        console.log("AuthContext: Logging out...");
        try {
            await firebaseSignOut(auth);
            console.log("AuthContext: Firebase client signed out.");
            await apiService.logoutUser();
            console.log("AuthContext: Backend logout notified.");
        }
        catch (err) {
            console.error("AuthContext: Logout error (backend notification likely failed):", err);
        }
        finally {
            setCurrentUser(null);
            apiService.removeToken();
            console.log("AuthContext: Local state and token cleared.");
            setLoading(false);
        }
    };
    const updateProfile = async (userData) => {
        setLoading(true);
        setError(null);
        console.log("AuthContext: Updating profile via API...");
        try {
            const response = await apiService.updateUserProfile(userData);
            console.log("AuthContext: Profile update successful, setting new user data.");
            setCurrentUser(response.user);
            return response.user;
        }
        catch (err) {
            console.error("AuthContext: Update profile error:", err);
            let errorMessage = "Failed to update profile.";
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
            throw new Error(errorMessage);
        }
        finally {
            setLoading(false);
        }
    };
    const isAuthenticated = !!currentUser;
    const isAdmin = currentUser?.role === "admin";
    const isInstructor = currentUser?.role === "instructor" || isAdmin;
    const isStudent = currentUser?.role === "student";
    const value = {
        user: currentUser,
        currentUser,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated,
        isAdmin,
        isInstructor,
        isStudent,
        refreshUser: fetchUserProfile
    };
    return (_jsx(AuthContext.Provider, {
        value: value,
        children: !loading ? children : (_jsx("div", {
            className: `flex items-center justify-center min-h-screen ${sectionBgLight} ${sectionBgDark}`,
            role: "status",
            "aria-label": "Loading authentication status",
            children: _jsx(Loader2, {
                className: `h-12 w-12 animate-spin ${goldAccent}`
            })
        }))
    }));
};
