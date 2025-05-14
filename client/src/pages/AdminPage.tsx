import React, { useState, useEffect } from "react"; // Added useEffect
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs.js";
import { Input } from "../components/ui/input.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select.js";
import { Progress } from "../components/ui/progress.js";
import {
  BookOpen, Users, FileText, Settings, PlusCircle, Search, Calendar, CheckCircle2, Clock, Edit, Eye, Trash2, ArrowUpRight, UserCircle, HelpCircle, LogOut, Loader2, AlertCircle // Import Loader2, AlertCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import * as apiService from "../services/api"; // Import your api service

// --- Styling Constants (keep as is) ---
const accentColor = "#C5A467";
const accentHoverColor = "#B08F55";
const primaryTextLight = "text-[#2A0F0F]";
const secondaryTextLight = "text-[#4A1F1F]";
const primaryTextDark = "dark:text-[#FFF8F0]";
const secondaryTextDark = "dark:text-[#E0D6C3]/90";
const mutedTextLight = "text-gray-500";
const mutedTextDark = "dark:text-gray-400";
const cardBgLight = "bg-white";
const cardBgDark = "dark:bg-gray-900";
const cardBorder = `border border-[#C5A467]/20 dark:border-[#C5A467]/30`;
const sectionBgLight = "bg-[#FFF8F0]";
const sectionBgDark = "dark:bg-gray-950";
const tableHeaderBgLight = "bg-gray-50";
const tableHeaderBgDark = "dark:bg-gray-800/50";
const tableRowBgLight = "bg-white";
const tableRowBgDark = "dark:bg-gray-900";
const tableBorderLight = "border-gray-200";
const tableBorderDark = "dark:border-gray-700";
const tabsListBgLight = "bg-[#F4EDE4]";
const tabsListBgDark = "dark:bg-gray-800";
const tabsTriggerTextLight = "text-[#4A1F1F]";
const tabsTriggerTextDark = "dark:text-[#E0D6C3]/80";
const tabsTriggerActiveTextLight = "text-[#2A0F0F]";
const tabsTriggerActiveTextDark = "dark:text-white";
const tabsTriggerActiveBgLight = "bg-white";
const tabsTriggerActiveBgDark = "dark:bg-gray-950";
const tabsTriggerHoverBgLight = "hover:bg-white/60";
const tabsTriggerHoverBgDark = "dark:hover:bg-white/10";
const tabsTriggerHoverTextLight = "hover:text-[#2A0F0F]";
const tabsTriggerHoverTextDark = "dark:hover:text-white";
const inputBgLight = "bg-[#FFF8F0]";
const inputBgDark = "dark:bg-gray-800";
const inputBorderLight = "border-[#E0D6C3]";
const inputBorderDark = "dark:border-gray-700";
const focusRingAccent = `focus:ring-[${accentColor}]`;
const focusBorderAccent = `focus:border-[${accentColor}] dark:focus:border-[${accentColor}]`;
const positiveColor = "text-green-600 dark:text-green-400";
const positiveBg = "bg-green-100 dark:bg-green-900/30";
const warningColor = "text-yellow-700 dark:text-yellow-400";
const warningBg = "bg-yellow-100 dark:bg-yellow-900/30";
const inactiveColor = "text-gray-500 dark:text-gray-400";
const inactiveBg = "bg-gray-100 dark:bg-gray-700/30";
const upcomingColor = inactiveColor;
const upcomingBg = inactiveBg;
// --- End Styling Constants ---

const IconMap = {
  Users,
  BookOpen,
  CheckCircle2,
  FileText,
  // Add a default/fallback icon
  HelpCircle, // Example fallback
};

// Your local DashboardStat interface
interface DashboardStat {
  id: string | number;
  title: string;
  value: string | number;
  iconName: keyof typeof IconMap; // This remains specific for your component's internal use
  change?: string;
}

// --- Data Interfaces ---
interface DashboardStat {
  id: string | number;
  title: string;
  value: string | number;
  iconName: keyof typeof IconMap; // Use string key for icon mapping
  change?: string;
}

interface StudentSummary {
  id: string;
  name: string;
  courseName: string; // Or courseTitle
  progress: number;
  // avatarUrl?: string; // Optional
}

interface CourseSummary {
  id: string;
  title: string;
  studentCount: number;
  status: 'active' | 'upcoming' | 'completed' | 'archived' | string; // Allow string for flexibility during dev
  startDate?: string;
  endDate?: string;
  courseId?: string; // Keep your existing courseId if used for navigation
}

interface QuizSummary {
  id: string;
  title: string;
  courseName: string; // Or courseTitle
  submittedCount: number;
  totalEligible: number; // Or totalEnrolled
  dueDate?: string;
  courseId?: string; // Keep your existing courseId if used for navigation
}

// Full interfaces for tab views (can be more detailed)
interface Student extends StudentSummary {
  email: string;
  status: string; // 'active', 'at risk', 'inactive', 'completed'
}

interface Course extends CourseSummary {
  // Add more fields if needed for the table view
}
interface Quiz extends QuizSummary {
  // Add more fields if needed for the table view
}




export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // --- State for Fetched Data ---
  // Dashboard Stats
  const [dashboardStats, setDashboardStats] = useState<DashboardStat[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);

  // Recent Students (Dashboard)
  const [recentStudents, setRecentStudents] = useState<StudentSummary[]>([]);
  const [isLoadingRecentStudents, setIsLoadingRecentStudents] = useState(true);
  const [errorRecentStudents, setErrorRecentStudents] = useState<string | null>(null);

  // Course Status (Dashboard)
  const [dashboardCourses, setDashboardCourses] = useState<CourseSummary[]>([]);
  const [isLoadingDashboardCourses, setIsLoadingDashboardCourses] = useState(true);
  const [errorDashboardCourses, setErrorDashboardCourses] = useState<string | null>(null);

  // Quizzes Overview (Dashboard)
  const [dashboardQuizzes, setDashboardQuizzes] = useState<QuizSummary[]>([]);
  const [isLoadingDashboardQuizzes, setIsLoadingDashboardQuizzes] = useState(true);
  const [errorDashboardQuizzes, setErrorDashboardQuizzes] = useState<string | null>(null);
  
  // Data for Tabs
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isLoadingAllStudents, setIsLoadingAllStudents] = useState(false); // Start as false until tab is active
  const [errorAllStudents, setErrorAllStudents] = useState<string | null>(null);

  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isLoadingAllCourses, setIsLoadingAllCourses] = useState(false); // Start as false
  const [errorAllCourses, setErrorAllCourses] = useState<string | null>(null);

  const [allQuizzesData, setAllQuizzesData] = useState<Quiz[]>([]);
  const [isLoadingAllQuizzes, setIsLoadingAllQuizzes] = useState(false); // Start as false
  const [errorAllQuizzes, setErrorAllQuizzes] = useState<string | null>(null);


  // --- States for Filters (keep as is for now) ---
  const [studentSearch, setStudentSearch] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState("all");
  const [courseSearch, setCourseSearch] = useState("");
  const [courseStatusFilter, setCourseStatusFilter] = useState("all");
  const [quizSearch, setQuizSearch] = useState("");
  const [quizCourseFilter, setQuizCourseFilter] = useState("all");


  // --- REMOVE OR COMMENT OUT DUMMY DATA ---
  /*
  const stats = [
    { id: 1, title: "Total Students", value: 124, icon: Users, change: "+12% from last month" },
    // ...
  ];

  const students = [
    { id: 1, name: "John Doe", email: "john.doe@example.com", course: "Foundations", progress: 65, status: "active" },
    // ...
  ];

  const courses = [
    { id: 1, title: "Foundations of the Christian Faith", students: 45, status: "active", startDate: "Jan 15, 2025", endDate: "Feb 12, 2025", courseId: "foundations" },
    // ...
  ];

  const quizzes = [
    { id: 1, title: "Week 1 Checkpoint", course: "Foundations", submitted: 32, total: 45, dueDate: "Jan 22, 2025", courseId: "foundations" },
    // ...
  ];
  */

  // --- Data Fetching useEffect ---
   useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoadingStats(true);
      setIsLoadingRecentStudents(true);
      setIsLoadingDashboardCourses(true);
      setIsLoadingDashboardQuizzes(true);

      try {
        // Assuming apiService.getAdminDashboardStats() returns apiService.DashboardStat[]
        // where apiService.DashboardStat has iconName: string
        const [
            apiStatsData, // This will be of type apiService.DashboardStat[] from api.ts
            studentsData, 
            coursesData, 
            quizzesData
        ] = await Promise.all([
          apiService.getAdminDashboardStats(), // Fetches data where iconName is string
          apiService.getAdminRecentStudents(4),
          apiService.getAdminDashboardCourses(4),
          apiService.getAdminDashboardQuizzes(4)
        ]);

        // --- Process statsData to conform to local DashboardStat interface ---
        const processedStatsData = apiStatsData.map(statFromApi => {
          // Check if the iconName from API is a valid key in your local IconMap
          if (Object.prototype.hasOwnProperty.call(IconMap, statFromApi.iconName)) {
            return {
              ...statFromApi,
              iconName: statFromApi.iconName as keyof typeof IconMap, // Assert type
            };
          } else {
            // Handle unknown iconName: log a warning, use a default/fallback
            console.warn(
              `AdminPage: Unknown iconName "${statFromApi.iconName}" received for stat "${statFromApi.title}". Using default icon.`
            );
            return {
              ...statFromApi,
              iconName: "HelpCircle" as keyof typeof IconMap, // Use your defined fallback icon key
            };
          }
        });
        setDashboardStats(processedStatsData); // Now setting data that matches local DashboardStat[] type

        // --- Process other data as before (assuming their types align or need similar mapping) ---
        setRecentStudents(studentsData.map(s => ({
            id: s.id,
            name: s.name,
            courseName: (s as any).courseName || (s as any).course || 'N/A',
            progress: s.progress,
        })));

        setDashboardCourses(coursesData.map(c => ({
            id: c.id,
            title: c.title,
            studentCount: (c as any).students || (c as any).studentCount,
            status: c.status,
            startDate: c.startDate,
            endDate: c.endDate,
            courseId: c.courseId || c.id,
        })));

        setDashboardQuizzes(quizzesData.map(q => ({
            id: q.id,
            title: q.title,
            courseName: (q as any).courseName || (q as any).course,
            submittedCount: (q as any).submitted || (q as any).submittedCount,
            totalEligible: (q as any).total || (q as any).totalEligible,
            dueDate: q.dueDate,
            courseId: q.courseId,
        })));

      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        // Set individual error states or a general one
        setErrorStats("Failed to load statistics.");
        setErrorRecentStudents("Failed to load recent students.");
        setErrorDashboardCourses("Failed to load dashboard courses.");
        setErrorDashboardQuizzes("Failed to load quizzes overview.");
      } finally {
        setIsLoadingStats(false);
        setIsLoadingRecentStudents(false);
        setIsLoadingDashboardCourses(false);
        setIsLoadingDashboardQuizzes(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchTabData = async () => {
      if (activeTab === "students") {
        setIsLoadingAllStudents(true); setErrorAllStudents(null);
        try {
          const filters: any = { };
          if (studentSearch) filters.search = studentSearch;
          if (studentStatusFilter !== 'all') filters.status = studentStatusFilter;
          const data = await apiService.getAdminAllStudents(filters);
          setAllStudents(data);
        } catch (err) {
          setErrorAllStudents((err as Error).message || "Failed to load students data");
        } finally {
          setIsLoadingAllStudents(false);
        }
      } else if (activeTab === "courses") {
        setIsLoadingAllCourses(true); setErrorAllCourses(null);
        try {
          const filters: any = { };
          if (courseSearch) filters.search = courseSearch;
          if (courseStatusFilter !== 'all') filters.status = courseStatusFilter;
          const data = await apiService.getAdminAllCourses(filters);
          setAllCourses(data);
        } catch (err) {
          setErrorAllCourses((err as Error).message || "Failed to load courses data");
        } finally {
          setIsLoadingAllCourses(false);
        }
      } else if (activeTab === "quizzes") {
        setIsLoadingAllQuizzes(true); setErrorAllQuizzes(null);
        try {
          const filters: any = { };
          if (quizSearch) filters.search = quizSearch;
          if (quizCourseFilter !== 'all') filters.courseId = quizCourseFilter;
          const data = await apiService.getAdminAllQuizzes(filters);
          setAllQuizzesData(data);
        } catch (err) {
          setErrorAllQuizzes((err as Error).message || "Failed to load quizzes data");
        } finally {
          setIsLoadingAllQuizzes(false);
        }
      }
    };

    if (activeTab !== "dashboard") {
        fetchTabData();
    }
  }, [activeTab, studentSearch, studentStatusFilter, courseSearch, courseStatusFilter, quizSearch, quizCourseFilter]);


  // --- Filtering Logic ---
  // Note: If your backend handles filtering, these client-side filters might not be strictly necessary
  // or could be used as a fallback or for additional local refinement.
  // For now, we assume they are still useful for the UI until backend filtering is fully robust.

  const filteredStudents = studentSearch || studentStatusFilter !== 'all'
    ? allStudents.filter(s =>
        (s.name.toLowerCase().includes(studentSearch.toLowerCase()) || (s.email && s.email.toLowerCase().includes(studentSearch.toLowerCase()))) &&
        (studentStatusFilter === 'all' || s.status === studentStatusFilter)
      )
    : allStudents;

  const filteredCourses = courseSearch || courseStatusFilter !== 'all'
    ? allCourses.filter(c =>
        c.title.toLowerCase().includes(courseSearch.toLowerCase()) &&
        (courseStatusFilter === 'all' || c.status === courseStatusFilter)
      )
    : allCourses;

  const filteredQuizzes = quizSearch || quizCourseFilter !== 'all'
    ? allQuizzesData.filter(q =>
        q.title.toLowerCase().includes(quizSearch.toLowerCase()) &&
        (quizCourseFilter === 'all' || q.courseId === quizCourseFilter)
      )
    : allQuizzesData;


  // --- Helper Functions ---
  const getStatusBadgeClasses = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return `${positiveBg} ${positiveColor}`;
      case 'at risk': return `${warningBg} ${warningColor}`;
      case 'upcoming': return `${upcomingBg} ${upcomingColor}`;
      case 'completed': return `${inactiveBg} ${inactiveColor}`;
      case 'inactive': return `${inactiveBg} ${inactiveColor}`;
      case 'archived': return `${inactiveBg} ${inactiveColor}`;
      default: return `${inactiveBg} ${inactiveColor}`;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  // --- Styling variables (can be moved to top or a separate file) ---
  const inputClasses = `h-9 rounded-md px-3 text-sm ${inputBgLight} ${inputBgDark} ${inputBorderLight} ${inputBorderDark} ${focusBorderAccent} ${focusRingAccent} ${primaryTextLight} ${primaryTextDark}`;
  const selectTriggerClasses = `h-9 rounded-md px-3 text-sm w-full md:w-[180px] ${inputBgLight} ${inputBgDark} ${inputBorderLight} ${inputBorderDark} ${focusBorderAccent} ${focusRingAccent} ${primaryTextLight} ${primaryTextDark}`;
  const selectContentClasses = `border ${inputBorderLight} ${inputBorderDark} ${cardBgLight} ${cardBgDark} ${primaryTextLight} ${primaryTextDark}`;
  const outlineButtonClasses = `border-[#4A1F1F]/50 dark:border-[#E0D6C3]/50 ${secondaryTextLight} ${secondaryTextDark} hover:text-[#2A0F0F] hover:border-[#2A0F0F] dark:hover:text-white dark:hover:border-white hover:bg-transparent dark:hover:bg-transparent transition-colors`;
  const primaryButtonClasses = `bg-[${accentColor}] hover:bg-[${accentHoverColor}] text-[#2A0F0F] font-semibold transition-colors`;
  const tableHeaderClasses = `h-12 px-4 text-left align-middle font-medium text-xs uppercase ${mutedTextLight} ${mutedTextDark}`;
  const tableCellClasses = `p-4 align-middle ${secondaryTextLight} ${secondaryTextDark}`;
  const ghostButtonClasses = `${secondaryTextLight} ${secondaryTextDark} hover:bg-gray-100 dark:hover:bg-gray-800 hover:${tabsTriggerHoverTextLight} dark:hover:${tabsTriggerHoverTextDark}`;


  // Helper component for loading/error states
  const DataDisplayWrapper = ({ isLoading, error, children, loadingText = "Loading data...", count, noDataMessage = "No data available." }: { isLoading: boolean; error: string | null; children: React.ReactNode; loadingText?: string; count?: number; noDataMessage?: string; }) => {
    if (isLoading) {
      return <div className="flex items-center justify-center p-4 min-h-[100px]"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {loadingText}</div>;
    }
    if (error) {
      return <div className="flex items-center justify-center p-4 text-red-500 min-h-[100px]"><AlertCircle className="mr-2 h-5 w-5" /> Error: {error}</div>;
    }
    if (count !== undefined && count === 0 && !isLoading && !error) {
        return <div className="p-4 text-center text-gray-500 dark:text-gray-400 min-h-[100px]">{noDataMessage}</div>;
    }
    return <>{children}</>;
  };


  return (
    <div className="container px-4 py-8 md:px-6 lg:py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 lg:mb-12 gap-4">
        <div>
          <h1 className={`text-3xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>Admin Dashboard</h1>
          <p className={`${secondaryTextLight} ${secondaryTextDark} mt-1`}>Manage courses, students, and program content</p>
        </div>
        <div className="flex gap-2">
            <Link to="/admin/settings">
                 <Button variant="outline" size="sm" className={outlineButtonClasses}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className={`${outlineButtonClasses} text-red-600 dark:text-red-400 border-red-400/50 dark:border-red-400/50 hover:border-red-600 dark:hover:border-red-400 hover:text-red-700 dark:hover:text-red-300`}
              onClick={handleLogout}
              disabled={authLoading}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full grid-cols-2 md:grid-cols-4 mb-8 rounded-lg p-1 ${tabsListBgLight} ${tabsListBgDark}`}>
          <TabsTrigger value="dashboard" className={`flex-1 sm:flex-auto ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200`}>Dashboard</TabsTrigger>
          <TabsTrigger value="students" className={`flex-1 sm:flex-auto ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200`}>Students</TabsTrigger>
          <TabsTrigger value="courses" className={`flex-1 sm:flex-auto ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200`}>Courses</TabsTrigger>
          <TabsTrigger value="quizzes" className={`flex-1 sm:flex-auto ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200`}>Quizzes</TabsTrigger>
        </TabsList>

        {/* ============================ DASHBOARD TAB ============================ */}
        <TabsContent value="dashboard" className="space-y-8">
          {/* --- Dashboard Stats Section --- */}
          <DataDisplayWrapper isLoading={isLoadingStats} error={errorStats} count={dashboardStats.length} loadingText="Loading statistics...">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {dashboardStats.map((stat) => {
                const IconComponent = IconMap[stat.iconName as keyof typeof IconMap] || HelpCircle;
                return (
                  <Card key={stat.id} className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`}>
                    <CardHeader>
                      <CardTitle className={`text-sm font-medium ${mutedTextLight} ${mutedTextDark}`}>{stat.title}</CardTitle>
                      <div className={`rounded-full p-2 inline-block bg-gray-100 dark:bg-gray-700`}>
                        <IconComponent className={`h-5 w-5 ${secondaryTextLight} ${secondaryTextDark}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${primaryTextLight} ${primaryTextDark}`}>{stat.value}</div>
                      <p className={`text-xs ${mutedTextLight} ${mutedTextDark}`}>
                        {stat.change}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </DataDisplayWrapper>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* --- Recent Students (Dashboard) --- */}
            <Card className={`lg:col-span-1 ${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`}>
              <CardHeader>
                <CardTitle className={`${primaryTextLight} ${primaryTextDark} font-serif`}>Recent Students</CardTitle>
                <CardDescription className={`${secondaryTextLight} ${secondaryTextDark}`}>Overview of student activity</CardDescription>
              </CardHeader>
              <CardContent>
                <DataDisplayWrapper isLoading={isLoadingRecentStudents} error={errorRecentStudents} count={recentStudents.length} loadingText="Loading recent students..." noDataMessage="No recent student activity.">
                  <div className="space-y-4">
                    {recentStudents.map((student) => ( // Use recentStudents from state
                      <div key={student.id} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <UserCircle className={`h-8 w-8 ${mutedTextLight} ${mutedTextDark} flex-shrink-0`} />
                          <div>
                            <p className={`text-sm font-medium ${primaryTextLight} ${primaryTextDark}`}>{student.name}</p>
                            <p className={`text-xs ${mutedTextLight} ${mutedTextDark}`}>{student.courseName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Progress value={student.progress} className="h-2 w-16 sm:w-20 [&>div]:bg-[#C5A467]" />
                          <span className={`text-xs font-medium ${secondaryTextLight} ${secondaryTextDark}`}>{student.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </DataDisplayWrapper>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className={`w-full ${outlineButtonClasses}`} onClick={() => setActiveTab('students')}>
                  Manage Students <ArrowUpRight className="ml-1 h-4 w-4"/>
                </Button>
              </CardFooter>
            </Card>

            {/* --- Course Status (Dashboard) --- */}
            <Card className={`lg:col-span-2 ${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`}>
              <CardHeader>
                  <CardTitle className={`${primaryTextLight} ${primaryTextDark} font-serif`}>Course Status</CardTitle>
                  <CardDescription className={`${secondaryTextLight} ${secondaryTextDark}`}>Overview of program courses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <DataDisplayWrapper isLoading={isLoadingDashboardCourses} error={errorDashboardCourses} count={dashboardCourses.length} loadingText="Loading courses..." noDataMessage="No courses to display.">
                  {dashboardCourses.map((course) => ( // Use dashboardCourses from state
                  <div key={course.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border ${tableBorderLight} ${tableBorderDark} gap-3`}>
                      <div className="flex items-center gap-3 flex-1">
                      <BookOpen className={`h-5 w-5 text-[${accentColor}] flex-shrink-0`} />
                      <div>
                          <p className={`font-medium ${primaryTextLight} ${primaryTextDark}`}>{course.title}</p>
                          <p className={`text-xs ${mutedTextLight} ${mutedTextDark}`}>
                            {course.startDate && course.endDate ? `${new Date(course.startDate).toLocaleDateString()} - ${new Date(course.endDate).toLocaleDateString()}` : 'Dates N/A'}
                          </p>
                      </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 sm:mt-0 flex-shrink-0">
                        <div className={`flex items-center gap-1 text-sm ${secondaryTextLight} ${secondaryTextDark}`}>
                            <Users className="h-4 w-4" />
                            <span>{course.studentCount}</span>
                        </div>
                        <div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(course.status)}`}>
                                {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                            </span>
                        </div>
                        <Button variant="ghost" size="sm" className={`${ghostButtonClasses} text-xs px-2 py-1 h-auto`} onClick={() => {
                            navigate(`/admin/courses?courseId=${course.courseId || course.id}`); // Navigate or switch tab
                            // setActiveTab('courses'); // Optionally switch tab as well
                        }}>
                            View
                        </Button>
                      </div>
                  </div>
                  ))}
                </DataDisplayWrapper>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className={`w-full ${outlineButtonClasses}`} onClick={() => setActiveTab('courses')}>
                  Manage Courses <ArrowUpRight className="ml-1 h-4 w-4"/>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* --- Quizzes Overview (Dashboard) --- */}
          <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`}>
              <CardHeader>
                <CardTitle className={`${primaryTextLight} ${primaryTextDark} font-serif`}>Quizzes Overview</CardTitle>
                <CardDescription className={`${secondaryTextLight} ${secondaryTextDark}`}>Recent and upcoming quiz status</CardDescription>
              </CardHeader>
              <CardContent>
                <DataDisplayWrapper isLoading={isLoadingDashboardQuizzes} error={errorDashboardQuizzes} count={dashboardQuizzes.length} loadingText="Loading quizzes overview..." noDataMessage="No quizzes to display.">
                  <div className="space-y-3">
                    {dashboardQuizzes.map((quiz) => ( // Use dashboardQuizzes from state
                    <div key={quiz.id} className="flex items-center justify-between gap-4 border-b pb-2 last:border-b-0 last:pb-0">
                      <div>
                        <p className={`text-sm font-medium ${primaryTextLight} ${primaryTextDark}`}>{quiz.title}</p>
                        <p className={`text-xs ${mutedTextLight} ${mutedTextDark}`}>{quiz.courseName}</p>
                      </div>
                      <div className="flex items-center gap-4">
                          <span className={`text-sm ${secondaryTextLight} ${secondaryTextDark}`}>{quiz.submittedCount}/{quiz.totalEligible} Submitted</span>
                          <div className={`flex items-center gap-2 text-xs flex-shrink-0 ${mutedTextLight} ${mutedTextDark}`}>
                          <Clock className="h-3.5 w-3.5" />
                          <span>Due: {quiz.dueDate ? new Date(quiz.dueDate).toLocaleDateString() : 'N/A'}</span>
                          </div>
                      </div>
                    </div>
                  ))}
                  </div>
                </DataDisplayWrapper>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className={`w-full ${outlineButtonClasses}`} onClick={() => setActiveTab('quizzes')}>
                  Manage Quizzes <ArrowUpRight className="ml-1 h-4 w-4"/>
                </Button>
              </CardFooter>
          </Card>
        </TabsContent>


        {/* ============================ STUDENTS TAB ============================ */}
        <TabsContent value="students" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className={`absolute left-2.5 top-2.5 h-4 w-4 ${mutedTextLight} ${mutedTextDark}`} />
                <Input placeholder="Search students..." className={`pl-8 ${inputClasses}`} value={studentSearch} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStudentSearch(e.target.value)} />
              </div>
                <Select value={studentStatusFilter} onValueChange={setStudentStatusFilter}>
                <SelectTrigger className={selectTriggerClasses}>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className={selectContentClasses}>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="at risk">At Risk</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <Link to="/admin/students/manage"> {/* Changed link for clarity */}
                 <Button className={primaryButtonClasses}>
                    <Users className="mr-2 h-4 w-4" />
                    Manage All Students
                 </Button>
             </Link>
          </div>

          <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`}>
            <CardContent className="p-0">
              <DataDisplayWrapper isLoading={isLoadingAllStudents} error={errorAllStudents} count={filteredStudents.length} loadingText="Loading students..." noDataMessage="No students found matching your criteria.">
                <div className="relative w-full overflow-x-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className={`${tableHeaderBgLight} ${tableHeaderBgDark}`}>
                      <tr>
                        <th className={tableHeaderClasses}>Name</th>
                        <th className={tableHeaderClasses}>Email</th>
                        <th className={tableHeaderClasses}>Current Course</th>
                        <th className={tableHeaderClasses}>Progress</th>
                        <th className={tableHeaderClasses}>Status</th>
                        <th className={`${tableHeaderClasses} text-right`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${tableBorderLight} ${tableBorderDark}`}>
                      {filteredStudents.map((student) => ( // Use filteredStudents (derived from allStudents state)
                        <tr key={student.id} className={`${tableRowBgLight} ${tableRowBgDark}`}>
                          <td className={`p-4 align-middle font-medium ${primaryTextLight} ${primaryTextDark}`}>{student.name}</td>
                          <td className={tableCellClasses}>{student.email}</td>
                          <td className={tableCellClasses}>{student.courseName}</td>
                          <td className={tableCellClasses}>
                            <div className="flex items-center gap-2">
                              <Progress value={student.progress} className={`h-1.5 w-20 sm:w-24 [&>div]:${student.status === 'at risk' ? 'bg-yellow-500' : `bg-[${accentColor}]` }`} />
                              <span className="text-xs font-medium">{student.progress}%</span>
                            </div>
                          </td>
                          <td className={tableCellClasses}>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(student.status)}`}>
                                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                              </span>
                          </td>
                            <td className={`${tableCellClasses} text-right`}>
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-8 w-8`} onClick={() => navigate(`/admin/student/${student.id}`)}>
                                <span className="sr-only">View Student</span>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-8 w-8`} onClick={() => navigate(`/admin/student/${student.id}/edit`)}>
                                  <span className="sr-only">Edit Student</span>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DataDisplayWrapper>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================ COURSES TAB ============================ */}
        <TabsContent value="courses" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className={`absolute left-2.5 top-2.5 h-4 w-4 ${mutedTextLight} ${mutedTextDark}`} />
                <Input placeholder="Search courses..." className={`pl-8 ${inputClasses}`} value={courseSearch} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCourseSearch(e.target.value)} />
              </div>
                <Select value={courseStatusFilter} onValueChange={setCourseStatusFilter}>
                <SelectTrigger className={selectTriggerClasses}>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className={selectContentClasses}>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <Link to="/admin/courses/manage"> {/* Changed link */}
                 <Button className={primaryButtonClasses}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Manage Course Structure
                 </Button>
             </Link>
          </div>

          <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`}>
            <CardContent className="p-0">
              <DataDisplayWrapper isLoading={isLoadingAllCourses} error={errorAllCourses} count={filteredCourses.length} loadingText="Loading courses..." noDataMessage="No courses found matching your criteria.">
                <div className="relative w-full overflow-x-auto">
                    <table className="w-full caption-bottom text-sm">
                    <thead className={`${tableHeaderBgLight} ${tableHeaderBgDark}`}>
                      <tr>
                        <th className={tableHeaderClasses}>Course Title</th>
                        <th className={tableHeaderClasses}>Students</th>
                        <th className={tableHeaderClasses}>Start Date</th>
                        <th className={tableHeaderClasses}>End Date</th>
                        <th className={tableHeaderClasses}>Status</th>
                        <th className={`${tableHeaderClasses} text-right`}>Actions</th>
                      </tr>
                    </thead>
                      <tbody className={`divide-y ${tableBorderLight} ${tableBorderDark}`}>
                        {filteredCourses.map((course) => ( // Use filteredCourses (derived from allCourses state)
                        <tr key={course.id} className={`${tableRowBgLight} ${tableRowBgDark}`}>
                          <td className={`p-4 align-middle font-medium ${primaryTextLight} ${primaryTextDark}`}>{course.title}</td>
                          <td className={tableCellClasses}>{course.studentCount}</td>
                          <td className={tableCellClasses}>{course.startDate ? new Date(course.startDate).toLocaleDateString() : 'N/A'}</td>
                          <td className={tableCellClasses}>{course.endDate ? new Date(course.endDate).toLocaleDateString() : 'N/A'}</td>
                            <td className={tableCellClasses}>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(course.status)}`}>
                                {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                              </span>
                          </td>
                            <td className={`${tableCellClasses} text-right`}>
                              <div className="flex items-center justify-end gap-1">
                                {/* Link to a page to manage a specific course's content/structure */}
                                <Link to={`/admin/courses/manage/${course.courseId || course.id}`}>
                                    <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-8 w-8`}>
                                        <span className="sr-only">Manage Course Content</span>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DataDisplayWrapper>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================ QUIZZES TAB ============================ */}
        <TabsContent value="quizzes" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className={`absolute left-2.5 top-2.5 h-4 w-4 ${mutedTextLight} ${mutedTextDark}`} />
                <Input placeholder="Search quizzes..." className={`pl-8 ${inputClasses}`} value={quizSearch} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuizSearch(e.target.value)} />
              </div>
                <Select value={quizCourseFilter} onValueChange={setQuizCourseFilter}>
                <SelectTrigger className={selectTriggerClasses}>
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent className={selectContentClasses}>
                  <SelectItem value="all">All Courses</SelectItem>
                  {/* Dynamically populate course options for filter if needed */}
                  {[...new Map(allCourses.map(c => [c.id, c])).values()].map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <Link to="/admin/quizzes/manage"> {/* Changed link */}
                 <Button className={primaryButtonClasses}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Manage All Quizzes
                 </Button>
             </Link>
          </div>

            <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`}>
            <CardContent className="p-0">
              <DataDisplayWrapper isLoading={isLoadingAllQuizzes} error={errorAllQuizzes} count={filteredQuizzes.length} loadingText="Loading quizzes..." noDataMessage="No quizzes found matching your criteria.">
                  <div className="relative w-full overflow-x-auto">
                    <table className="w-full caption-bottom text-sm">
                    <thead className={`${tableHeaderBgLight} ${tableHeaderBgDark}`}>
                      <tr>
                        <th className={tableHeaderClasses}>Quiz Title</th>
                        <th className={tableHeaderClasses}>Course</th>
                        <th className={tableHeaderClasses}>Due Date</th>
                        <th className={tableHeaderClasses}>Submissions</th>
                        <th className={`${tableHeaderClasses} text-right`}>Actions</th>
                      </tr>
                    </thead>
                      <tbody className={`divide-y ${tableBorderLight} ${tableBorderDark}`}>
                      {filteredQuizzes.map((quiz) => ( // Use filteredQuizzes (derived from allQuizzesData state)
                        <tr key={quiz.id} className={`${tableRowBgLight} ${tableRowBgDark}`}>
                          <td className={`p-4 align-middle font-medium ${primaryTextLight} ${primaryTextDark}`}>{quiz.title}</td>
                          <td className={tableCellClasses}>{quiz.courseName}</td>
                          <td className={tableCellClasses}>{quiz.dueDate ? new Date(quiz.dueDate).toLocaleDateString() : 'N/A'}</td>
                          <td className={tableCellClasses}>
                            {quiz.submittedCount}/{quiz.totalEligible}
                          </td>
                          <td className={`${tableCellClasses} text-right`}>
                            <div className="flex items-center justify-end gap-1">
                                <Link to={`/admin/quizzes/${quiz.id}/submissions`}>
                                   <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-8 w-8`}>
                                    <span className="sr-only">View Submissions</span>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                 <Link to={`/admin/quizzes/${quiz.id}/edit`}>
                                    <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-8 w-8`}>
                                        <span className="sr-only">Edit Quiz</span>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                 </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </DataDisplayWrapper>
              </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}