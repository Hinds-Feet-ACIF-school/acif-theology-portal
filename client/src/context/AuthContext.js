import { jsx as _jsx } from "react/jsx-runtime";
// src/context/AuthContext.tsx
import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut as firebaseSignOut, } from "firebase/auth";
import * as apiService from "../services/api.js";
import { getToken } from "../services/api.js";
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
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchUserProfile = useCallback(async () => {
        try {
            const token = getToken();
            if (!token) {
                setCurrentUser(null);
                return null;
            }
            const userData = await apiService.getUserProfile();
            setCurrentUser(userData);
            setError(null);
            return userData;
        }
        catch (err) {
            console.warn("AuthContext: Failed to fetch user profile", err.message);
            setCurrentUser(null);
            if (err.response?.status === 401 || err.response?.status === 403) {
                apiService.removeToken();
            }
            return null;
        }
    }, []);
    useEffect(() => {
        const initializeAuth = async () => {
            setLoading(true);
            try {
                await fetchUserProfile();
            }
            catch (error) {
                console.error("Error initializing auth:", error);
            }
            finally {
                setLoading(false);
            }
        };
        initializeAuth();
    }, [fetchUserProfile]);
    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            const idToken = await firebaseUser.getIdToken(true);
            const backendResponse = await apiService.loginUser({ idToken });
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
                        errorMessage = 'Too many login attempts. Try again later.';
                        break;
                    case 'auth/network-request-failed':
                        errorMessage = 'Network error. Check connection.';
                        break;
                    default:
                        errorMessage = `Firebase Auth Error: ${err.message}`;
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
        try {
            const response = await apiService.registerUser(userData);
            setCurrentUser(response.user);
            return response.user;
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
        try {
            await firebaseSignOut(auth);
            await apiService.logoutUser();
        }
        catch (err) {
            console.error("AuthContext: Logout error (backend call likely failed):", err);
            setError("Logout failed to clear server session, but you are logged out locally.");
        }
        finally {
            setCurrentUser(null);
            setLoading(false);
        }
    };
    const updateProfile = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const updatedUser = await apiService.updateUserProfile(userData);
            setCurrentUser(updatedUser);
            return updatedUser;
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
    const isStudent = currentUser?.role === "student"; // Explicitly check for student role
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
    return (_jsx(AuthContext.Provider, { value: value, children: !loading ? children : _jsx("div", { children: "Loading Authentication..." }) }));
};
