// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from "react";
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut as firebaseSignOut, Auth } from "firebase/auth";
import * as apiService from "../services/api"; // Assuming .js, adjust if it's .ts
import { getToken } from "../services/api";   // Assuming .js
import { Loader2 } from "lucide-react";

export interface AppUser {
    uid: string;
    email?: string | null;
    displayName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    role?: 'student' | 'instructor' | 'admin';
    country?: string | null;
    church?: string | null;
    enrollment?: {
        cohortId: string;
        enrollmentDate: Date; // Or string if you receive it as string
        // cohortStartDate?: string; // Consider if this is needed in AppUser directly or fetched separately
    } | null;
    profileComplete?: boolean;
    profilePicture?: string | null;
    bio?: string | null;
    createdAt?: Date | string | null; // Allow string if backend sends it as ISO string
    updatedAt?: Date | string | null; // Allow string
}

interface AuthContextType {
    currentUser: AppUser | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<AppUser | null>;
    register: (userData: any) => Promise<AppUser | null>; // Consider defining a more specific type for registration userData
    logout: () => Promise<void>;
    updateProfile: (userData: Partial<Pick<AppUser, 'firstName' | 'lastName' | 'country' | 'church'>>) => Promise<AppUser | null>; // More specific for current form
    isAuthenticated: boolean;
    isAdmin: boolean;
    isInstructor: boolean;
    isStudent: boolean;
    fetchCurrentUser: () => Promise<AppUser | null>; // Renamed from refreshUser for clarity
    updateUserContextProfile: (updatedProfileData: Partial<AppUser>) => void; // New function
}

const firebaseConfig = {
    apiKey: "AIzaSyDxTr1s-l6CQc7OBA4Vr_8l2eVrGiN-BEg", // YOUR ACTUAL KEY
    authDomain: "acif-theology-school.firebaseapp.com",  // YOUR ACTUAL DOMAIN
    projectId: "acif-theology-school",               // YOUR ACTUAL PROJECT ID
    storageBucket: "acif-theology-school.appspot.com", // YOUR ACTUAL BUCKET
    messagingSenderId: "990145954838",                // YOUR ACTUAL SENDER ID
    appId: "1:990145954838:web:49fcb99ea88b0fd900e137", // YOUR ACTUAL APP ID
    measurementId: "G-SW5S5FRPM0"                     // YOUR ACTUAL MEASUREMENT ID
};

const app: FirebaseApp = initializeApp(firebaseConfig);
const authInstance: Auth = getAuth(app); // Renamed to authInstance to avoid conflict with auth in signInWithEmailAndPassword

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

const goldAccent = 'text-[#C5A467]';
const sectionBgLight = "bg-[#FFF8F0]";
const sectionBgDark = "dark:bg-gray-950";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCurrentUser = useCallback(async (): Promise<AppUser | null> => {
        // console.log("AuthContext: Attempting to fetch user profile...");
        try {
            const token = getToken();
            if (!token) {
                setCurrentUser(null);
                return null;
            }
            const userData: AppUser = await apiService.getCurrentUser(); // Changed from getUserProfile to getCurrentUser based on api.ts
            // console.log("AuthContext: User profile fetched:", userData?.uid);
            setCurrentUser(userData);
            setError(null);
            return userData;
        } catch (err: any) {
            // console.warn("AuthContext: Failed to fetch user profile -", err.message);
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
            await fetchCurrentUser();
            setLoading(false);
        };
        initializeAuth();
    }, [fetchCurrentUser]);

    const login = async (email: string, password: string): Promise<AppUser | null> => {
        setLoading(true);
        setError(null);
        try {
            const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
            const firebaseUser = userCredential.user;
            const idToken = await firebaseUser.getIdToken(true);
            const backendResponse = await apiService.loginUser({ idToken }); // loginUser in api.ts expects {idToken}
            setCurrentUser(backendResponse.user);
            return backendResponse.user;
        } catch (err: any) {
            setCurrentUser(null);
            apiService.removeToken();
            let errorMessage = "Login failed. Please check credentials.";
            // ... (keep your existing detailed error message logic)
            if (err.code?.startsWith('auth/')) { /* ... */ }
            else if (err.response?.data?.message) { errorMessage = err.response.data.message; }
            else if (err.message) { errorMessage = err.message; }
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData: any): Promise<AppUser | null> => {
        setLoading(true);
        setError(null);
        try {
            await apiService.registerUser(userData); // registerUser returns { message, userId }
            // After successful registration, log the user in or prompt them to log in.
            // For simplicity, let's assume they need to log in separately.
            // Or, if your backend auto-logs in or returns enough data:
            // const newUserProfile = await fetchCurrentUser(); // Fetch fresh profile
            // setCurrentUser(newUserProfile);
            // return newUserProfile;
            // For now, let's return null and they have to log in.
            setError("Registration successful! Please log in."); // Or a success message
            return null; // Indicate they need to log in
        } catch (err: any) {
            setCurrentUser(null);
            apiService.removeToken();
            let errorMessage = "Registration failed. Please try again.";
            if (err.response?.data?.message) { errorMessage = err.response.data.message; }
            else if (err.message) { errorMessage = err.message; }
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            await firebaseSignOut(authInstance);
            await apiService.logoutUser();
        } catch (err: any) {
            console.error("AuthContext: Logout error:", err);
        } finally {
            setCurrentUser(null);
            apiService.removeToken();
            setLoading(false);
        }
    };

    // Specific update for the profile page form
    const updateProfile = async (
        profileDataToUpdate: Partial<Pick<AppUser, 'firstName' | 'lastName' | 'country' | 'church'>>
    ): Promise<AppUser | null> => {
        setLoading(true);
        setError(null);
        try {
            // `apiService.updateUserProfile` should match the backend which expects fields like firstName, lastName, country, church
            const response = await apiService.updateUserProfile(profileDataToUpdate);
            setCurrentUser(response.user); // Assuming backend returns the full updated user object under 'user' key
            return response.user;
        } catch (err: any) {
            let errorMessage = "Failed to update profile.";
            if (err.response?.data?.message) { errorMessage = err.response.data.message; }
            else if (err.message) { errorMessage = err.message; }
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Generic function to update parts of the user in context, used by UserProfilePage
    const updateUserContextProfile = (updatedProfileData: Partial<AppUser>): void => {
        setCurrentUser(prevUser => {
            if (!prevUser) return null;
            return {
                ...prevUser,
                ...updatedProfileData,
            };
        });
    };

    const isAuthenticated = !!currentUser;
    const isAdmin = currentUser?.role === "admin";
    const isInstructor = currentUser?.role === "instructor" || isAdmin; // Admin can also be an instructor
    const isStudent = currentUser?.role === "student";

    const value: AuthContextType = {
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
        fetchCurrentUser,
        updateUserContextProfile, // Expose this function
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading ? children : (
                <div
                    className={`flex items-center justify-center min-h-screen ${sectionBgLight} ${sectionBgDark}`}
                    role="status"
                    aria-label="Loading application state"
                >
                    <Loader2 className={`h-12 w-12 animate-spin ${goldAccent}`} />
                </div>
            )}
        </AuthContext.Provider>
    );
};