import axios, { type AxiosResponse, AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';

export interface QuizQuestionOption { id: string; text: string; isCorrect?: boolean; }
export interface QuizQuestion { id: string; type: 'multiple_choice' | 'checkbox' | 'short_answer' | 'paragraph'; question: string; required: boolean; description?: string; options?: QuizQuestionOption[]; correctAnswer?: string | string[]; }
export interface VideoBlockContent { id: string; title: string; description?: string; videoFile?: File; videoUrl?: string; thumbnail?: File; thumbnailUrl?: string; duration?: number; isRequired: boolean; drmEnabled: boolean; accessControl: { allowDownload: boolean; allowSharing: boolean; expirationDate?: Date; }; }
export interface QuizBlockContent {
  id: string;
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
    showPoints?: boolean;
    requireLogin?: boolean;
    collectEmail?: boolean;
    allowProgressSaving?: boolean;
  };
  databaseQuizId: string;

}
export interface RichContentItemBlock {
  id: string;
  type: 'text' | 'video' | 'quiz' | 'document'; // <<< 1. ADD 'document' TO THIS UNION
  order?: number;
  content?: string;
  videoContent?: VideoBlockContent;
  quizContent?: QuizBlockContent;
  documentContent?: ApiDocumentBlockContentForSave; // <<< 2. ADD THIS OPTIONAL PROPERTY
}
export interface AssignmentDetails { id: string; weekId: string; title: string; description?: string; instructions?: string; type?: string; points?: number; dueDateOffsetDays?: number | null; order?: number; createdBy?: string; createdAt?: any; updatedAt?: any; weekNumber?: number; courseTitle?: string; courseId?: string; }
export interface Section { id: string; weekId: string; title: string; description?: string; order: number; content: ContentItem[]; createdAt?: Date; updatedAt?: Date; }
export interface DiscussionTopic { id: string; courseId: string; weekId?: string; sectionId?: string; title: string; description?: string; content?: string; createdAt?: Date; updatedAt?: Date; }
export interface ContentItem { 
  id?: string;
  type: 'text' | 'video' | 'quiz_link' | 'document'; // <<< 3. ADD 'document' TO THIS UNION
  title: string;
  isRequired: boolean;
  content?: string;
  url?: string;
  richContent: RichContentItemBlock[]; // This will now use the updated RichContentItemBlock
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CreateMaterialResponse {
    message: string;
    material: Material; // Using your existing Material type
}

export interface SectionData { weekId: string; title: string; description?: string; order: number; }
export interface ContentData { type: ContentItem['type']; title: string; isRequired: boolean; content?: string; url?: string; richContent?: RichContentItemBlock[]; order: number; }
export interface Course { id: string; title: string; description?: string; monthOrder: number; instructor?: string; instructorName?: string; ects?: number; settings?: { defaultPassingScore?: number; }; }
export interface Week { id: string; courseId: string; weekNumber: number; title: string; description?: string; sections?: Section[]; }
export interface Material { id: string; weekId: string; title: string; type: 'video' | 'reading' | 'resource' | 'document_asset' | 'video_asset' | 'image_asset'; contentUrl?: string; details?: string; storagePath?: string; /* Add storagePath if you save it */ } // Added asset types to Material type if createMaterial is generic
export interface Quiz { id: string; weekId: string; title: string; description?: string; instructions?: string; quizUrl?: string; points?: number; dueDateOffsetDays?: number | null; isGraded?: boolean; passingScore?: number; }
export interface DashboardStat { id: string | number; title: string; value: string | number; iconName: string; change?: string; }
export interface StudentSummary { id: string; name: string; courseName: string; progress: number; }
export interface AdminCourseSummary { id: string; title: string; studentCount: number; status: 'active' | 'upcoming' | 'completed' | 'archived' | string; startDate?: string; endDate?: string; courseId?: string; }
export interface AdminQuizSummary { id: string; title: string; courseName: string; submittedCount: number; totalEligible: number; dueDate?: string; courseId?: string; }
export interface AdminStudent extends StudentSummary { email: string; status: 'active' | 'at risk' | 'inactive' | 'completed' | string; }
export interface AdminCourse extends AdminCourseSummary {}
export interface AdminFullQuiz extends AdminQuizSummary {}
export interface UserProgress { [sectionId: string]: boolean; }

// MODIFIED GradedItem interface
export interface GradedItem {
  id: string;
  title: string;
  status: string;
  score: number | null;
  isGraded: boolean;
  passingScore?: number;
  type?: string; // Make type optional since it's not always present
}

export interface WeekGradeSummary {
  weekId: string;
  weekNumber: number;
  weekTitle: string;
  items: GradedItem[];
  overallWeekProgress: number;
}

export interface QuizScore {
  quizId: string;
  title: string;
  score: number;
  passed: boolean;
  submittedAt: string | null; // Allow null for submittedAt
}

export interface MonthlyProgress {
  totalItems: number;
  completedItems: number;
  overallProgress: number;
  quizScores: QuizScore[];
}

export interface CourseGradesResponse {
  weeklyGrades: WeekGradeSummary[];
  monthlyProgress: MonthlyProgress;
}

export interface ProcessedCourseOverviewItem {
    id: string;
    title: string;
    description?: string;
    monthOrder: number;
    status: 'locked' | 'active' | 'completed';
    progress?: number;
}

export interface CourseAccessState {
    courses: ProcessedCourseOverviewItem[];
    enrollmentMessage: string | null;
}

export interface UserAnswers {
    [questionId: string]: string | string[];
}

export interface UserQuizSubmission {
  id: string;
  quizId: string;
  userId: string;
  answers: UserAnswers;
  score: number | null;
  status: string;
  submittedAt: any;
  gradedAt?: any | null;
  feedback?: string | null;
  userName?: string;
  weekId?: string;
  courseId?: string;
}

interface ApiError {
  message: string;
}

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

console.log("api.ts: Actual Axios baseURL after create:", API.defaults.baseURL);

export interface ApiDocumentBlockContentForSave { // This definition is good
  id: string;
  title: string;
  description?: string;
  documentUrl: string;
  originalFileName?: string;
  fileSize?: number;
  fileType?: string;
}

export const getToken = (): string | null => {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            return localStorage.getItem('token');
        }
        return null;
    } catch (e: any) {
        console.error("Could not access localStorage:", e);
        return null;
    }
};

export const setToken = (token: string): void => {
     try {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('token', token);
        }
    } catch (e: any) {
        console.error("Could not access localStorage:", e);
    }
};

export const removeToken = (): void => {
     try {
         if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem('token');
         }
    } catch (e: any) {
        console.error("Could not access localStorage:", e);
    }
};

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null): void => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else if (token) {
            prom.resolve(token);
        } else {
             prom.reject(new Error("Token refresh resulted in null token without error."));
        }
    });
    failedQueue = [];
};

API.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    const publicPaths = [
        '/courses/public/overview',
        '/auth/login',
        '/auth/register',
        '/auth/refresh-token',
        '/auth/reset-password',
    ];

    if (token && config.url && !publicPaths.some(p => config.url!.includes(p))) {
        config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

interface AxiosErrorWithRetry<T = any> extends AxiosError<T> {
    config: InternalAxiosRequestConfig<T> & { _retry?: boolean };
}

API.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosErrorWithRetry) => {
    const originalRequest = error.config;

    if (!originalRequest) {
        return Promise.reject(error);
    }

    if (error.response?.status === 401 && originalRequest.url && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh-token' && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
         isRefreshing = true;
         try {
             const response = await API.post('/auth/refresh-token');
             const { token } = response.data;

             if (!token) {
                 throw new Error("Refresh endpoint did not return a token.");
             }

             setToken(token);
             API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
             originalRequest.headers.set('Authorization', `Bearer ${token}`);

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
         return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
         }).then(token => {
            originalRequest.headers.set('Authorization', `Bearer ${token}`);
            return API(originalRequest);
         }).catch(err => {
            return Promise.reject(err);
         });
      }
    }
    return Promise.reject(error);
  }
);

const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || error.message || 'An Axios error occurred';
    } else if (error instanceof Error) {
        return error.message;
    } else {
        return 'An unknown error occurred';
    }
};

export const getCourseAccessState = async (): Promise<CourseAccessState> => {
  const response = await API.get<CourseAccessState>('/users/state');
  return response.data;
};

export const getPublicCourseOverview = async (): Promise<ProcessedCourseOverviewItem[]> => {
  const response = await API.get('/courses/public/overview');
  return response.data;
};

export const getCoursesForAdmin = async (): Promise<Course[]> => {
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

export interface AccessibleContentWeek {
  id: string;
  weekNumber: number;
  absoluteWeekNumber?: number;
  title: string;
  description?: string;
  isCompleted?: boolean;
}
export interface AccessibleContentCourse {
  id: string;
  title: string;
  monthOrder: number;
  weeks: AccessibleContentWeek[];
  progress?: number;
  description?: string;
  instructorName?: string;
}
export const getAccessibleContent = async (): Promise<AccessibleContentCourse[]> => {
   const response = await API.get('/courses/content/my-program');
   const courses = response.data;
   
   // Fetch progress for each course
   const coursesWithProgress = await Promise.all(
     courses.map(async (course: AccessibleContentCourse) => {
       try {
         const gradesResponse = await API.get(`/courses/${course.id}/grades`);
         const progress = gradesResponse.data.monthlyProgress;
         return {
           ...course,
           progress: progress ? progress.overallProgress : 0
         };
       } catch (error) {
         console.error(`Error fetching progress for course ${course.id}:`, error);
         return {
           ...course,
           progress: 0
         };
       }
     })
   );
   
   return coursesWithProgress;
};

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
    const response = await API.get(`/weeks/${weekId}/details`);
    return response.data;
}

export const getMaterialsByWeek = async (weekId: string): Promise<Material[]> => {
    const response = await API.get(`/materials/by-week/${weekId}`);
    return response.data;
};
export const createMaterial = async (
    materialData: FormData | Omit<Material, 'id' | 'contentUrl' | 'storagePath' | 'weekId' | 'title' | 'type'> & { weekId: string; title: string; type: string; contentUrl?:string; storagePath?:string; }
): Promise<Material> => { // The function still promises to return a Material object
    const config = materialData instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    try {
        const response = await API.post<CreateMaterialResponse>('/materials/', materialData, config );
        // Log for debugging what the backend actually sent
        console.log("API Service: createMaterial raw response.data:", response.data);
        
        if (response.data && response.data.material) {
            return response.data.material; // <<< ====== CORRECTED: Return the nested material object ======
        } else {
            // This case should ideally not happen if backend is consistent
            console.error("API Service: createMaterial response did not contain a 'material' object:", response.data);
            throw new Error("Failed to create material: Invalid response structure from server.");
        }
    } catch (error) {
        console.error("API Service: Error in createMaterial API call:", getErrorMessage(error));
        throw error; // Re-throw the original error or a processed one
    }
};
export const updateMaterial = async (materialId: string, materialData: FormData | Partial<Omit<Material, 'id'>>): Promise<Material> => {
    const config = materialData instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await API.put(`/materials/${materialId}`, materialData, config);
    return response.data;
};
export const deleteMaterial = async (materialId: string): Promise<void> => {
    await API.delete(`/materials/${materialId}`);
};

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
export const submitQuizAttempt = async (quizId: string, submissionData: { answers: UserAnswers; weekId?: string; courseId?: string; }): Promise<{ id: string; score: number | null; status: string; }> => {
    const response = await API.post(`/quizzes/${quizId}/submit`, submissionData);
    return response.data;
};
export const gradeQuizSubmission = async (submissionId: string, gradeData: { grade: number; feedback?: string; }): Promise<UserQuizSubmission> => {
    const response = await API.post(`/quizzes/submissions/${submissionId}/grade`, gradeData);
    return response.data;
};
export const getSubmissionsByQuiz = async (quizId: string): Promise<UserQuizSubmission[]> => {
    const response = await API.get(`/quizzes/${quizId}/submissions`);
    return response.data;
};

export const getMySubmissionForQuiz = async (quizId: string): Promise<UserQuizSubmission | null> => {
    try {
        const response = await API.get(`/quizzes/${quizId}/my-submission`);
        return response.data || null;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return null;
        }
        console.error(`Error in getMySubmissionForQuiz for quizId ${quizId}:`, getErrorMessage(error));
        throw error;
    }
};

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

export const getCurrentUser = async () => {
    const response = await API.get('/auth/me');
    return response.data;
};
export const updateUserProfile = async (profileData: any) => {
    const response = await API.put('/auth/profile', profileData);
    return response.data;
};
export const changePassword = async (passwordData: any) => {
    const response = await API.post('/auth/change-password', passwordData);
    return response.data;
};
export const loginUser = async (credentials: { idToken: string }) => {
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
export const logoutUser = async (): Promise<void> => {
    try {
        await API.post('/auth/logout');
    } catch (error: unknown) {
        console.error("Backend logout API call failed, proceeding with client-side clear.", getErrorMessage(error));
    } finally {
         removeToken();
         delete API.defaults.headers.common['Authorization'];
    }
}

export const getAllUsersForAdmin = async () => {
    try {
        const response = await API.get('/admin/users');
        return response.data;
    } catch (error: unknown) {
        console.error('API Error in getAllUsersForAdmin:', getErrorMessage(error));
        throw error;
    }
}

export const updateUserRoleAdmin = async (userId: string, role: string) => {
    const response = await API.put(`/admin/users/${userId}/role`, { role });
    return response.data;
}

export const createUserAdmin = async (userData: any) => {
    try {
        const response = await API.post('/admin/users', userData);
        return response.data;
    } catch (error: unknown) {
        console.error('API Error in createUserAdmin:', getErrorMessage(error));
        throw error;
    }
};

export const deleteUserAdmin = async (userId: string) => {
    try {
        const response = await API.delete(`/admin/users/${userId}`);
        return response.data;
    } catch (error: unknown) {
        console.error('API Error in deleteUserAdmin:', getErrorMessage(error));
        throw error;
    }
}

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
    const response = await API.get<Course>(`/courses/${courseId}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    console.error(`Error fetching course ${courseId}:`, getErrorMessage(error));
    throw error;
  }
}

export async function getAdminDashboardStats(): Promise<DashboardStat[]> {
    try {
        const response = await API.get("/admin/stats");
        const stats = response.data || {};
        
        // Ensure we have default values for all stats
        const userStats = stats.users || { students: 0, instructors: 0, admins: 0 };
        const programStats = stats.program || { totalCourses: 0, activeCourses: 0, currentCohort: null };
        const enrollmentStats = stats.enrollments || { activeEnrollments: 0 };

        // Get cohort name for display
        const cohortName = programStats.currentCohort 
            ? `${programStats.currentCohort.isJanuaryCohort ? 'January' : 'July'} ${new Date(programStats.currentCohort.startDate).getFullYear()}`
            : 'Current';
        
        return [
            { 
                id: 'totalStudents', 
                title: "Total Students", 
                value: (userStats.students || 0).toString(), 
                iconName: "Users", 
                change: `${enrollmentStats.activeEnrollments || 0} active in ${cohortName} cohort` 
            },
            { 
                id: 'activeCourses', 
                title: "Active Courses", 
                value: (programStats.activeCourses || 0).toString(), 
                iconName: "BookOpen", 
                change: `${programStats.totalCourses || 0} total for ${cohortName} cohort` 
            },
            { 
                id: 'completionRate', 
                title: "Completion Rate", 
                value: "75%", 
                iconName: "CheckCircle2", 
                change: "-2%" 
            },
            { 
                id: 'avgGrade', 
                title: "Avg. Grade", 
                value: "B+", 
                iconName: "FileText", 
                change: "Stable" 
            },
        ];
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        // Return default values in case of error
        return [
            { 
                id: 'totalStudents', 
                title: "Total Students", 
                value: "0", 
                iconName: "Users", 
                change: "0 active in current cohort" 
            },
            { 
                id: 'activeCourses', 
                title: "Active Courses", 
                value: "0", 
                iconName: "BookOpen", 
                change: "0 total for current cohort" 
            },
            { 
                id: 'completionRate', 
                title: "Completion Rate", 
                value: "75%", 
                iconName: "CheckCircle2", 
                change: "-2%" 
            },
            { 
                id: 'avgGrade', 
                title: "Avg. Grade", 
                value: "B+", 
                iconName: "FileText", 
                change: "Stable" 
            },
        ];
    }
}

export async function getAdminRecentStudents(limit: number = 4): Promise<StudentSummary[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const simulatedData: StudentSummary[] = [
        { id: 's1', name: "Alice Wonderland", courseName: "Foundations", progress: 70 },
        { id: 's2', name: "Bob The Builder", courseName: "The Bible", progress: 45 },
        { id: 's3', name: "Charlie Brown", courseName: "Foundations", progress: 95 },
        { id: 's4', name: "Dana Scully", courseName: "Hermeneutics", progress: 60 },
    ];
    return simulatedData.slice(0, limit);
}

export async function getAdminDashboardCourses(limit: number = 4): Promise<AdminCourseSummary[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const simulatedData: AdminCourseSummary[] = [
        { id: 'c1', courseId: 'c1', title: "Foundations of Faith (Live)", studentCount: 50, status: "active", startDate: "2024-01-15T00:00:00Z", endDate: "2024-03-15T00:00:00Z" },
        { id: 'c2', courseId: 'c2', title: "Old Testament Survey (Live)", studentCount: 35, status: "upcoming", startDate: "2024-03-20T00:00:00Z", endDate: "2024-05-20T00:00:00Z" },
        { id: 'c3', courseId: 'c3', title: "Apologetics 101 (Completed)", studentCount: 25, status: "completed", startDate: "2023-10-01T00:00:00Z", endDate: "2023-12-01T00:00:00Z" },
        { id: 'c4', courseId: 'c4', title: "Systematic Theology I", studentCount: 40, status: "active", startDate: "2024-02-01T00:00:00Z", endDate: "2024-04-01T00:00:00Z" },
    ];
    return simulatedData.slice(0, limit);
}

export async function getAdminDashboardQuizzes(limit: number = 4): Promise<AdminQuizSummary[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const simulatedData: AdminQuizSummary[] = [
        { id: 'q1', courseId: 'c1', title: "Week 1 - Foundations Quiz", courseName: "Foundations of Faith (Live)", submittedCount: 40, totalEligible: 50, dueDate: "2024-01-22T00:00:00Z" },
        { id: 'q2', courseId: 'c1', title: "Week 2 - Doctrine Basics", courseName: "Foundations of Faith (Live)", submittedCount: 10, totalEligible: 50, dueDate: "2024-01-29T00:00:00Z" },
        { id: 'q3', courseId: 'c2', title: "Genesis Chapters 1-11", courseName: "Old Testament Survey (Live)", submittedCount: 0, totalEligible: 35, dueDate: "2024-03-27T00:00:00Z" },
        { id: 'q4', courseId: 'c4', title: "Theology Proper - Midterm", courseName: "Systematic Theology I", submittedCount: 30, totalEligible: 40, dueDate: "2024-03-01T00:00:00Z" },
    ];
    return simulatedData.slice(0, limit);
}

interface AdminDataParams {
    search?: string;
    status?: string;
    courseId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
}

export async function getAdminAllStudents(params: AdminDataParams = {}): Promise<AdminStudent[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    let studentsDb: AdminStudent[] = [
        { id: 's101', name: "Alice Wonderland", email: "alice@example.com", courseName: "Foundations", progress: 70, status: "active" },
        { id: 's102', name: "Bob The Builder", email: "bob@example.com", courseName: "The Bible", progress: 45, status: "at risk" },
        { id: 's103', name: "Charlie Brown", email: "charlie@example.com", courseName: "Foundations", progress: 95, status: "completed" },
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

export async function getAdminAllCourses(params: AdminDataParams = {}): Promise<AdminCourse[]> {
     await new Promise(resolve => setTimeout(resolve, 500));
    let coursesDb: AdminCourse[] = [
        { id: 'c1', courseId: 'c1', title: "Foundations of Faith (Live)", studentCount: 50, status: "active", startDate: "2024-01-15T00:00:00Z", endDate: "2024-03-15T00:00:00Z" },
        { id: 'c2', courseId: 'c2', title: "Old Testament Survey (Live)", studentCount: 35, status: "upcoming", startDate: "2024-03-20T00:00:00Z", endDate: "2024-05-20T00:00:00Z" },
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

export async function getAdminAllQuizzes(params: AdminDataParams = {}): Promise<AdminFullQuiz[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    let quizzesDb: AdminFullQuiz[] = [
        { id: 'q1', courseId: 'c1', title: "Week 1 - Foundations Quiz", courseName: "Foundations of Faith (Live)", submittedCount: 40, totalEligible: 50, dueDate: "2024-01-22T00:00:00Z" },
        { id: 'q2', courseId: 'c1', title: "Week 2 - Doctrine Basics", courseName: "Foundations of Faith (Live)", submittedCount: 10, totalEligible: 50, dueDate: "2024-01-29T00:00:00Z" },
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

export const getUserWeekProgress = async (weekId: string): Promise<UserProgress> => {
  try {
    const response = await API.get<UserProgress>(`/weeks/${weekId}/progress`);
    return response.data;
  } catch (error: unknown) {
     if (axios.isAxiosError(error) && error.response?.status === 404) {
         return {};
     }
    console.error(`[apiService] Error fetching week progress for ${weekId}:`, getErrorMessage(error));
    throw error;
  }
};

export const updateSectionProgress = async (weekId: string, sectionId: string, completed: boolean): Promise<void> => {
  try {
    await API.put(`/weeks/${weekId}/sections/${sectionId}/progress`, { completed });
  } catch (error: unknown) {
    console.error(`[apiService] Error updating section progress for ${weekId}/${sectionId}:`, getErrorMessage(error));
    throw error;
  }
};

export const getMyCourseGrades = async (courseId: string): Promise<CourseGradesResponse> => {
    const response = await API.get(`/courses/${courseId}/my-grades`);
    return response.data;
};

export { API };