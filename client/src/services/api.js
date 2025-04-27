import axios from 'axios';
const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});
export const getToken = () => {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            return localStorage.getItem('token');
        }
        return null;
    }
    catch (e) {
        console.error("Could not access localStorage:", e);
        return null;
    }
};
export const setToken = (token) => {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('token', token);
        }
    }
    catch (e) {
        console.error("Could not access localStorage:", e);
    }
};
export const removeToken = () => {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem('token');
        }
    }
    catch (e) {
        console.error("Could not access localStorage:", e);
    }
};
let isRefreshing = false;
let failedQueue = [];
const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        }
        else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};
API.interceptors.request.use((config) => {
    const token = getToken();
    if (token && config.url !== '/courses/public/overview' && config.url !== '/auth/login' && config.url !== '/auth/register') {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
API.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh-token' && !originalRequest._retry) {
        originalRequest._retry = true;
        if (!isRefreshing) {
            isRefreshing = true;
            try {
                const response = await API.post('/auth/refresh-token');
                const { token } = response.data;
                setToken(token);
                API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                processQueue(null, token);
                return API(originalRequest);
            }
            catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                processQueue(refreshError, null);
                removeToken();
                delete API.defaults.headers.common['Authorization'];
                if (typeof window !== 'undefined') {
                    window.location.href = '/login?sessionExpired=true';
                }
                return Promise.reject(refreshError);
            }
            finally {
                isRefreshing = false;
            }
        }
        else {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(token => {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                return API(originalRequest);
            }).catch(err => {
                return Promise.reject(err);
            });
        }
    }
    return Promise.reject(error);
});
export const getPublicCourseOverview = async () => {
    const response = await API.get('/courses/public/overview');
    return response.data;
};
export const getCoursesForAdmin = async () => {
    const response = await API.get('/courses/admin/all');
    return response.data;
};
export const createCourse = async (courseData) => {
    const response = await API.post('/courses', courseData);
    return response.data;
};
export const updateCourse = async (courseId, courseData) => {
    const response = await API.put(`/courses/${courseId}`, courseData);
    return response.data;
};
export const deleteCourse = async (courseId) => {
    const response = await API.delete(`/courses/${courseId}`);
    return response.data;
};
export const getAccessibleContent = async () => {
    const response = await API.get('/courses/content/my-program');
    return response.data;
};
export const getWeeksByCourse = async (courseId) => {
    const response = await API.get(`/weeks/by-course/${courseId}`);
    return response.data;
};
export const createWeek = async (weekData) => {
    const response = await API.post('/weeks', weekData);
    return response.data;
};
export const updateWeek = async (weekId, weekData) => {
    const response = await API.put(`/weeks/${weekId}`, weekData);
    return response.data;
};
export const deleteWeek = async (weekId) => {
    const response = await API.delete(`/weeks/${weekId}`);
    return response.data;
};
export const getMaterialsByWeek = async (weekId) => {
    const response = await API.get(`/materials/by-week/${weekId}`);
    return response.data;
};
export const createMaterial = async (materialData) => {
    const config = materialData instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await API.post('/materials', materialData, config);
    return response.data;
};
export const updateMaterial = async (materialId, materialData) => {
    const config = materialData instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await API.put(`/materials/${materialId}`, materialData, config);
    return response.data;
};
export const deleteMaterial = async (materialId) => {
    const response = await API.delete(`/materials/${materialId}`);
    return response.data;
};
export const getQuizzesByWeek = async (weekId) => {
    const response = await API.get(`/quizzes/by-week/${weekId}`);
    return response.data;
};
export const createQuiz = async (quizData) => {
    const response = await API.post('/quizzes', quizData);
    return response.data;
};
export const updateQuiz = async (quizId, quizData) => {
    const response = await API.put(`/quizzes/${quizId}`, quizData);
    return response.data;
};
export const deleteQuiz = async (quizId) => {
    const response = await API.delete(`/quizzes/${quizId}`);
    return response.data;
};
export const submitQuizAttempt = async (quizId, submissionData) => {
    const config = submissionData instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await API.post(`/quizzes/${quizId}/submit`, submissionData, config);
    return response.data;
};
export const gradeQuizSubmission = async (submissionId, gradeData) => {
    const response = await API.post(`/quizzes/submissions/${submissionId}/grade`, gradeData);
    return response.data;
};
export const getSubmissionsByQuiz = async (quizId) => {
    const response = await API.get(`/quizzes/${quizId}/submissions`);
    return response.data;
};
export const getMySubmissionForQuiz = async (quizId) => {
    const response = await API.get(`/quizzes/${quizId}/my-submission`);
    return response.data;
};
export const createCohort = async (cohortData) => {
    const response = await API.post('/admin/cohorts', cohortData);
    return response.data;
};
export const getAllCohorts = async () => {
    const response = await API.get('/admin/cohorts');
    return response.data;
};
export const enrollUserInCohort = async (cohortId, userId) => {
    const response = await API.post(`/admin/cohorts/${cohortId}/enroll`, { userId });
    return response.data;
};
export const getUserProfile = async () => {
    const response = await API.get('/auth/me');
    return response.data;
};
export const updateUserProfile = async (profileData) => {
    const response = await API.put('/users/profile', profileData);
    return response.data;
};
export const changePassword = async (passwordData) => {
    const response = await API.post('/users/change-password', passwordData);
    return response.data;
};
export const loginUser = async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    if (response.data.token) {
        setToken(response.data.token);
        API.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response.data;
};
export const registerUser = async (userData) => {
    const response = await API.post('/auth/register', userData);
    return response.data;
};
export const logoutUser = async () => {
    try {
        await API.post('/auth/logout');
    }
    catch (error) {
        console.error("Backend logout API call failed, proceeding with client-side clear.", error);
    }
    finally {
        removeToken();
        delete API.defaults.headers.common['Authorization'];
    }
};
export const getAllUsersForAdmin = async () => {
    const response = await API.get('/admin/users');
    return response.data;
};
export const updateUserRoleAdmin = async (userId, role) => {
    const response = await API.put(`/admin/users/${userId}/role`, { role });
    return response.data;
};
export const createUserAdmin = async (userData) => {
    const response = await API.post(`/admin/users`, userData);
    return response.data;
};
export const deleteUserAdmin = async (userId) => {
    const response = await API.delete(`/admin/users/${userId}`);
    return response.data;
};
export { API };
