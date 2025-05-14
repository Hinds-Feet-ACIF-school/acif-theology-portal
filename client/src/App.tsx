// src/App.tsx
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider.js";

import UserLayout from "./components/UserLayout";
import AdminLayout from "./components/admin/AdminLayout.js";
import WeekContentPage from './pages/WeekContentPage';

import HomePage from "./pages/Home";
import ProgramOverviewPage from "./pages/ProgramOverView";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage.js";
import DashboardPage from "./pages/Dashboard";
import DiscussionForumPage from "./pages/DiscussionForumPage.js";
import UserProfilePage from "./pages/UserProfilePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage.js"; 
import TermsOfUsePage from "./pages/TermsOfUsePage.js";    
import RegistrationStatusPage from './pages/RegistrationStatusPage';

import AdminPage from "./pages/AdminPage.js";
import AdminCourseManagementPage from "./pages/admin/CourseManagementPage";
import AdminStudentManagementPage from "./pages/admin/StudentManagementPage";
import AdminReportsPage from "./pages/admin/ReportsPage.js";
import AdminSettingsPage from "./pages/admin/SettingsPage.js";
import AboutUsPage from "./pages/AboutUsPage";
import ContactUsPage from "./pages/ContactUsPage";

console.log("VITE_API_BASE_URL from env:", import.meta.env.VITE_API_BASE_URL);



import ProtectedRoute from "./components/ProtectedRoute.js";

import "./App.css";

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <Routes>
        <Route element={<UserLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/program-overview" element={<ProgramOverviewPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfUsePage />} />
          <Route path="/registration-status" element={<RegistrationStatusPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<UserProfilePage />} />
          </Route>

          <Route element={<ProtectedRoute requiredRole="student" />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/discussions" element={<DiscussionForumPage />} />
            <Route path="/discussions/:courseId" element={<DiscussionForumPage />} />
            <Route path="/courses/:courseId/week/:weekId" element={<WeekContentPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/courses" element={<AdminCourseManagementPage />} />
            <Route path="/admin/students" element={<AdminStudentManagementPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>

      </Routes>
    </ThemeProvider>
  );
}

export default App;