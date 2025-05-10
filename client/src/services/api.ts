// src/services/api.ts
import axios, { type AxiosResponse } from 'axios';

// Types

// --- START: Detailed types for Rich Content Blocks ---
export interface QuizQuestionOption {
    id: string;
    text: string;
    isCorrect?: boolean;
}

export interface QuizQuestion {
    id: string;
    type: 'multiple_choice' | 'checkbox' | 'short_answer' | 'paragraph';
    question: string;
    required: boolean;
    description?: string; // Added description to QuizQuestion
    options?: QuizQuestionOption[];
    correctAnswer?: string | string[];
}

export interface VideoBlockContent { // Specific to video blocks in rich content
    id: string; // Can be same as RichContentItemBlock.id or unique
    title: string;
    description?: string;
    videoFile?: File; // Allow File or undefined
    videoUrl?: string;      // Allow URL string
    thumbnail?: File;// Allow File or null
    thumbnailUrl?: string;  // Allow URL string
    duration?: number;
    isRequired: boolean; // Is this specific video block required?
    drmEnabled: boolean;
    accessControl: {
        allowDownload: boolean;
        allowSharing: boolean;
        expirationDate?: Date;
    };
}

export interface QuizBlockContent { // Specific to quiz blocks in rich content
    id: string; // Can be same as RichContentItemBlock.id or unique
    title: string;
    description?: string;
    questions: QuizQuestion[];
    settings: {
        shuffleQuestions: boolean;
        timeLimit?: number;
        passingScore?: number;
        showResults: boolean;
        allowRetake: boolean;
        maxAttempts?: number;
        showCorrectAnswers: boolean;
        showPoints: boolean;
        requireLogin: boolean;
        collectEmail: boolean;
        allowProgressSaving: boolean;
    };
}

// This is the type for individual blocks WITHIN a ContentItem's rich text editor
export interface RichContentItemBlock { // Renamed from RichContentItem for clarity
    id: string;
    type: 'text' | 'video' | 'quiz'; // Types of blocks
    order?: number; // Order of this block within richContent array

    // Content specific to type
    content?: string;               // For type 'text' (HTML content)
    videoContent?: VideoBlockContent; // For type 'video'
    quizContent?: QuizBlockContent;   // For type 'quiz'
}
// --- END: Detailed types for Rich Content Blocks ---


export interface AssignmentDetails {
    id: string;
    weekId: string;
    title: string;
    description?: string;
    instructions?: string;
    type?: string;
    points?: number;
    dueDateOffsetDays?: number | null;
    order?: number;
    createdBy?: string;
    createdAt?: any;
    updatedAt?: any;
    weekNumber?: number;
    courseTitle?: string;
    courseId?: string;
}

export interface Section {
    id: string;
    weekId: string;
    title: string;
    description?: string;
    order: number;
    content: ContentItem[]; // Uses the ContentItem defined below
    createdAt?: Date;
    updatedAt?: Date;
}

export interface DiscussionTopic {
    id: string;
    courseId: string;
    weekId?: string;
    sectionId?: string;
    title: string;
    description?: string;
    content?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ContentItem {
    id?: string;
    type: 'text' | 'video' | 'quiz_link';
    title: string;
    isRequired: boolean;
    content?: string;
    url?: string;
    richContent: RichContentItemBlock[];
    order?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

// REMOVE these as they are now replaced by more specific block content types
// export interface RichContentItem { ... } // This was too generic and its Video/QuizContent were empty
// export interface VideoContent { ... } // Replaced by VideoBlockContent
// export interface QuizContent { ... }  // Replaced by QuizBlockContent


export interface SectionData { // For creating/updating sections
    weekId: string;
    title: string;
    description?: string;
    order: number;
    // content?: ContentItem[]; // Usually content is managed separately
}

export interface ContentData { // For creating/updating content items (payload to API)
    type: ContentItem['type']; // Use the main ContentItem type
    title: string;
    isRequired: boolean; // Should match ContentItem.isRequired
    content?: string;
    url?: string;
    richContent?: RichContentItemBlock[]; // Payload should match
    order: number;
    // textContent?: string; // If needed for payload
}

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ... (rest of your api.ts file: getToken, setToken, interceptors, API functions) ...
// Ensure your API functions (createContent, updateContent) use the correct ContentData for payload
// and expect ContentItem as response.

export const getToken = (): string | null => {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            return localStorage.getItem('token');
        }
        return null;
    } catch (e) {
        console.error("Could not access localStorage:", e);
        return null;
    }
};

export const setToken = (token: string): void => {
     try {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('token', token);
        }
    } catch (e) {
        console.error("Could not access localStorage:", e);
    }
};

export const removeToken = (): void => {
     try {
         if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem('token');
         }
    } catch (e) {
        console.error("Could not access localStorage:", e);
    }
};

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null): void => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

API.interceptors.request.use(
  (config) => {
    const token = getToken();
    const publicPaths = [
        '/courses/public/overview',
        '/auth/login',
        '/auth/register',
        '/auth/refresh-token',
    ];
    if (token && config.url && !publicPaths.some(p => config.url!.startsWith(p))) { // Check if URL starts with any public path
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: any) => {
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
             if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
             }
             processQueue(null, token);
             return API(originalRequest);
         } catch (refreshError: any) {
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
         } finally {
             isRefreshing = false;
         }
      } else {
         return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
         }).then(token => {
            if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${token as string}`;
            }
            return API(originalRequest);
         }).catch(err => {
            return Promise.reject(err); 
         });
      }
    }
    return Promise.reject(error);
  }
);

// --- Existing API Functions ---
export const getPublicCourseOverview = async () => {
  const response = await API.get('/courses/public/overview');
  return response.data;
};
// Define Course type if not already defined globally or import it
export interface Course { id: string; title: string; description?: string; monthOrder: number; instructor?: string; instructorName?: string; ects?: number; /* ... other properties ... */ }

export const getCoursesForAdmin = async (): Promise<Course[]> => { // Add return type
  const response = await API.get('/courses/admin/all');
  return response.data;
};
export const createCourse = async (courseData: Omit<Course, 'id'>): Promise<Course> => { 
  const response = await API.post('/courses', courseData);
  return response.data;
};
export const updateCourse = async (courseId: string, courseData: Partial<Omit<Course, 'id'>>): Promise<Course> => { 
  const response = await API.put(`/courses/${courseId}`, courseData);
  return response.data;
};
export const deleteCourse = async (courseId: string): Promise<void> => {
  await API.delete(`/courses/${courseId}`);
};
export const getAccessibleContent = async () => { 
   const response = await API.get('/courses/content/my-program');
   return response.data;
};

// Define Week type
export interface Week {
    id: string;
    courseId: string;
    weekNumber: number;
    title: string;
    description?: string;
    sections?: Section[];
}

export const getWeeksByCourse = async (courseId: string): Promise<Week[]> => {
    const response = await API.get(`/weeks/by-course/${courseId}`);
    return response.data;
};
export const createWeek = async (weekData: Omit<Week, 'id'>): Promise<Week> => { 
    const response = await API.post('/weeks', weekData);
    return response.data;
};
export const updateWeek = async (weekId: string, weekData: Partial<Omit<Week, 'id'>>): Promise<Week> => { 
    const response = await API.put(`/weeks/${weekId}`, weekData);
    return response.data;
};
export const deleteWeek = async (weekId: string): Promise<void> => {
    await API.delete(`/weeks/${weekId}`);
};

export async function getWeekWithDetails(weekId: string): Promise<Week> {
    try {
        const response = await API.get(`/weeks/${weekId}/details`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Define Material type
export interface Material { id: string; weekId: string; title: string; type: 'video' | 'reading' | 'resource'; contentUrl?: string; details?: string; /* ... */ }

export const getMaterialsByWeek = async (weekId: string): Promise<Material[]> => {
    const response = await API.get(`/materials/by-week/${weekId}`);
    return response.data;
};
export const createMaterial = async (materialData: FormData | Omit<Material, 'id'>): Promise<Material> => { 
    const config = materialData instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await API.post('/materials', materialData, config );
    return response.data;
};
export const updateMaterial = async (materialId: string, materialData: FormData | Partial<Omit<Material, 'id'>>): Promise<Material> => { 
    const config = materialData instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await API.put(`/materials/${materialId}`, materialData, config);
    return response.data;
};
export const deleteMaterial = async (materialId: string): Promise<void> => {
    await API.delete(`/materials/${materialId}`);
};

// Define Quiz type
export interface Quiz { id: string; weekId: string; title: string; description?: string; instructions?: string; quizUrl?: string; points?: number; dueDateOffsetDays?: number | null; /* ... */ }

export const getQuizzesByWeek = async (weekId: string): Promise<Quiz[]> => {
    const response = await API.get(`/quizzes/by-week/${weekId}`);
    return response.data;
};
export const createQuiz = async (quizData: Omit<Quiz, 'id'>): Promise<Quiz> => { 
    const response = await API.post('/quizzes', quizData);
    return response.data;
};
export const updateQuiz = async (quizId: string, quizData: Partial<Omit<Quiz, 'id'>>): Promise<Quiz> => { 
    const response = await API.put(`/quizzes/${quizId}`, quizData);
    return response.data;
};
export const deleteQuiz = async (quizId: string): Promise<void> => {
    await API.delete(`/quizzes/${quizId}`);
};
export const submitQuizAttempt = async (quizId: string, submissionData: any) => { 
    const config = submissionData instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await API.post(`/quizzes/${quizId}/submit`, submissionData, config);
    return response.data;
};
export const gradeQuizSubmission = async (submissionId: string, gradeData: any) => { 
    const response = await API.post(`/quizzes/submissions/${submissionId}/grade`, gradeData);
    return response.data;
};
export const getSubmissionsByQuiz = async (quizId: string) => {
    const response = await API.get(`/quizzes/${quizId}/submissions`);
    return response.data;
};
export const getMySubmissionForQuiz = async (quizId: string) => {
    const response = await API.get(`/quizzes/${quizId}/my-submission`);
    return response.data;
};

// --- Cohorts ---
export const createCohort = async (cohortData: any) => { 
    const response = await API.post('/admin/cohorts', cohortData);
    return response.data;
};
export const getAllCohorts = async () => {
    const response = await API.get('/admin/cohorts');
    return response.data;
};
export const enrollUserInCohort = async (cohortId: string, userId: string) => {
    const response = await API.post(`/admin/cohorts/${cohortId}/enroll`, { userId });
    return response.data;
};

// --- User Profile & Auth ---
export const getUserProfile = async () => {
    const response = await API.get('/auth/me');
    return response.data;
};
export const updateUserProfile = async (profileData: any) => { 
    const response = await API.put('/users/profile', profileData);
    return response.data;
};
export const changePassword = async (passwordData: any) => { 
    const response = await API.post('/users/change-password', passwordData);
    return response.data;
};
export const loginUser = async (credentials: any) => { 
    const response = await API.post('/auth/login', credentials);
    if (response.data.token) {
        setToken(response.data.token);
        API.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response.data;
}
export const registerUser = async (userData: any) => { 
    const response = await API.post('/auth/register', userData);
    return response.data;
}
export const logoutUser = async () => {
    try {
        await API.post('/auth/logout');
    } catch (error) {
        console.error("Backend logout API call failed, proceeding with client-side clear.", error);
    } finally {
         removeToken();
         delete API.defaults.headers.common['Authorization'];
    }
}

// --- Admin User Management ---
export const getAllUsersForAdmin = async () => {
    const response = await API.get('/admin/users');
    return response.data;
}
export const updateUserRoleAdmin = async (userId: string, role: string) => {
    const response = await API.put(`/admin/users/${userId}/role`, { role });
    return response.data;
}
export const createUserAdmin = async (userData: any) => { 
    const response = await API.post(`/admin/users`, userData);
    return response.data;
}
export const deleteUserAdmin = async (userId: string) => {
    const response = await API.delete(`/admin/users/${userId}`);
    return response.data;
}

// --- NEW FUNCTIONS FOR SECTIONS AND CONTENT (as per CourseManagementPage.tsx errors) ---
export const getSectionsByWeek = async (weekId: string): Promise<Section[]> => {
    const response = await API.get(`/sections/by-week/${weekId}`);
    return response.data;
};

export const createSection = async (sectionData: SectionData): Promise<Section> => {
    const response = await API.post('/sections', sectionData);
    return response.data;
};

export const updateSection = async (sectionId: string, sectionData: Partial<SectionData>): Promise<Section> => {
    const response = await API.put(`/sections/${sectionId}`, sectionData);
    return response.data;
};

export const deleteSection = async (sectionId: string): Promise<void> => {
    await API.delete(`/sections/${sectionId}`);
};

export const addContentToSection = async (sectionId: string, contentData: ContentData): Promise<ContentItem> => {
    const response = await API.post(`/sections/${sectionId}/content`, contentData);
    return response.data;
};

export const updateContent = async (sectionId: string, contentId: string, contentData: Partial<ContentData>): Promise<ContentItem> => {
    const response = await API.put(`/sections/${sectionId}/content/${contentId}`, contentData);
    return response.data;
};

export const deleteContent = async (sectionId: string, contentId: string): Promise<void> => {
    await API.delete(`/sections/${sectionId}/content/${contentId}`);
};

export async function getCourseById(courseId: string): Promise<Course | null> {
  try {
    const response = await API.get(`/courses/${courseId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export { API };