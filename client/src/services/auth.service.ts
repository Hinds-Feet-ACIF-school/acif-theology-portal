// src/services/AuthService.ts
import { API } from "./api"; // Your API client setup

export interface LoginCredentials {
  email: string;
  // In your LoginPage, you send formData.email and formData.password
  // The backend login controller expects `idToken`.
  // This needs clarification. Assuming for now the login *frontend* component
  // uses Firebase Client SDK to get an idToken, and then passes that to this service.
  // If not, the LoginCredentials should be { idToken: string }
  // For now, I'll keep email/password as the frontend login component might first
  // sign in with Firebase client SDK and then call this login with the idToken.
  // Let's assume the login function in AuthContext handles getting idToken and this service is for your backend.
  // The provided login page's useAuth().login sends email/password.
  // The AuthContext's login function would then likely call firebase.auth().signInWithEmailAndPassword()
  // then get the idToken and call this AuthService.login (or a similar backend call).

  // Given the backend login controller:
  // export const login = async (req, res) => { try { const { idToken } = req.body; ... }}
  // The LoginCredentials should ideally be:
  // idToken: string;
  // For now, I will proceed with the original LoginCredentials and assume the higher-level
  // `useAuth().login` method transforms `email, password` into an `idToken` before calling a backend API
  // that this AuthService might represent, or that the `/auth/login` endpoint you provided
  // in this AuthService file is different from the one in the controller.
  //
  // **IMPORTANT**: Based on your `auth.controller.js`'s `login` function,
  // it expects an `idToken`. Your `LoginPage.tsx` calls `useAuth().login(formData.email, formData.password)`.
  // The `useAuth().login` function (not provided here) would typically:
  // 1. Use Firebase client SDK's `signInWithEmailAndPassword(email, password)`.
  // 2. Get the `idToken` from the result: `userCredential.user.getIdToken()`.
  // 3. Then call *this* `AuthService.login({ idToken: THE_ID_TOKEN })` to hit your backend.
  // So, I will adjust `LoginCredentials` and the `login` method call.
  idToken: string; // Changed from email/password
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  church?: string;
  country?: string;
  role?: string; // Role can be passed during registration as per controller
}

// The backend register controller does NOT return a token.
// It returns { message: string, userId: string }
// AuthResponse is more suited for the login response.
export interface RegisterResponse {
    message: string;
    userId: string;
    // If register also logs in and returns token, then AuthResponse is fine.
    // Based on controller, it doesn't.
}


export interface User {
  uid: string;
  email: string;
  firstName?: string; // Made optional as they might not always be present initially
  lastName?: string;  // Made optional
  displayName?: string;
  role: string;
  country?: string;
  church?: string | null;
  enrollment?: any | null; // Consider a more specific type for enrollment
  createdAt?: string | Date; // Dates can be string (ISO) or Date objects
  updatedAt?: string | Date;
  profileComplete?: boolean;
  profilePicture?: string | null;
  bio?: string | null;
}
export interface AuthResponse {
  token: string; // This is the JWT access token from your backend
  user: User;
}


// For forgotPassword and resetPassword responses
export interface MessageResponse {
  message: string;
}

const AuthService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Backend's /auth/login expects an idToken obtained from Firebase client-side auth
    const response = await API.post<AuthResponse>("/auth/login", credentials); // Pass idToken directly
    if (response.data.token && response.data.user) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async register(data: RegisterData): Promise<RegisterResponse> { // Changed return type
    // The backend register endpoint returns: { message: "User registered successfully. Please log in.", userId: userRecord.uid }
    // It does not return a token or full user object for immediate login.
    try {
      const response = await API.post<RegisterResponse>("/auth/register", data);
      console.log("Registration backend response:", response.data);
      // No token is returned by the provided register controller, so no localStorage setting here.
      // User needs to login separately.
      return response.data;
    } catch (error: any) {
      console.error("Registration failed:", error);
      if (error.response) {
        console.error("Server responded with:", error.response.data);
        console.error("Status code:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error during request setup:", error.message);
      }
      throw new Error(error.response?.data?.message || "Registration failed. Please try again.");
    }
  },

  async logout(): Promise<void> {
    try {
      // The backend /auth/logout clears the httpOnly refresh token cookie.
      await API.post("/auth/logout");
    } catch (error) {
      // Log error but proceed with client-side cleanup
      console.error("Error during server logout:", error);
    } finally {
      // Client-side cleanup
      localStorage.removeItem("token"); // Access token
      localStorage.removeItem("user");
    }
  },

  async getCurrentUser(): Promise<User> { // Return type changed to User
    const token = this.getToken();
    if (!token) {
      // It's better to let the caller handle this, or for AuthContext to not call if no token.
      // Throwing an error here is reasonable if a token is expected.
      throw new Error("No authentication token found. Please log in.");
    }

    try {
      // Endpoint changed from /auth/current-user to /auth/me based on your auth.routes.js
      const response = await API.get<User>("/auth/me", { // Use /auth/me
        headers: { Authorization: `Bearer ${token}` },
      });
      // Optionally, update local storage user if it's different and you want to keep it fresh
      // localStorage.setItem("user", JSON.stringify(response.data));
      return response.data;
    } catch (error: any) {
      console.error("Error fetching current user:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        // If unauthorized, clear local storage as the token is likely invalid/expired
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      throw error; // Re-throw for the caller (e.g., AuthContext) to handle
    }
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem("user"); // Clear corrupted data
        return null;
      }
    }
    return null;
  },

  isAuthenticated(): boolean {
    // Could also add token expiration check here if tokens have 'exp' claim
    return !!localStorage.getItem("token");
  },

  getToken(): string | null {
    return localStorage.getItem("token");
  },

  async requestPasswordReset(email: string): Promise<MessageResponse> {
    // Updated endpoint and expected response based on your backend controller
    const response = await API.post<MessageResponse>("/auth/request-password-reset", { email });
    return response.data;
  },

  async confirmPasswordReset(token: string, newPassword: string): Promise<MessageResponse> {
    // Updated endpoint, parameters, and expected response
    const response = await API.post<MessageResponse>("/auth/confirm-password-reset", { token, newPassword });
    return response.data;
  },

  async updateProfile(userData: Partial<User>): Promise<User> { // userData can be partial
    const token = this.getToken();
    if (!token) {
      throw new Error("No authentication token found. Please log in.");
    }

    // Endpoint changed to /auth/profile based on your auth.routes.js
    // Your auth.controller.js handles updateUserProfile for this route.
    const response = await API.put<{ message: string, user: User }>("/auth/profile", userData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // The backend for updateUserProfile returns { message: string, user: User }
    // Update stored user data with the fresh data from the server
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data.user;
  },

  async changePassword(newPassword: string): Promise<MessageResponse> {
    const token = this.getToken();
    if (!token) {
        throw new Error("No authentication token found.");
    }
    // Assumes currentPassword might be needed by backend, or just newPassword if it's a verified session
    // Your backend controller for changePassword only takes newPassword when user is authenticated
    const response = await API.post<MessageResponse>("/auth/change-password", { newPassword }, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

export default AuthService;