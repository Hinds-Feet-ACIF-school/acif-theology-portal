import { API } from "./api";
const AuthService = {
    async login(credentials) {
        const response = await API.post("/auth/login", credentials);
        if (response.data.token) {
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        return response.data;
    },
    async register(data) {
        try {
            const response = await API.post("/auth/register", data);
            console.log("Registration successful:", response.data);
            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.user));
            }
            return response.data;
        }
        catch (error) {
            console.error("Registration failed:", error);
            if (error.response) {
                console.error("Server responded with:", error.response.data);
                console.error("Status code:", error.response.status);
                console.error("Headers:", error.response.headers);
            }
            else if (error.request) {
                console.error("No response received:", error.request);
            }
            else {
                console.error("Error during request:", error.message);
            }
            throw new Error(error.response?.data?.message || "Registration failed");
        }
    },
    async logout() {
        try {
            await API.post("/auth/logout");
        }
        catch (error) {
            console.error("Error during logout:", error);
        }
        finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
    },
    async getCurrentUser() {
        const token = this.getToken();
        if (!token) {
            throw new Error("No token found");
        }
        try {
            const response = await API.get("/auth/current-user", {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        }
        catch (error) {
            console.error("Error fetching current user:", error);
            throw error;
        }
    },
    getStoredUser() {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    },
    isAuthenticated() {
        return !!localStorage.getItem("token");
    },
    getToken() {
        return localStorage.getItem("token");
    },
    async forgotPassword(email) {
        await API.post("/auth/forgot-password", { email });
    },
    async resetPassword(token, password) {
        await API.post("/auth/reset-password", { token, password });
    },
    async updateProfile(userData) {
        const token = this.getToken();
        if (!token) {
            throw new Error("No token found");
        }
        const response = await API.put("/users/profile", userData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        // Update stored user data
        const currentUser = this.getStoredUser();
        if (currentUser) {
            const updatedUser = { ...currentUser, ...response.data };
            localStorage.setItem("user", JSON.stringify(updatedUser));
        }
        return response.data;
    },
};
export default AuthService;
