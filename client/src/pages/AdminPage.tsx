import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"; // Adjust path
import { useAuth } from "../context/AuthContext"; // Adjust path
import * as apiService from "../services/api"; // Adjust path
import { IconMap } from "../utils/adminUtils"; // Adjust path
import * as AdminStyles from "../styles/adminStyles"; // Adjust path

// Import types
import {
  DashboardStat,
  StudentSummary,
  CourseSummary,
  QuizSummary,
  Student,
  Course,
  Quiz,
  AdminTabValue
} from "../types/admin"; // Adjust path

// Import common components
import { AdminPageHeader } from "../components/admin/common/AdminPageHeader"; // Adjust path

// Import Dashboard components
import { DashboardStatsGrid } from "../components/admin/dashboard/DashboardStatsGrid"; // Adjust path
import { RecentStudentsCard } from "../components/admin/dashboard/RecentStudentsCard"; // Adjust path
import { DashboardCourseStatusCard } from "../components/admin/dashboard/DashboardCourseStatusCard"; // Adjust path
import { DashboardQuizzesOverviewCard } from "../components/admin/dashboard/DashboardQuizzesOverviewCard"; // Adjust path

// Import Students tab components
import { StudentFilters } from "../components/admin/students/StudentFilters"; // Adjust path
import { StudentsTable } from "../components/admin/students/StudentsTable"; // Adjust path

// Import Courses tab components
import { CourseFilters } from "../components/admin/courses/CourseFilters"; // Adjust path
import { CoursesTable } from "../components/admin/courses/CoursesTable"; // Adjust path

// Import Quizzes tab components
import { QuizFilters } from "../components/admin/quizzes/QuizFilters"; // Adjust path
import { QuizzesTable } from "../components/admin/quizzes/QuizzesTable"; // Adjust path


export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTabValue>("dashboard");
  const { logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // --- State for Fetched Data ---
  const [dashboardStats, setDashboardStats] = useState<DashboardStat[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);

  const [recentStudents, setRecentStudents] = useState<StudentSummary[]>([]);
  const [isLoadingRecentStudents, setIsLoadingRecentStudents] = useState(true);
  const [errorRecentStudents, setErrorRecentStudents] = useState<string | null>(null);

  const [dashboardCourses, setDashboardCourses] = useState<CourseSummary[]>([]);
  const [isLoadingDashboardCourses, setIsLoadingDashboardCourses] = useState(true);
  const [errorDashboardCourses, setErrorDashboardCourses] = useState<string | null>(null);

  const [dashboardQuizzes, setDashboardQuizzes] = useState<QuizSummary[]>([]);
  const [isLoadingDashboardQuizzes, setIsLoadingDashboardQuizzes] = useState(true);
  const [errorDashboardQuizzes, setErrorDashboardQuizzes] = useState<string | null>(null);
  
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isLoadingAllStudents, setIsLoadingAllStudents] = useState(false);
  const [errorAllStudents, setErrorAllStudents] = useState<string | null>(null);

  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isLoadingAllCourses, setIsLoadingAllCourses] = useState(false);
  const [errorAllCourses, setErrorAllCourses] = useState<string | null>(null);

  const [allQuizzesData, setAllQuizzesData] = useState<Quiz[]>([]);
  const [isLoadingAllQuizzes, setIsLoadingAllQuizzes] = useState(false);
  const [errorAllQuizzes, setErrorAllQuizzes] = useState<string | null>(null);

  // --- States for Filters ---
  const [studentSearch, setStudentSearch] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState("all");
  const [courseSearch, setCourseSearch] = useState("");
  const [courseStatusFilter, setCourseStatusFilter] = useState("all");
  const [quizSearch, setQuizSearch] = useState("");
  const [quizCourseFilter, setQuizCourseFilter] = useState("all");

  // --- Data Fetching useEffect (Dashboard) ---
   useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoadingStats(true);
      setIsLoadingRecentStudents(true);
      setIsLoadingDashboardCourses(true);
      setIsLoadingDashboardQuizzes(true);
      setErrorStats(null);
      setErrorRecentStudents(null);
      setErrorDashboardCourses(null);
      setErrorDashboardQuizzes(null);

      try {
        const [apiStatsData, studentsData, coursesData, quizzesData] = await Promise.all([
          apiService.getAdminDashboardStats(),
          apiService.getAdminRecentStudents(4),
          apiService.getAdminDashboardCourses(4),
          apiService.getAdminDashboardQuizzes(4)
        ]);

        const processedStatsData = apiStatsData.map(statFromApi => {
          if (Object.prototype.hasOwnProperty.call(IconMap, statFromApi.iconName)) {
            return { ...statFromApi, iconName: statFromApi.iconName as keyof typeof IconMap };
          }
          console.warn(`AdminPage: Unknown iconName "${statFromApi.iconName}" for stat "${statFromApi.title}". Using default.`);
          return { ...statFromApi, iconName: "HelpCircle" as keyof typeof IconMap };
        });
        setDashboardStats(processedStatsData);

        setRecentStudents(studentsData.map(s => ({
            id: s.id, name: s.name,
            courseName: (s as any).courseName || (s as any).course || 'N/A',
            progress: s.progress,
        })));

        setDashboardCourses(coursesData.map(c => ({
            id: c.id, title: c.title,
            studentCount: (c as any).students || (c as any).studentCount,
            status: c.status, startDate: c.startDate, endDate: c.endDate,
            courseId: c.courseId || c.id,
        })));

        setDashboardQuizzes(quizzesData.map(q => ({
            id: q.id, title: q.title,
            courseName: (q as any).courseName || (q as any).course,
            submittedCount: (q as any).submitted || (q as any).submittedCount,
            totalEligible: (q as any).total || (q as any).totalEligible,
            dueDate: q.dueDate, courseId: q.courseId,
        })));

      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        const errorMsg = (err as Error).message || "Failed to load data";
        setErrorStats(errorMsg);
        setErrorRecentStudents(errorMsg);
        setErrorDashboardCourses(errorMsg);
        setErrorDashboardQuizzes(errorMsg);
      } finally {
        setIsLoadingStats(false);
        setIsLoadingRecentStudents(false);
        setIsLoadingDashboardCourses(false);
        setIsLoadingDashboardQuizzes(false);
      }
    };
    fetchDashboardData();
  }, []);

  // --- Data Fetching useEffect (Tabs) ---
  useEffect(() => {
    const fetchTabData = async () => {
      if (activeTab === "students" && !allStudents.length) { // Fetch only if not already fetched or forced refresh
        setIsLoadingAllStudents(true); setErrorAllStudents(null);
        try {
          const filters: any = { };
          if (studentSearch) filters.search = studentSearch;
          if (studentStatusFilter !== 'all') filters.status = studentStatusFilter;
          const data = await apiService.getAdminAllStudents(filters);
          setAllStudents(data);
        } catch (err) { setErrorAllStudents((err as Error).message || "Failed to load students"); }
        finally { setIsLoadingAllStudents(false); }
      } else if (activeTab === "courses" && !allCourses.length) {
        setIsLoadingAllCourses(true); setErrorAllCourses(null);
        try {
          const filters: any = { };
          if (courseSearch) filters.search = courseSearch;
          if (courseStatusFilter !== 'all') filters.status = courseStatusFilter;
          const data = await apiService.getAdminAllCourses(filters);
          setAllCourses(data);
        } catch (err) { setErrorAllCourses((err as Error).message || "Failed to load courses"); }
        finally { setIsLoadingAllCourses(false); }
      } else if (activeTab === "quizzes" && !allQuizzesData.length) {
        setIsLoadingAllQuizzes(true); setErrorAllQuizzes(null);
        try {
          const filters: any = { };
          if (quizSearch) filters.search = quizSearch;
          if (quizCourseFilter !== 'all') filters.courseId = quizCourseFilter;
          const data = await apiService.getAdminAllQuizzes(filters);
          setAllQuizzesData(data);
        } catch (err) { setErrorAllQuizzes((err as Error).message || "Failed to load quizzes"); }
        finally { setIsLoadingAllQuizzes(false); }
      }
    };

    if (activeTab !== "dashboard") {
        fetchTabData(); // Call it when tab changes and data might be needed
    }
  // Add dependencies for filters if you want to re-fetch on filter change.
  // For now, this fetches when tab becomes active and data isn't there.
  // Client-side filtering will happen after this initial fetch.
  // To make it re-fetch on filter change (backend filtering):
  // }, [activeTab, studentSearch, studentStatusFilter, courseSearch, courseStatusFilter, quizSearch, quizCourseFilter]);
  // For client-side filtering as currently implemented, only activeTab is needed here.
  }, [activeTab]); 
  
  // --- Re-fetch tab data when filters change (if backend handles filtering) ---
  // This effect is for when you want the API to do the filtering.
  // If filtering is purely client-side, this effect is not strictly necessary
  // unless you want to refresh data from backend when filters change.
  useEffect(() => {
    const refetchTabDataWithFilters = async () => {
        if (activeTab === "students") {
            setIsLoadingAllStudents(true); setErrorAllStudents(null);
            try {
                const filters: any = {};
                if (studentSearch) filters.search = studentSearch;
                if (studentStatusFilter !== 'all') filters.status = studentStatusFilter;
                const data = await apiService.getAdminAllStudents(filters);
                setAllStudents(data);
            } catch (err) { setErrorAllStudents((err as Error).message || "Failed to load students"); }
            finally { setIsLoadingAllStudents(false); }
        } else if (activeTab === "courses") {
            setIsLoadingAllCourses(true); setErrorAllCourses(null);
            try {
                const filters: any = {};
                if (courseSearch) filters.search = courseSearch;
                if (courseStatusFilter !== 'all') filters.status = courseStatusFilter;
                const data = await apiService.getAdminAllCourses(filters);
                setAllCourses(data);
            } catch (err) { setErrorAllCourses((err as Error).message || "Failed to load courses"); }
            finally { setIsLoadingAllCourses(false); }
        } else if (activeTab === "quizzes") {
            setIsLoadingAllQuizzes(true); setErrorAllQuizzes(null);
            try {
                const filters: any = {};
                if (quizSearch) filters.search = quizSearch;
                if (quizCourseFilter !== 'all') filters.courseId = quizCourseFilter;
                const data = await apiService.getAdminAllQuizzes(filters);
                setAllQuizzesData(data);
            } catch (err) { setErrorAllQuizzes((err as Error).message || "Failed to load quizzes"); }
            finally { setIsLoadingAllQuizzes(false); }
        }
    };

    // Only refetch if not the initial load and not dashboard
    if (activeTab !== "dashboard" && (studentSearch || studentStatusFilter !== 'all' || courseSearch || courseStatusFilter !== 'all' || quizSearch || quizCourseFilter !== 'all')) {
      // Debounce this call if necessary to avoid too many API calls
      const timerId = setTimeout(() => {
          refetchTabDataWithFilters();
      }, 500); // Debounce for 500ms
      return () => clearTimeout(timerId);
    }
  }, [activeTab, studentSearch, studentStatusFilter, courseSearch, courseStatusFilter, quizSearch, quizCourseFilter]);


  // --- Filtering Logic (Client-side) ---
  const filteredStudents = allStudents.filter(s =>
    (s.name.toLowerCase().includes(studentSearch.toLowerCase()) || (s.email && s.email.toLowerCase().includes(studentSearch.toLowerCase()))) &&
    (studentStatusFilter === 'all' || s.status === studentStatusFilter)
  );

  const filteredCourses = allCourses.filter(c =>
    c.title.toLowerCase().includes(courseSearch.toLowerCase()) &&
    (courseStatusFilter === 'all' || c.status === courseStatusFilter)
  );

  const filteredQuizzes = allQuizzesData.filter(q =>
    q.title.toLowerCase().includes(quizSearch.toLowerCase()) &&
    (quizCourseFilter === 'all' || q.courseId === quizCourseFilter)
  );

  // --- Helper Functions ---
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="container px-4 py-8 md:px-6 lg:py-12">
      <AdminPageHeader onLogout={handleLogout} authLoading={authLoading} />

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={(value) => setActiveTab(value as AdminTabValue)} className="w-full">
        <TabsList className={`grid w-full grid-cols-2 md:grid-cols-4 mb-8 rounded-lg p-1 ${AdminStyles.tabsListBgLight} ${AdminStyles.tabsListBgDark}`}>
          <TabsTrigger value="dashboard" className={AdminStyles.tabsTriggerClasses}>Dashboard</TabsTrigger>
          <TabsTrigger value="students" className={AdminStyles.tabsTriggerClasses}>Students</TabsTrigger>
          <TabsTrigger value="courses" className={AdminStyles.tabsTriggerClasses}>Courses</TabsTrigger>
          <TabsTrigger value="quizzes" className={AdminStyles.tabsTriggerClasses}>Quizzes</TabsTrigger>
        </TabsList>

        {/* ============================ DASHBOARD TAB ============================ */}
        <TabsContent value="dashboard" className="space-y-8">
          <DashboardStatsGrid stats={dashboardStats} isLoading={isLoadingStats} error={errorStats} />
          <div className="grid gap-6 lg:grid-cols-3">
            <RecentStudentsCard
              students={recentStudents}
              isLoading={isLoadingRecentStudents}
              error={errorRecentStudents}
              onManageStudents={() => setActiveTab('students')}
            />
            <DashboardCourseStatusCard
              courses={dashboardCourses}
              isLoading={isLoadingDashboardCourses}
              error={errorDashboardCourses}
              onManageCourses={() => setActiveTab('courses')}
            />
          </div>
          <DashboardQuizzesOverviewCard
            quizzes={dashboardQuizzes}
            isLoading={isLoadingDashboardQuizzes}
            error={errorDashboardQuizzes}
            onManageQuizzes={() => setActiveTab('quizzes')}
          />
        </TabsContent>

        {/* ============================ STUDENTS TAB ============================ */}
        <TabsContent value="students" className="space-y-6">
          <StudentFilters
            search={studentSearch}
            onSearchChange={setStudentSearch}
            statusFilter={studentStatusFilter}
            onStatusFilterChange={setStudentStatusFilter}
          />
          <StudentsTable
            students={filteredStudents}
            isLoading={isLoadingAllStudents}
            error={errorAllStudents}
          />
        </TabsContent>

        {/* ============================ COURSES TAB ============================ */}
        <TabsContent value="courses" className="space-y-6">
          <CourseFilters
            search={courseSearch}
            onSearchChange={setCourseSearch}
            statusFilter={courseStatusFilter}
            onStatusFilterChange={setCourseStatusFilter}
          />
          <CoursesTable
            courses={filteredCourses}
            isLoading={isLoadingAllCourses}
            error={errorAllCourses}
          />
        </TabsContent>

        {/* ============================ QUIZZES TAB ============================ */}
        <TabsContent value="quizzes" className="space-y-6">
          <QuizFilters
            search={quizSearch}
            onSearchChange={setQuizSearch}
            courseFilter={quizCourseFilter}
            onCourseFilterChange={setQuizCourseFilter}
            availableCourses={allCourses.map(c => ({id: c.id, title: c.title}))} // Pass unique courses
          />
          <QuizzesTable
            quizzes={filteredQuizzes}
            isLoading={isLoadingAllQuizzes}
            error={errorAllQuizzes}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}