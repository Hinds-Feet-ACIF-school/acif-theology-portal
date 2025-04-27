import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";


import UserLayout from "./components/UserLayout";
import AdminLayout from "./components/admin/AdminLayout";


import HomePage from "./pages/Home";
import ProgramOverviewPage from "./pages/ProgramOverView";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/Dashboard";
import CourseIntroductionPage from "./pages/CourseIntroductionPage";
import DiscussionForumPage from "./pages/DiscussionForumPage";


import AdminPage from "./pages/AdminPage";
import AdminCourseManagementPage from "./pages/admin/CourseManagementPage";
import AdminStudentManagementPage from "./pages/admin/StudentManagementPage";

import AdminQuizManagementPage from "./pages/admin/QuizManagementPage";

import AdminReportsPage from "./pages/admin/ReportsPage";
import AdminSettingsPage from "./pages/admin/SettingsPage";





import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <Routes>

        <Route element={<UserLayout />}>

          <Route path="/" element={<HomePage />} />
          <Route path="/program-overview" element={<ProgramOverviewPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/courses" element={<CoursesPage />} />


          <Route element={<ProtectedRoute requiredRole="student" />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/course-introduction" element={<CourseIntroductionPage />} />
            <Route path="/discussions" element={<DiscussionForumPage />} />
            <Route path="/discussions/:courseId" element={<DiscussionForumPage />} />
          </Route>
        </Route>


        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route element={<AdminLayout />}>

            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/courses" element={<AdminCourseManagementPage />} />
            <Route path="/admin/students" element={<AdminStudentManagementPage />} />

            <Route path="/admin/quizzes" element={<AdminQuizManagementPage />} />




            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>



      </Routes>
    </ThemeProvider>
  );
}

export default App;