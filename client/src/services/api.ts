import axios, { type AxiosResponse, AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';

export interface QuizQuestionOption { id: string; text: string; isCorrect?: boolean; }
export interface QuizQuestion { id: string; type: 'multiple_choice' | 'checkbox' | 'short_answer' | 'paragraph'; question: string; required: boolean; description?: string; options?: QuizQuestionOption[]; correctAnswer?: string | string[]; }
export interface VideoBlockContent { id: string; title: string; description?: string; videoFile?: File; videoUrl?: string; thumbnail?: File; thumbnailUrl?: string; duration?: number; isRequired: boolean; drmEnabled: boolean; accessControl: { allowDownload: boolean; allowSharing: boolean; expirationDate?: Date; }; }
export interface QuizBlockContent {
  id: string; // This is the ID of the block itself within the rich content/editor structure.
  title: string;
  description?: string;
  questions: QuizQuestion[]; // Array of questions within this quiz block
  settings: {
    shuffleQuestions: boolean;
    timeLimit?: number; // in minutes
    passingScore?: number; // percentage, e.g., 70
    showResults: boolean; // Whether to show results/feedback immediately after submission
    allowRetake: boolean;
    maxAttempts?: number;
    showCorrectAnswers: boolean; // Whether to show which answers were correct/incorrect
    showPoints?: boolean; // If questions have individual point values to display
    requireLogin?: boolean; // If applicable, though usually handled by page auth
    collectEmail?: boolean; // If applicable
    allowProgressSaving?: boolean; // For saving an in-progress attempt (more advanced)
  };
  databaseQuizId: string; // <<<< --- ADD THIS LINE ---
                          // This MUST be the ID of the corresponding Quiz document
                          // in your main 'quizzes' Firestore collection (or database table).
}export interface RichContentItemBlock { id: string; type: 'text' | 'video' | 'quiz'; order?: number; content?: string; videoContent?: VideoBlockContent; quizContent?: QuizBlockContent; }
export interface AssignmentDetails { id: string; weekId: string; title: string; description?: string; instructions?: string; type?: string; points?: number; dueDateOffsetDays?: number | null; order?: number; createdBy?: string; createdAt?: any; updatedAt?: any; weekNumber?: number; courseTitle?: string; courseId?: string; }
export interface Section { id: string; weekId: string; title: string; description?: string; order: number; content: ContentItem[]; createdAt?: Date; updatedAt?: Date; }
export interface DiscussionTopic { id: string; courseId: string; weekId?: string; sectionId?: string; title: string; description?: string; content?: string; createdAt?: Date; updatedAt?: Date; }
export interface ContentItem { id?: string; type: 'text' | 'video' | 'quiz_link'; title: string; isRequired: boolean; content?: string; url?: string; richContent: RichContentItemBlock[]; order?: number; createdAt?: Date; updatedAt?: Date; }
export interface SectionData { weekId: string; title: string; description?: string; order: number; }
export interface ContentData { type: ContentItem['type']; title: string; isRequired: boolean; content?: string; url?: string; richContent?: RichContentItemBlock[]; order: number; }
export interface Course { id: string; title: string; description?: string; monthOrder: number; instructor?: string; instructorName?: string; ects?: number; settings?: { defaultPassingScore?: number; }; }
export interface Week { id: string; courseId: string; weekNumber: number; title: string; description?: string; sections?: Section[]; }
export interface Material { id: string; weekId: string; title: string; type: 'video' | 'reading' | 'resource'; contentUrl?: string; details?: string; }
export interface Quiz { id: string; weekId: string; title: string; description?: string; instructions?: string; quizUrl?: string; points?: number; dueDateOffsetDays?: number | null; isGraded?: boolean; passingScore?: number; }
export interface DashboardStat { id: string | number; title: string; value: string | number; iconName: string; change?: string; }
export interface StudentSummary { id: string; name: string; courseName: string; progress: number; }
export interface AdminCourseSummary { id: string; title: string; studentCount: number; status: 'active' | 'upcoming' | 'completed' | 'archived' | string; startDate?: string; endDate?: string; courseId?: string; }
export interface AdminQuizSummary { id: string; title: string; courseName: string; submittedCount: number; totalEligible: number; dueDate?: string; courseId?: string; }
export interface AdminStudent extends StudentSummary { email: string; status: 'active' | 'at risk' | 'inactive' | 'completed' | string; }
export interface AdminCourse extends AdminCourseSummary {}
export interface AdminFullQuiz extends AdminQuizSummary {}
export interface UserProgress { [sectionId: string]: boolean; }
export interface GradedItem { id: string; title: string; type: 'section_completion' | 'quiz_score'; status?: 'completed' | 'incomplete' | 'not_started' | 'passed' | 'failed' | 'pending_grade' | 'submitted'; score?: number | null; maxScore?: 100; isGraded?: boolean; }
export interface WeekGradeSummary { weekId: string; weekNumber: number; weekTitle: string; items: GradedItem[]; overallWeekProgress?: number; }

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
   return response.data;
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
export const submitQuizAttempt = async (quizId: string, submissionData: { answers: UserAnswers }): Promise<{ id: string; score: number | null; status: string; }> => {
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
    await new Promise(resolve => setTimeout(resolve, 300));
    const simulatedData: DashboardStat[] = [
        { id: 'totalStudents', title: "Total Students", value: "150", iconName: "Users", change: "+10 since last week" },
        { id: 'activeCourses', title: "Active Courses", value: "5", iconName: "BookOpen", change: "1 new" },
        { id: 'completionRate', title: "Completion Rate", value: "75%", iconName: "CheckCircle2", change: "-2%" },
        { id: 'avgGrade', title: "Avg. Grade", value: "B+", iconName: "FileText", change: "Stable" },
    ];
    return simulatedData;
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

export const getMyCourseGrades = async (courseId: string): Promise<WeekGradeSummary[]> => {
  if (!courseId) {
    console.error("[apiService] getMyCourseGrades: courseId is required.");
    throw new Error("Course ID is required to fetch grades.");
  }
  try {
    const response = await API.get(`/courses/${courseId}/my-grades`);
    return response.data;
  } catch (error: unknown) {
    console.error(`[apiService] Error fetching grades for course ${courseId}:`, getErrorMessage(error));
    if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn(`[apiService] No grades found for course ${courseId}, returning empty array.`);
        return [];
    }
    throw error;
  }
};

export { API };