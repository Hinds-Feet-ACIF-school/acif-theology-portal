// src/App.tsx
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider.js";

import UserLayout from "./components/UserLayout.js";
import AdminLayout from "./components/admin/AdminLayout.js";
import WeekContentPage from './pages/WeekContentPage.js';

import HomePage from "./pages/Home.js";
import ProgramOverviewPage from "./pages/ProgramOverView.js";
import CoursesPage from "./pages/CoursesPage.js";
import CourseDetailPage from "./pages/CourseDetailPage.js";
import RegisterPage from "./pages/RegisterPage.js";
import LoginPage from "./pages/LoginPage.js";
import DashboardPage from "./pages/Dashboard.js";
import CourseIntroductionPage from "./pages/CourseIntroductionPage.js";
import DiscussionForumPage from "./pages/DiscussionForumPage.js";
import UserProfilePage from "./pages/UserProfilePage.js"; // Import the new page

import AdminPage from "./pages/AdminPage.js";
import AdminCourseManagementPage from "./pages/admin/CourseManagementPage.js";
import AdminStudentManagementPage from "./pages/admin/StudentManagementPage.js";
// import AdminQuizManagementPage from "./pages/admin/QuizManagementPage.js"; // Assuming you might add this back
import AdminReportsPage from "./pages/admin/ReportsPage.js";
import AdminSettingsPage from "./pages/admin/SettingsPage.js";
import AboutUsPage from "./pages/AboutUsPage.js";
import ContactUsPage from "./pages/ContactUsPage.js";

import ProtectedRoute from "./components/ProtectedRoute.js";

import "./App.css";

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <Routes>
        {/* Routes accessible to all users, wrapped in UserLayout */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/program-overview" element={<ProgramOverviewPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Routes for authenticated users (students and potentially admins if they also use these) */}
          {/* If Profile is for any authenticated user, it can be here without a specific role */}
          {/* Or if it's specifically for 'student' role, keep it within that ProtectedRoute block */}
          <Route element={<ProtectedRoute />}> {/* Generic authenticated user protection */}
            <Route path="/profile" element={<UserProfilePage />} />
          </Route>

          {/* Student-specific routes */}
          <Route element={<ProtectedRoute requiredRole="student" />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/course-introduction" element={<CourseIntroductionPage />} />
            <Route path="/discussions" element={<DiscussionForumPage />} />
            <Route path="/discussions/:courseId" element={<DiscussionForumPage />} />
            <Route path="/courses/:courseId/week/:weekId" element={<WeekContentPage />} />
          </Route>
        </Route>

        {/* Admin-specific routes, wrapped in AdminLayout and ProtectedRoute */}
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/courses" element={<AdminCourseManagementPage />} />
            <Route path="/admin/students" element={<AdminStudentManagementPage />} />
            {/* <Route path="/admin/quizzes" element={<AdminQuizManagementPage />} /> */}
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            {/* Admins might also access their profile via /profile if the ProtectedRoute above is generic enough,
                or you could duplicate a /admin/profile route if needed for specific admin layout/styling */}
          </Route>
        </Route>

        {/* Fallback for unmatched routes (optional) */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </ThemeProvider>
  );
}

export default App;