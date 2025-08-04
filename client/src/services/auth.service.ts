import { API } from "./api"; 

export interface LoginCredentials {
  email: string;
  idToken: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  church?: string;
  country?: string;
  role?: string; 
}

export interface RegisterResponse {
    message: string;
    userId: string;
  
}


export interface User {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string; 
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
  token: string; 
  user: User;
}


// For forgotPassword and resetPassword responses
export interface MessageResponse {
  message: string;
}

const AuthService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await API.post<AuthResponse>("/auth/login", credentials); // Pass idToken directly
    if (response.data.token && response.data.user) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async register(data: RegisterData): Promise<RegisterResponse> { 
  
    try {
      const response = await API.post<RegisterResponse>("/auth/register", data);
      console.log("Registration backend response:", response.data);
 
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
     
      throw new Error("No authentication token found. Please log in.");
    }

    try {
      // Endpoint changed from /auth/current-user to /auth/me based on your auth.routes.js
      const response = await API.get<User>("/auth/me", { // Use /auth/me
        headers: { Authorization: `Bearer ${token}` },
      });
   
      return response.data;
    } catch (error: any) {
      console.error("Error fetching current user:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        // If unauthorized, clear local storage as the token is likely invalid/expired
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      throw error;
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
    return !!localStorage.getItem("token");
  },

  getToken(): string | null {
    return localStorage.getItem("token");
  },

  async requestPasswordReset(email: string): Promise<MessageResponse> {
    const response = await API.post<MessageResponse>("/auth/request-password-reset", { email });
    return response.data;
  },

  async confirmPasswordReset(token: string, newPassword: string): Promise<MessageResponse> {
    const response = await API.post<MessageResponse>("/auth/confirm-password-reset", { token, newPassword });
    return response.data;
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error("No authentication token found. Please log in.");
    }

   
    const response = await API.put<{ message: string, user: User }>("/auth/profile", userData, {
      headers: { Authorization: `Bearer ${token}` },
    });


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
    
    const response = await API.post<MessageResponse>("/auth/change-password", { newPassword }, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

export default AuthService;