import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react"; // Added useEffect
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs.js";
import { Input } from "../components/ui/input.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select.js";
import { Progress } from "../components/ui/progress.js";
import { BookOpen, Users, FileText, Settings, Search, CheckCircle2, Clock, Edit, Eye, ArrowUpRight, UserCircle, HelpCircle, LogOut, Loader2, AlertCircle // Import Loader2, AlertCircle
 } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import * as apiService from "../services/api.js"; // Import your api service
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
export default function AdminPage() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const { logout, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    // --- State for Fetched Data ---
    // Dashboard Stats
    const [dashboardStats, setDashboardStats] = useState([]);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [errorStats, setErrorStats] = useState(null);
    // Recent Students (Dashboard)
    const [recentStudents, setRecentStudents] = useState([]);
    const [isLoadingRecentStudents, setIsLoadingRecentStudents] = useState(true);
    const [errorRecentStudents, setErrorRecentStudents] = useState(null);
    // Course Status (Dashboard)
    const [dashboardCourses, setDashboardCourses] = useState([]);
    const [isLoadingDashboardCourses, setIsLoadingDashboardCourses] = useState(true);
    const [errorDashboardCourses, setErrorDashboardCourses] = useState(null);
    // Quizzes Overview (Dashboard)
    const [dashboardQuizzes, setDashboardQuizzes] = useState([]);
    const [isLoadingDashboardQuizzes, setIsLoadingDashboardQuizzes] = useState(true);
    const [errorDashboardQuizzes, setErrorDashboardQuizzes] = useState(null);
    // Data for Tabs
    const [allStudents, setAllStudents] = useState([]);
    const [isLoadingAllStudents, setIsLoadingAllStudents] = useState(false); // Start as false until tab is active
    const [errorAllStudents, setErrorAllStudents] = useState(null);
    const [allCourses, setAllCourses] = useState([]);
    const [isLoadingAllCourses, setIsLoadingAllCourses] = useState(false); // Start as false
    const [errorAllCourses, setErrorAllCourses] = useState(null);
    const [allQuizzesData, setAllQuizzesData] = useState([]);
    const [isLoadingAllQuizzes, setIsLoadingAllQuizzes] = useState(false); // Start as false
    const [errorAllQuizzes, setErrorAllQuizzes] = useState(null);
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
                const [apiStatsData, // This will be of type apiService.DashboardStat[] from api.ts
                studentsData, coursesData, quizzesData] = await Promise.all([
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
                            iconName: statFromApi.iconName, // Assert type
                        };
                    }
                    else {
                        // Handle unknown iconName: log a warning, use a default/fallback
                        console.warn(`AdminPage: Unknown iconName "${statFromApi.iconName}" received for stat "${statFromApi.title}". Using default icon.`);
                        return {
                            ...statFromApi,
                            iconName: "HelpCircle", // Use your defined fallback icon key
                        };
                    }
                });
                setDashboardStats(processedStatsData); // Now setting data that matches local DashboardStat[] type
                // --- Process other data as before (assuming their types align or need similar mapping) ---
                setRecentStudents(studentsData.map(s => ({
                    id: s.id,
                    name: s.name,
                    courseName: s.courseName || s.course || 'N/A',
                    progress: s.progress,
                })));
                setDashboardCourses(coursesData.map(c => ({
                    id: c.id,
                    title: c.title,
                    studentCount: c.students || c.studentCount,
                    status: c.status,
                    startDate: c.startDate,
                    endDate: c.endDate,
                    courseId: c.courseId || c.id,
                })));
                setDashboardQuizzes(quizzesData.map(q => ({
                    id: q.id,
                    title: q.title,
                    courseName: q.courseName || q.course,
                    submittedCount: q.submitted || q.submittedCount,
                    totalEligible: q.total || q.totalEligible,
                    dueDate: q.dueDate,
                    courseId: q.courseId,
                })));
            }
            catch (err) {
                console.error("Failed to load dashboard data:", err);
                // Set individual error states or a general one
                setErrorStats("Failed to load statistics.");
                setErrorRecentStudents("Failed to load recent students.");
                setErrorDashboardCourses("Failed to load dashboard courses.");
                setErrorDashboardQuizzes("Failed to load quizzes overview.");
            }
            finally {
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
                setIsLoadingAllStudents(true);
                setErrorAllStudents(null);
                try {
                    const filters = {};
                    if (studentSearch)
                        filters.search = studentSearch;
                    if (studentStatusFilter !== 'all')
                        filters.status = studentStatusFilter;
                    const data = await apiService.getAdminAllStudents(filters);
                    setAllStudents(data);
                }
                catch (err) {
                    setErrorAllStudents(err.message || "Failed to load students data");
                }
                finally {
                    setIsLoadingAllStudents(false);
                }
            }
            else if (activeTab === "courses") {
                setIsLoadingAllCourses(true);
                setErrorAllCourses(null);
                try {
                    const filters = {};
                    if (courseSearch)
                        filters.search = courseSearch;
                    if (courseStatusFilter !== 'all')
                        filters.status = courseStatusFilter;
                    const data = await apiService.getAdminAllCourses(filters);
                    setAllCourses(data);
                }
                catch (err) {
                    setErrorAllCourses(err.message || "Failed to load courses data");
                }
                finally {
                    setIsLoadingAllCourses(false);
                }
            }
            else if (activeTab === "quizzes") {
                setIsLoadingAllQuizzes(true);
                setErrorAllQuizzes(null);
                try {
                    const filters = {};
                    if (quizSearch)
                        filters.search = quizSearch;
                    if (quizCourseFilter !== 'all')
                        filters.courseId = quizCourseFilter;
                    const data = await apiService.getAdminAllQuizzes(filters);
                    setAllQuizzesData(data);
                }
                catch (err) {
                    setErrorAllQuizzes(err.message || "Failed to load quizzes data");
                }
                finally {
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
        ? allStudents.filter(s => (s.name.toLowerCase().includes(studentSearch.toLowerCase()) || (s.email && s.email.toLowerCase().includes(studentSearch.toLowerCase()))) &&
            (studentStatusFilter === 'all' || s.status === studentStatusFilter))
        : allStudents;
    const filteredCourses = courseSearch || courseStatusFilter !== 'all'
        ? allCourses.filter(c => c.title.toLowerCase().includes(courseSearch.toLowerCase()) &&
            (courseStatusFilter === 'all' || c.status === courseStatusFilter))
        : allCourses;
    const filteredQuizzes = quizSearch || quizCourseFilter !== 'all'
        ? allQuizzesData.filter(q => q.title.toLowerCase().includes(quizSearch.toLowerCase()) &&
            (quizCourseFilter === 'all' || q.courseId === quizCourseFilter))
        : allQuizzesData;
    // --- Helper Functions ---
    const getStatusBadgeClasses = (status) => {
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
        }
        catch (error) {
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
    const DataDisplayWrapper = ({ isLoading, error, children, loadingText = "Loading data...", count, noDataMessage = "No data available." }) => {
        if (isLoading) {
            return _jsxs("div", { className: "flex items-center justify-center p-4 min-h-[100px]", children: [_jsx(Loader2, { className: "mr-2 h-5 w-5 animate-spin" }), " ", loadingText] });
        }
        if (error) {
            return _jsxs("div", { className: "flex items-center justify-center p-4 text-red-500 min-h-[100px]", children: [_jsx(AlertCircle, { className: "mr-2 h-5 w-5" }), " Error: ", error] });
        }
        if (count !== undefined && count === 0 && !isLoading && !error) {
            return _jsx("div", { className: "p-4 text-center text-gray-500 dark:text-gray-400 min-h-[100px]", children: noDataMessage });
        }
        return _jsx(_Fragment, { children: children });
    };
    return (_jsxs("div", { className: "container px-4 py-8 md:px-6 lg:py-12", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-8 lg:mb-12 gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: `text-3xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`, children: "Admin Dashboard" }), _jsx("p", { className: `${secondaryTextLight} ${secondaryTextDark} mt-1`, children: "Manage courses, students, and program content" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Link, { to: "/admin/settings", children: _jsxs(Button, { variant: "outline", size: "sm", className: outlineButtonClasses, children: [_jsx(Settings, { className: "mr-2 h-4 w-4" }), "Settings"] }) }), _jsxs(Button, { variant: "outline", size: "sm", className: `${outlineButtonClasses} text-red-600 dark:text-red-400 border-red-400/50 dark:border-red-400/50 hover:border-red-600 dark:hover:border-red-400 hover:text-red-700 dark:hover:text-red-300`, onClick: handleLogout, disabled: authLoading, children: [_jsx(LogOut, { className: "mr-2 h-4 w-4" }), "Logout"] })] })] }), _jsxs(Tabs, { defaultValue: "dashboard", value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: `grid w-full grid-cols-2 md:grid-cols-4 mb-8 rounded-lg p-1 ${tabsListBgLight} ${tabsListBgDark}`, children: [_jsx(TabsTrigger, { value: "dashboard", className: `flex-1 sm:flex-auto ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200`, children: "Dashboard" }), _jsx(TabsTrigger, { value: "students", className: `flex-1 sm:flex-auto ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200`, children: "Students" }), _jsx(TabsTrigger, { value: "courses", className: `flex-1 sm:flex-auto ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200`, children: "Courses" }), _jsx(TabsTrigger, { value: "quizzes", className: `flex-1 sm:flex-auto ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200`, children: "Quizzes" })] }), _jsxs(TabsContent, { value: "dashboard", className: "space-y-8", children: [_jsx(DataDisplayWrapper, { isLoading: isLoadingStats, error: errorStats, count: dashboardStats.length, loadingText: "Loading statistics...", children: _jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: dashboardStats.map((stat) => {
                                        const IconComponent = IconMap[stat.iconName] || HelpCircle;
                                        return (_jsxs(Card, { className: `${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`, children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: `text-sm font-medium ${mutedTextLight} ${mutedTextDark}`, children: stat.title }), _jsx("div", { className: `rounded-full p-2 inline-block bg-gray-100 dark:bg-gray-700`, children: _jsx(IconComponent, { className: `h-5 w-5 ${secondaryTextLight} ${secondaryTextDark}` }) })] }), _jsxs(CardContent, { children: [_jsx("div", { className: `text-2xl font-bold ${primaryTextLight} ${primaryTextDark}`, children: stat.value }), _jsx("p", { className: `text-xs ${mutedTextLight} ${mutedTextDark}`, children: stat.change })] })] }, stat.id));
                                    }) }) }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [_jsxs(Card, { className: `lg:col-span-1 ${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`, children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: `${primaryTextLight} ${primaryTextDark} font-serif`, children: "Recent Students" }), _jsx(CardDescription, { className: `${secondaryTextLight} ${secondaryTextDark}`, children: "Overview of student activity" })] }), _jsx(CardContent, { children: _jsx(DataDisplayWrapper, { isLoading: isLoadingRecentStudents, error: errorRecentStudents, count: recentStudents.length, loadingText: "Loading recent students...", noDataMessage: "No recent student activity.", children: _jsx("div", { className: "space-y-4", children: recentStudents.map((student) => ( // Use recentStudents from state
                                                        _jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(UserCircle, { className: `h-8 w-8 ${mutedTextLight} ${mutedTextDark} flex-shrink-0` }), _jsxs("div", { children: [_jsx("p", { className: `text-sm font-medium ${primaryTextLight} ${primaryTextDark}`, children: student.name }), _jsx("p", { className: `text-xs ${mutedTextLight} ${mutedTextDark}`, children: student.courseName })] })] }), _jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [_jsx(Progress, { value: student.progress, className: "h-2 w-16 sm:w-20 [&>div]:bg-[#C5A467]" }), _jsxs("span", { className: `text-xs font-medium ${secondaryTextLight} ${secondaryTextDark}`, children: [student.progress, "%"] })] })] }, student.id))) }) }) }), _jsx(CardFooter, { children: _jsxs(Button, { variant: "outline", size: "sm", className: `w-full ${outlineButtonClasses}`, onClick: () => setActiveTab('students'), children: ["Manage Students ", _jsx(ArrowUpRight, { className: "ml-1 h-4 w-4" })] }) })] }), _jsxs(Card, { className: `lg:col-span-2 ${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`, children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: `${primaryTextLight} ${primaryTextDark} font-serif`, children: "Course Status" }), _jsx(CardDescription, { className: `${secondaryTextLight} ${secondaryTextDark}`, children: "Overview of program courses" })] }), _jsx(CardContent, { className: "space-y-3", children: _jsx(DataDisplayWrapper, { isLoading: isLoadingDashboardCourses, error: errorDashboardCourses, count: dashboardCourses.length, loadingText: "Loading courses...", noDataMessage: "No courses to display.", children: dashboardCourses.map((course) => ( // Use dashboardCourses from state
                                                    _jsxs("div", { className: `flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border ${tableBorderLight} ${tableBorderDark} gap-3`, children: [_jsxs("div", { className: "flex items-center gap-3 flex-1", children: [_jsx(BookOpen, { className: `h-5 w-5 text-[${accentColor}] flex-shrink-0` }), _jsxs("div", { children: [_jsx("p", { className: `font-medium ${primaryTextLight} ${primaryTextDark}`, children: course.title }), _jsx("p", { className: `text-xs ${mutedTextLight} ${mutedTextDark}`, children: course.startDate && course.endDate ? `${new Date(course.startDate).toLocaleDateString()} - ${new Date(course.endDate).toLocaleDateString()}` : 'Dates N/A' })] })] }), _jsxs("div", { className: "flex items-center gap-4 mt-2 sm:mt-0 flex-shrink-0", children: [_jsxs("div", { className: `flex items-center gap-1 text-sm ${secondaryTextLight} ${secondaryTextDark}`, children: [_jsx(Users, { className: "h-4 w-4" }), _jsx("span", { children: course.studentCount })] }), _jsx("div", { children: _jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(course.status)}`, children: course.status.charAt(0).toUpperCase() + course.status.slice(1) }) }), _jsx(Button, { variant: "ghost", size: "sm", className: `${ghostButtonClasses} text-xs px-2 py-1 h-auto`, onClick: () => {
                                                                            navigate(`/admin/courses?courseId=${course.courseId || course.id}`); // Navigate or switch tab
                                                                            // setActiveTab('courses'); // Optionally switch tab as well
                                                                        }, children: "View" })] })] }, course.id))) }) }), _jsx(CardFooter, { children: _jsxs(Button, { variant: "outline", size: "sm", className: `w-full ${outlineButtonClasses}`, onClick: () => setActiveTab('courses'), children: ["Manage Courses ", _jsx(ArrowUpRight, { className: "ml-1 h-4 w-4" })] }) })] })] }), _jsxs(Card, { className: `${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`, children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: `${primaryTextLight} ${primaryTextDark} font-serif`, children: "Quizzes Overview" }), _jsx(CardDescription, { className: `${secondaryTextLight} ${secondaryTextDark}`, children: "Recent and upcoming quiz status" })] }), _jsx(CardContent, { children: _jsx(DataDisplayWrapper, { isLoading: isLoadingDashboardQuizzes, error: errorDashboardQuizzes, count: dashboardQuizzes.length, loadingText: "Loading quizzes overview...", noDataMessage: "No quizzes to display.", children: _jsx("div", { className: "space-y-3", children: dashboardQuizzes.map((quiz) => ( // Use dashboardQuizzes from state
                                                _jsxs("div", { className: "flex items-center justify-between gap-4 border-b pb-2 last:border-b-0 last:pb-0", children: [_jsxs("div", { children: [_jsx("p", { className: `text-sm font-medium ${primaryTextLight} ${primaryTextDark}`, children: quiz.title }), _jsx("p", { className: `text-xs ${mutedTextLight} ${mutedTextDark}`, children: quiz.courseName })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("span", { className: `text-sm ${secondaryTextLight} ${secondaryTextDark}`, children: [quiz.submittedCount, "/", quiz.totalEligible, " Submitted"] }), _jsxs("div", { className: `flex items-center gap-2 text-xs flex-shrink-0 ${mutedTextLight} ${mutedTextDark}`, children: [_jsx(Clock, { className: "h-3.5 w-3.5" }), _jsxs("span", { children: ["Due: ", quiz.dueDate ? new Date(quiz.dueDate).toLocaleDateString() : 'N/A'] })] })] })] }, quiz.id))) }) }) }), _jsx(CardFooter, { children: _jsxs(Button, { variant: "outline", size: "sm", className: `w-full ${outlineButtonClasses}`, onClick: () => setActiveTab('quizzes'), children: ["Manage Quizzes ", _jsx(ArrowUpRight, { className: "ml-1 h-4 w-4" })] }) })] })] }), _jsxs(TabsContent, { value: "students", className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-center gap-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row gap-2 w-full md:w-auto", children: [_jsxs("div", { className: "relative flex-1 md:w-64", children: [_jsx(Search, { className: `absolute left-2.5 top-2.5 h-4 w-4 ${mutedTextLight} ${mutedTextDark}` }), _jsx(Input, { placeholder: "Search students...", className: `pl-8 ${inputClasses}`, value: studentSearch, onChange: (e) => setStudentSearch(e.target.value) })] }), _jsxs(Select, { value: studentStatusFilter, onValueChange: setStudentStatusFilter, children: [_jsx(SelectTrigger, { className: selectTriggerClasses, children: _jsx(SelectValue, { placeholder: "Filter by status" }) }), _jsxs(SelectContent, { className: selectContentClasses, children: [_jsx(SelectItem, { value: "all", children: "All Statuses" }), _jsx(SelectItem, { value: "active", children: "Active" }), _jsx(SelectItem, { value: "at risk", children: "At Risk" }), _jsx(SelectItem, { value: "inactive", children: "Inactive" }), _jsx(SelectItem, { value: "completed", children: "Completed" })] })] })] }), _jsxs(Link, { to: "/admin/students/manage", children: [" ", _jsxs(Button, { className: primaryButtonClasses, children: [_jsx(Users, { className: "mr-2 h-4 w-4" }), "Manage All Students"] })] })] }), _jsx(Card, { className: `${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`, children: _jsx(CardContent, { className: "p-0", children: _jsx(DataDisplayWrapper, { isLoading: isLoadingAllStudents, error: errorAllStudents, count: filteredStudents.length, loadingText: "Loading students...", noDataMessage: "No students found matching your criteria.", children: _jsx("div", { className: "relative w-full overflow-x-auto", children: _jsxs("table", { className: "w-full caption-bottom text-sm", children: [_jsx("thead", { className: `${tableHeaderBgLight} ${tableHeaderBgDark}`, children: _jsxs("tr", { children: [_jsx("th", { className: tableHeaderClasses, children: "Name" }), _jsx("th", { className: tableHeaderClasses, children: "Email" }), _jsx("th", { className: tableHeaderClasses, children: "Current Course" }), _jsx("th", { className: tableHeaderClasses, children: "Progress" }), _jsx("th", { className: tableHeaderClasses, children: "Status" }), _jsx("th", { className: `${tableHeaderClasses} text-right`, children: "Actions" })] }) }), _jsx("tbody", { className: `divide-y ${tableBorderLight} ${tableBorderDark}`, children: filteredStudents.map((student) => ( // Use filteredStudents (derived from allStudents state)
                                                        _jsxs("tr", { className: `${tableRowBgLight} ${tableRowBgDark}`, children: [_jsx("td", { className: `p-4 align-middle font-medium ${primaryTextLight} ${primaryTextDark}`, children: student.name }), _jsx("td", { className: tableCellClasses, children: student.email }), _jsx("td", { className: tableCellClasses, children: student.courseName }), _jsx("td", { className: tableCellClasses, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Progress, { value: student.progress, className: `h-1.5 w-20 sm:w-24 [&>div]:${student.status === 'at risk' ? 'bg-yellow-500' : `bg-[${accentColor}]`}` }), _jsxs("span", { className: "text-xs font-medium", children: [student.progress, "%"] })] }) }), _jsx("td", { className: tableCellClasses, children: _jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(student.status)}`, children: student.status.charAt(0).toUpperCase() + student.status.slice(1) }) }), _jsx("td", { className: `${tableCellClasses} text-right`, children: _jsxs("div", { className: "flex items-center justify-end gap-1", children: [_jsxs(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} h-8 w-8`, onClick: () => navigate(`/admin/student/${student.id}`), children: [_jsx("span", { className: "sr-only", children: "View Student" }), _jsx(Eye, { className: "h-4 w-4" })] }), _jsxs(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} h-8 w-8`, onClick: () => navigate(`/admin/student/${student.id}/edit`), children: [_jsx("span", { className: "sr-only", children: "Edit Student" }), _jsx(Edit, { className: "h-4 w-4" })] })] }) })] }, student.id))) })] }) }) }) }) })] }), _jsxs(TabsContent, { value: "courses", className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-center gap-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row gap-2 w-full md:w-auto", children: [_jsxs("div", { className: "relative flex-1 md:w-64", children: [_jsx(Search, { className: `absolute left-2.5 top-2.5 h-4 w-4 ${mutedTextLight} ${mutedTextDark}` }), _jsx(Input, { placeholder: "Search courses...", className: `pl-8 ${inputClasses}`, value: courseSearch, onChange: (e) => setCourseSearch(e.target.value) })] }), _jsxs(Select, { value: courseStatusFilter, onValueChange: setCourseStatusFilter, children: [_jsx(SelectTrigger, { className: selectTriggerClasses, children: _jsx(SelectValue, { placeholder: "Filter by status" }) }), _jsxs(SelectContent, { className: selectContentClasses, children: [_jsx(SelectItem, { value: "all", children: "All Statuses" }), _jsx(SelectItem, { value: "active", children: "Active" }), _jsx(SelectItem, { value: "upcoming", children: "Upcoming" }), _jsx(SelectItem, { value: "completed", children: "Completed" }), _jsx(SelectItem, { value: "archived", children: "Archived" })] })] })] }), _jsxs(Link, { to: "/admin/courses/manage", children: [" ", _jsxs(Button, { className: primaryButtonClasses, children: [_jsx(BookOpen, { className: "mr-2 h-4 w-4" }), "Manage Course Structure"] })] })] }), _jsx(Card, { className: `${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`, children: _jsx(CardContent, { className: "p-0", children: _jsx(DataDisplayWrapper, { isLoading: isLoadingAllCourses, error: errorAllCourses, count: filteredCourses.length, loadingText: "Loading courses...", noDataMessage: "No courses found matching your criteria.", children: _jsx("div", { className: "relative w-full overflow-x-auto", children: _jsxs("table", { className: "w-full caption-bottom text-sm", children: [_jsx("thead", { className: `${tableHeaderBgLight} ${tableHeaderBgDark}`, children: _jsxs("tr", { children: [_jsx("th", { className: tableHeaderClasses, children: "Course Title" }), _jsx("th", { className: tableHeaderClasses, children: "Students" }), _jsx("th", { className: tableHeaderClasses, children: "Start Date" }), _jsx("th", { className: tableHeaderClasses, children: "End Date" }), _jsx("th", { className: tableHeaderClasses, children: "Status" }), _jsx("th", { className: `${tableHeaderClasses} text-right`, children: "Actions" })] }) }), _jsx("tbody", { className: `divide-y ${tableBorderLight} ${tableBorderDark}`, children: filteredCourses.map((course) => ( // Use filteredCourses (derived from allCourses state)
                                                        _jsxs("tr", { className: `${tableRowBgLight} ${tableRowBgDark}`, children: [_jsx("td", { className: `p-4 align-middle font-medium ${primaryTextLight} ${primaryTextDark}`, children: course.title }), _jsx("td", { className: tableCellClasses, children: course.studentCount }), _jsx("td", { className: tableCellClasses, children: course.startDate ? new Date(course.startDate).toLocaleDateString() : 'N/A' }), _jsx("td", { className: tableCellClasses, children: course.endDate ? new Date(course.endDate).toLocaleDateString() : 'N/A' }), _jsx("td", { className: tableCellClasses, children: _jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(course.status)}`, children: course.status.charAt(0).toUpperCase() + course.status.slice(1) }) }), _jsx("td", { className: `${tableCellClasses} text-right`, children: _jsx("div", { className: "flex items-center justify-end gap-1", children: _jsx(Link, { to: `/admin/courses/manage/${course.courseId || course.id}`, children: _jsxs(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} h-8 w-8`, children: [_jsx("span", { className: "sr-only", children: "Manage Course Content" }), _jsx(Edit, { className: "h-4 w-4" })] }) }) }) })] }, course.id))) })] }) }) }) }) })] }), _jsxs(TabsContent, { value: "quizzes", className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-center gap-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row gap-2 w-full md:w-auto", children: [_jsxs("div", { className: "relative flex-1 md:w-64", children: [_jsx(Search, { className: `absolute left-2.5 top-2.5 h-4 w-4 ${mutedTextLight} ${mutedTextDark}` }), _jsx(Input, { placeholder: "Search quizzes...", className: `pl-8 ${inputClasses}`, value: quizSearch, onChange: (e) => setQuizSearch(e.target.value) })] }), _jsxs(Select, { value: quizCourseFilter, onValueChange: setQuizCourseFilter, children: [_jsx(SelectTrigger, { className: selectTriggerClasses, children: _jsx(SelectValue, { placeholder: "Filter by course" }) }), _jsxs(SelectContent, { className: selectContentClasses, children: [_jsx(SelectItem, { value: "all", children: "All Courses" }), [...new Map(allCourses.map(c => [c.id, c])).values()].map(course => (_jsx(SelectItem, { value: course.id, children: course.title }, course.id)))] })] })] }), _jsxs(Link, { to: "/admin/quizzes/manage", children: [" ", _jsxs(Button, { className: primaryButtonClasses, children: [_jsx(HelpCircle, { className: "mr-2 h-4 w-4" }), "Manage All Quizzes"] })] })] }), _jsx(Card, { className: `${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`, children: _jsx(CardContent, { className: "p-0", children: _jsx(DataDisplayWrapper, { isLoading: isLoadingAllQuizzes, error: errorAllQuizzes, count: filteredQuizzes.length, loadingText: "Loading quizzes...", noDataMessage: "No quizzes found matching your criteria.", children: _jsx("div", { className: "relative w-full overflow-x-auto", children: _jsxs("table", { className: "w-full caption-bottom text-sm", children: [_jsx("thead", { className: `${tableHeaderBgLight} ${tableHeaderBgDark}`, children: _jsxs("tr", { children: [_jsx("th", { className: tableHeaderClasses, children: "Quiz Title" }), _jsx("th", { className: tableHeaderClasses, children: "Course" }), _jsx("th", { className: tableHeaderClasses, children: "Due Date" }), _jsx("th", { className: tableHeaderClasses, children: "Submissions" }), _jsx("th", { className: `${tableHeaderClasses} text-right`, children: "Actions" })] }) }), _jsx("tbody", { className: `divide-y ${tableBorderLight} ${tableBorderDark}`, children: filteredQuizzes.map((quiz) => ( // Use filteredQuizzes (derived from allQuizzesData state)
                                                        _jsxs("tr", { className: `${tableRowBgLight} ${tableRowBgDark}`, children: [_jsx("td", { className: `p-4 align-middle font-medium ${primaryTextLight} ${primaryTextDark}`, children: quiz.title }), _jsx("td", { className: tableCellClasses, children: quiz.courseName }), _jsx("td", { className: tableCellClasses, children: quiz.dueDate ? new Date(quiz.dueDate).toLocaleDateString() : 'N/A' }), _jsxs("td", { className: tableCellClasses, children: [quiz.submittedCount, "/", quiz.totalEligible] }), _jsx("td", { className: `${tableCellClasses} text-right`, children: _jsxs("div", { className: "flex items-center justify-end gap-1", children: [_jsx(Link, { to: `/admin/quizzes/${quiz.id}/submissions`, children: _jsxs(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} h-8 w-8`, children: [_jsx("span", { className: "sr-only", children: "View Submissions" }), _jsx(Eye, { className: "h-4 w-4" })] }) }), _jsx(Link, { to: `/admin/quizzes/${quiz.id}/edit`, children: _jsxs(Button, { variant: "ghost", size: "icon", className: `${ghostButtonClasses} h-8 w-8`, children: [_jsx("span", { className: "sr-only", children: "Edit Quiz" }), _jsx(Edit, { className: "h-4 w-4" })] }) })] }) })] }, quiz.id))) })] }) }) }) }) })] })] })] }));
}
