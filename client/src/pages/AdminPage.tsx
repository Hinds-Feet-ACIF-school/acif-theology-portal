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
  AdminTabValue
} from "../types/admin"; // Adjust path

// Import common components
import { AdminPageHeader } from "../components/admin/common/AdminPageHeader"; // Adjust path

// Import Dashboard components
import { DashboardStatsGrid } from "../components/admin/dashboard/DashboardStatsGrid"; // Adjust path
import { RecentStudentsCard } from "../components/admin/dashboard/RecentStudentsCard"; // Adjust path
import { DashboardCourseStatusCard } from "../components/admin/dashboard/DashboardCourseStatusCard"; // Adjust path
import { DashboardQuizzesOverviewCard } from "../components/admin/dashboard/DashboardQuizzesOverviewCard"; // Adjust path


export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTabValue>("dashboard");
  const [selectedCohort, setSelectedCohort] = useState<string>("all");
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
  

  // --- Data Fetching useEffect (Dashboard) ---
   useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoadingStats(true);
        setIsLoadingRecentStudents(true);
        setIsLoadingDashboardCourses(true);
        setIsLoadingDashboardQuizzes(true);

        const [statsData, studentsData, coursesData, quizzesData] = await Promise.all([
          apiService.getAdminDashboardStats(),
          apiService.getAdminRecentStudents(),
          apiService.getAdminDashboardCourses(),
          apiService.getAdminDashboardQuizzes(),
        ]);

        // Process stats data to ensure correct icon types
        const processedStats = statsData.map(stat => ({
          ...stat,
          iconName: stat.iconName as keyof typeof IconMap
        }));

        setDashboardStats(processedStats);
        setRecentStudents(studentsData);
        setDashboardCourses(coursesData);
        setDashboardQuizzes(quizzesData);

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
  }, [selectedCohort]);

  // --- Helper Functions ---
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleCohortChange = (cohortId: string) => {
    setSelectedCohort(cohortId);
  };

  const handleManageCourses = () => {
    navigate('/admin/courses');
  };

  const handleManageQuizzes = () => {
    navigate('/admin/quizzes');
  };

  return (
    <div className="container px-4 py-8 md:px-6 lg:py-12">
      <AdminPageHeader 
        onLogout={handleLogout} 
        authLoading={authLoading} 
        onCohortChange={handleCohortChange}
      />

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={(value) => setActiveTab(value as AdminTabValue)} className="w-full">
        <TabsList className={`grid w-full grid-cols-1 mb-8 rounded-lg p-1 ${AdminStyles.tabsListBgLight} ${AdminStyles.tabsListBgDark}`}>
          <TabsTrigger value="dashboard" className={AdminStyles.tabsTriggerClasses}>Dashboard</TabsTrigger>
        </TabsList>

        {/* ============================ DASHBOARD TAB ============================ */}
        <TabsContent value="dashboard" className="space-y-8">
          <DashboardStatsGrid stats={dashboardStats} isLoading={isLoadingStats} error={errorStats} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <DashboardCourseStatusCard
              courses={dashboardCourses}
              isLoading={isLoadingDashboardCourses}
              error={errorDashboardCourses}
            />
            <DashboardQuizzesOverviewCard
              quizzes={dashboardQuizzes}
              isLoading={isLoadingDashboardQuizzes}
              error={errorDashboardQuizzes}
            />
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}