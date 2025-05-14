// src/services/apiClient.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const localBackendPort = import.meta.env.VITE_LOCAL_BACKEND_PORT || '5000'; // Renamed for clarity

// Use VITE_API_BASE_URL for production, fallback to local setup for development
const productionApiUrl = import.meta.env.VITE_API_BASE_URL; // This should be https://your-render-domain/api
const developmentApiUrl = `http://localhost:${localBackendPort}/api`;

const determinedBaseURL = process.env.NODE_ENV === 'development'
  ? developmentApiUrl
  : productionApiUrl;

// CRITICAL CHECK: Ensure productionApiUrl is actually set in production builds
if (process.env.NODE_ENV === 'production' && !productionApiUrl) {
  console.error("CRITICAL ERROR: VITE_API_BASE_URL is not set for production build!");
  // You might want to throw an error here or have a non-functional default
  // to make it obvious something is wrong. For now, it will proceed, but calls will likely fail.
}

console.log(`apiClient.ts: NODE_ENV is '${process.env.NODE_ENV}'`);
console.log(`apiClient.ts: Determined baseURL: ${determinedBaseURL}`);

const apiClient: AxiosInstance = axios.create({
  baseURL: determinedBaseURL, // Use the dynamically determined URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// --- Optional: Request Interceptor (e.g., to add JWT token) ---
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Example: Get token from local storage or a state manager
    const token = localStorage.getItem('accessToken'); // Or however you store your access token
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// --- Optional: Response Interceptor (e.g., for error handling or token refresh) ---
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  async (error: AxiosError) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Example: Token refresh logic
    // Check if the error is due to an expired token (e.g., 401 Unauthorized)
    // and if the request hasn't been retried yet.
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true; // Mark that we've tried to refresh to prevent infinite loops
      try {
        // Attempt to refresh the token
        // Assuming you have an endpoint for refreshing tokens
        // This endpoint should be excluded from the token refresh logic itself to avoid loops
        if (originalRequest.url === '/auth/refresh-token') {
            // If refresh token itself failed, don't retry, logout user or handle appropriately
            console.error("Refresh token attempt failed or is the failing request.");
            // Potentially clear tokens and redirect to login
            // localStorage.removeItem('accessToken');
            // window.location.href = '/login';
            return Promise.reject(error);
        }

        const refreshResponse = await apiClient.post<{ token: string }>('/auth/refresh-token'); // Adjust endpoint
        const newAccessToken = refreshResponse.data.token;

        localStorage.setItem('accessToken', newAccessToken); // Update stored token

        // Update the authorization header for the original request
        if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        // Retry the original request with the new token
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Handle failed refresh (e.g., redirect to login, clear tokens)
        console.error('Token refresh failed:', refreshError);
        // localStorage.removeItem('accessToken');
        // window.location.href = '/login'; // Example: redirect to login
        return Promise.reject(error); // Or reject with refreshError
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;