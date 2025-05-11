// src/services/api.ts
import axios from 'axios';
const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api', // Corrected port to 3000 based on previous files
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
    const publicPaths = [
        '/courses/public/overview',
        '/auth/login',
        '/auth/register',
        '/auth/refresh-token',
        '/auth/reset-password', // Added reset-password as public
    ];
    if (token && config.url && !publicPaths.some(p => config.url.startsWith(p) || config.url.endsWith(p))) { // Added endsWith for more flexibility
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
API.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && originalRequest.url && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh-token' && !originalRequest._retry) {
        originalRequest._retry = true;
        if (!isRefreshing) {
            isRefreshing = true;
            try {
                const response = await API.post('/auth/refresh-token');
                const { token } = response.data;
                setToken(token);
                API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                if (originalRequest.headers) {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                }
                processQueue(null, token);
                return API(originalRequest);
            }
            catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                processQueue(refreshError, null);
                removeToken();
                delete API.defaults.headers.common['Authorization'];
                if (typeof window !== 'undefined') {
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login?sessionExpired=true';
                    }
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
                if (originalRequest.headers) {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                }
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
    await API.delete(`/courses/${courseId}`);
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
    await API.delete(`/weeks/${weekId}`);
};
export async function getWeekWithDetails(weekId) {
    const response = await API.get(`/weeks/${weekId}/details`);
    return response.data;
}
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
    await API.delete(`/materials/${materialId}`);
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
    await API.delete(`/quizzes/${quizId}`);
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
export const getCurrentUser = async () => {
    const response = await API.get('/auth/me');
    return response.data;
};
export const updateUserProfile = async (profileData) => {
    const response = await API.put('/auth/profile', profileData); // Corrected to /auth/profile based on your backend routes
    return response.data;
};
export const changePassword = async (passwordData) => {
    const response = await API.post('/auth/change-password', passwordData); // Corrected to /auth/change-password
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
export const getSectionsByWeek = async (weekId) => {
    const response = await API.get(`/sections/by-week/${weekId}`);
    return response.data;
};
export const createSection = async (sectionData) => {
    const response = await API.post('/sections', sectionData);
    return response.data;
};
export const updateSection = async (sectionId, sectionData) => {
    const response = await API.put(`/sections/${sectionId}`, sectionData);
    return response.data;
};
export const deleteSection = async (sectionId) => {
    await API.delete(`/sections/${sectionId}`);
};
export const addContentToSection = async (sectionId, contentData) => {
    const response = await API.post(`/sections/${sectionId}/content`, contentData);
    return response.data;
};
export const updateContent = async (sectionId, contentId, contentData) => {
    const response = await API.put(`/sections/${sectionId}/content/${contentId}`, contentData);
    return response.data;
};
export const deleteContent = async (sectionId, contentId) => {
    await API.delete(`/sections/${sectionId}/content/${contentId}`);
};
export async function getCourseById(courseId) {
    try {
        const response = await API.get(`/courses/${courseId}`);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return null;
        }
        console.error(`Error fetching course ${courseId}:`, error);
        throw error;
    }
}
export async function getAdminDashboardStats() {
    console.log("API (TS): Fetching admin dashboard stats (SIMULATED)...");
    await new Promise(resolve => setTimeout(resolve, 300));
    const simulatedData = [
        { id: 'totalStudents', title: "Total Students", value: "150", iconName: "Users", change: "+10 since last week" },
        { id: 'activeCourses', title: "Active Courses", value: "5", iconName: "BookOpen", change: "1 new" },
        { id: 'completionRate', title: "Completion Rate", value: "75%", iconName: "CheckCircle2", change: "-2%" },
        { id: 'avgGrade', title: "Avg. Grade", value: "B+", iconName: "FileText", change: "Stable" },
    ];
    return simulatedData;
}
export async function getAdminRecentStudents(limit = 4) {
    console.log(`API (TS): Fetching ${limit} recent students (SIMULATED)...`);
    await new Promise(resolve => setTimeout(resolve, 400));
    const simulatedData = [
        { id: 's1', name: "Alice Wonderland", courseName: "Foundations", progress: 70 },
        { id: 's2', name: "Bob The Builder", courseName: "The Bible", progress: 45 },
        { id: 's3', name: "Charlie Brown", courseName: "Foundations", progress: 95 },
        { id: 's4', name: "Dana Scully", courseName: "Hermeneutics", progress: 60 },
    ];
    return simulatedData.slice(0, limit);
}
export async function getAdminDashboardCourses(limit = 4) {
    console.log(`API (TS): Fetching ${limit} dashboard courses (SIMULATED)...`);
    await new Promise(resolve => setTimeout(resolve, 500));
    const simulatedData = [
        { id: 'c1', courseId: 'c1', title: "Foundations of Faith (Live)", studentCount: 50, status: "active", startDate: "2024-01-15T00:00:00Z", endDate: "2024-03-15T00:00:00Z" },
        { id: 'c2', courseId: 'c2', title: "Old Testament Survey (Live)", studentCount: 35, status: "upcoming", startDate: "2024-03-20T00:00:00Z", endDate: "2024-05-20T00:00:00Z" },
        { id: 'c3', courseId: 'c3', title: "Apologetics 101 (Completed)", studentCount: 25, status: "completed", startDate: "2023-10-01T00:00:00Z", endDate: "2023-12-01T00:00:00Z" },
        { id: 'c4', courseId: 'c4', title: "Systematic Theology I", studentCount: 40, status: "active", startDate: "2024-02-01T00:00:00Z", endDate: "2024-04-01T00:00:00Z" },
    ];
    return simulatedData.slice(0, limit);
}
export async function getAdminDashboardQuizzes(limit = 4) {
    console.log(`API (TS): Fetching ${limit} dashboard quizzes (SIMULATED)...`);
    await new Promise(resolve => setTimeout(resolve, 600));
    const simulatedData = [
        { id: 'q1', courseId: 'c1', title: "Week 1 - Foundations Quiz", courseName: "Foundations of Faith (Live)", submittedCount: 40, totalEligible: 50, dueDate: "2024-01-22T00:00:00Z" },
        { id: 'q2', courseId: 'c1', title: "Week 2 - Doctrine Basics", courseName: "Foundations of Faith (Live)", submittedCount: 10, totalEligible: 50, dueDate: "2024-01-29T00:00:00Z" },
        { id: 'q3', courseId: 'c2', title: "Genesis Chapters 1-11", courseName: "Old Testament Survey (Live)", submittedCount: 0, totalEligible: 35, dueDate: "2024-03-27T00:00:00Z" },
        { id: 'q4', courseId: 'c4', title: "Theology Proper - Midterm", courseName: "Systematic Theology I", submittedCount: 30, totalEligible: 40, dueDate: "2024-03-01T00:00:00Z" },
    ];
    return simulatedData.slice(0, limit);
}
export async function getAdminAllStudents(params = {}) {
    const query = new URLSearchParams(params).toString();
    console.log(`API (TS): Fetching all students (SIMULATED) with filters: ${query}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    let studentsDb = [
        { id: 's101', name: "Alice Wonderland", email: "alice@example.com", courseName: "Foundations", progress: 70, status: "active" },
        { id: 's102', name: "Bob The Builder", email: "bob@example.com", courseName: "The Bible", progress: 45, status: "at risk" },
        { id: 's103', name: "Charlie Brown", email: "charlie@example.com", courseName: "Foundations", progress: 95, status: "completed" },
        { id: 's104', name: "Diana Prince", email: "diana@example.com", courseName: "Apologetics", progress: 10, status: "inactive" },
        { id: 's105', name: "Edward Scissorhands", email: "edward@example.com", courseName: "The Bible", progress: 60, status: "active" },
        { id: 's106', name: "Fiona Gallagher", email: "fiona@example.com", courseName: "Systematic Theology I", progress: 88, status: "active" },
        { id: 's107', name: "George Costanza", email: "george@example.com", courseName: "Foundations", progress: 22, status: "at risk" },
        { id: 's108', name: "Harry Potter", email: "harry@example.com", courseName: "Old Testament Survey", progress: 75, status: "active" },
    ];
    if (params.search) {
        const searchTerm = params.search.toLowerCase();
        studentsDb = studentsDb.filter(s => s.name.toLowerCase().includes(searchTerm) || s.email.toLowerCase().includes(searchTerm));
    }
    if (params.status && params.status !== 'all') {
        studentsDb = studentsDb.filter(s => s.status === params.status);
    }
    return studentsDb;
}
export async function getAdminAllCourses(params = {}) {
    const query = new URLSearchParams(params).toString();
    console.log(`API (TS): Fetching all courses (SIMULATED) with filters: ${query}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    let coursesDb = [
        { id: 'c1', courseId: 'c1', title: "Foundations of Faith (Live)", studentCount: 50, status: "active", startDate: "2024-01-15T00:00:00Z", endDate: "2024-03-15T00:00:00Z" },
        { id: 'c2', courseId: 'c2', title: "Old Testament Survey (Live)", studentCount: 35, status: "upcoming", startDate: "2024-03-20T00:00:00Z", endDate: "2024-05-20T00:00:00Z" },
        { id: 'c3', courseId: 'c3', title: "Apologetics 101 (Completed)", studentCount: 25, status: "completed", startDate: "2023-10-01T00:00:00Z", endDate: "2023-12-01T00:00:00Z" },
        { id: 'c4', courseId: 'c4', title: "Systematic Theology I", studentCount: 40, status: "active", startDate: "2024-02-01T00:00:00Z", endDate: "2024-04-01T00:00:00Z" },
        { id: 'c5', courseId: 'c5', title: "New Testament Gospels (Archived)", studentCount: 0, status: "archived", startDate: "2023-05-01T00:00:00Z", endDate: "2023-07-01T00:00:00Z" },
        { id: 'c6', courseId: 'c6', title: "Church History Overview", studentCount: 15, status: "upcoming", startDate: "2024-06-01T00:00:00Z", endDate: "2024-08-01T00:00:00Z" },
    ];
    if (params.search) {
        const searchTerm = params.search.toLowerCase();
        coursesDb = coursesDb.filter(c => c.title.toLowerCase().includes(searchTerm));
    }
    if (params.status && params.status !== 'all') {
        coursesDb = coursesDb.filter(c => c.status === params.status);
    }
    return coursesDb;
}
export async function getAdminAllQuizzes(params = {}) {
    const query = new URLSearchParams(params).toString();
    console.log(`API (TS): Fetching all quizzes (SIMULATED) with filters: ${query}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    let quizzesDb = [
        { id: 'q1', courseId: 'c1', title: "Week 1 - Foundations Quiz", courseName: "Foundations of Faith (Live)", submittedCount: 40, totalEligible: 50, dueDate: "2024-01-22T00:00:00Z" },
        { id: 'q2', courseId: 'c1', title: "Week 2 - Doctrine Basics", courseName: "Foundations of Faith (Live)", submittedCount: 10, totalEligible: 50, dueDate: "2024-01-29T00:00:00Z" },
        { id: 'q3', courseId: 'c2', title: "Genesis Chapters 1-11", courseName: "Old Testament Survey (Live)", submittedCount: 0, totalEligible: 35, dueDate: "2024-03-27T00:00:00Z" },
        { id: 'q4', courseId: 'c3', title: "Arguments for God's Existence", courseName: "Apologetics 101 (Completed)", submittedCount: 20, totalEligible: 25, dueDate: "2023-10-15T00:00:00Z" },
        { id: 'q5', courseId: 'c4', title: "Theology Proper - Midterm", courseName: "Systematic Theology I", submittedCount: 30, totalEligible: 40, dueDate: "2024-03-01T00:00:00Z" },
        { id: 'q6', courseId: 'c4', title: "Christology - Final Exam", courseName: "Systematic Theology I", submittedCount: 0, totalEligible: 40, dueDate: "2024-03-28T00:00:00Z" },
    ];
    if (params.search) {
        const searchTerm = params.search.toLowerCase();
        quizzesDb = quizzesDb.filter(q => q.title.toLowerCase().includes(searchTerm));
    }
    if (params.courseId && params.courseId !== 'all') {
        quizzesDb = quizzesDb.filter(q => q.courseId === params.courseId);
    }
    return quizzesDb;
}
export { API };
