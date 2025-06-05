// src/App.tsx
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";

import UserLayout from "./components/UserLayout";
import AdminLayout from "./components/admin/AdminLayout"; // Make sure this path is correct
import WeekContentPage from './pages/WeekContentPage';

// User-facing Pages
import HomePage from "./pages/Home";
import ProgramOverviewPage from "./pages/ProgramOverView";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/Dashboard"; // This is the User Dashboard
import DiscussionForumPage from "./pages/DiscussionForumPage";
import UserProfilePage from "./pages/UserProfilePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfUsePage from "./pages/TermsOfUsePage";
import RegistrationStatusPage from './pages/RegistrationStatusPage';
import AboutUsPage from "./pages/AboutUsPage";
import ContactUsPage from "./pages/ContactUsPage";
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordConfirmPage from './pages/ResetPasswordConfirmPage';

// Admin Pages
import AdminPage from "./pages/AdminPage"; // Admin Dashboard
import AdminCourseManagementPage from "./pages/admin/CourseManagementPage";
import AdminStudentManagementPage from "./pages/admin/StudentManagementPage";
import AdminReportsPage from "./pages/admin/ReportsPage";
import AdminSettingsPage from "./pages/admin/SettingsPage";

// NEW: Admin Page Content Editor Pages
import AdminHomePageContentEditor from "./pages/admin/content/AdminHomePageContentEditor";
import AdminOverviewPageContentEditor from "./pages/admin/content/AdminOverviewPageContentEditor";
import AdminAboutPageContentEditor from "./pages/admin/content/AdminAboutPageContentEditor";
import AdminContactPageContentEditor from "./pages/admin/content/AdminContactPageContentEditor";
import AdminUserDashboardPageContentEditor from "./pages/admin/content/AdminUserDashboardPageContentEditor";
import AdminFooterContentEditor from "./pages/admin/content/AdminFooterContentEditor";


console.log("VITE_API_BASE_URL from env:", import.meta.env.VITE_API_BASE_URL);

import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <Routes>
        {/* User Routes */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/program-overview" element={<ProgramOverviewPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password-confirm" element={<ResetPasswordConfirmPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfUsePage />} />
          <Route path="/registration-status" element={<RegistrationStatusPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<UserProfilePage />} />
          </Route>

          <Route element={<ProtectedRoute requiredRole="student" />}>
            <Route path="/dashboard" element={<DashboardPage />} /> {/* User Dashboard */}
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/discussions" element={<DiscussionForumPage />} />
            <Route path="/discussions/:courseId" element={<DiscussionForumPage />} />
            <Route path="/courses/:courseId/week/:weekId" element={<WeekContentPage />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminPage />} /> {/* Admin Dashboard */}
            <Route path="/admin/courses" element={<AdminCourseManagementPage />} />
            <Route path="/admin/students" element={<AdminStudentManagementPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />

            {/* NEW: Admin Routes for Page Content Management */}
            <Route path="/admin/pages/home" element={<AdminHomePageContentEditor />} />
            <Route path="/admin/pages/overview" element={<AdminOverviewPageContentEditor />} />
            <Route path="/admin/pages/about" element={<AdminAboutPageContentEditor />} />
            <Route path="/admin/pages/contact" element={<AdminContactPageContentEditor />} />
            <Route path="/admin/pages/user-dashboard" element={<AdminUserDashboardPageContentEditor />} />
            <Route path="/admin/pages/footer" element={<AdminFooterContentEditor />} />
          </Route>
        </Route>

      </Routes>
    </ThemeProvider>
  );
}

export default App;