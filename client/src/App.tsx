import React, { Suspense, lazy } from "react"; 
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";

import UserLayout from "./components/UserLayout";
import AdminLayout from "./components/admin/AdminLayout";
import WeekContentPage from './pages/WeekContentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';

// --- Fallback for lazy loading ---
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen w-screen">
    Loading page...
  </div>
);

// --- User-facing Pages (Lazy Loaded) ---
const HomePage = lazy(() => import("./pages/Home"));
const ProgramOverviewPage = lazy(() => import("./pages/ProgramOverView"));
const CoursesPage = lazy(() => import("./pages/CoursesPage"));
const CourseDetailPage = lazy(() => import("./pages/CourseDetailPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/Dashboard")); // User Dashboard
const DiscussionForumPage = lazy(() => import("./pages/DiscussionForumPage"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsOfUsePage = lazy(() => import("./pages/TermsOfUsePage"));
const RegistrationStatusPage = lazy(() => import('./pages/RegistrationStatusPage'));
const AboutUsPage = lazy(() => import("./pages/AboutUsPage"));
const ContactUsPage = lazy(() => import("./pages/ContactUsPage"));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordConfirmPage = lazy(() => import('./pages/ResetPasswordConfirmPage'));

// --- Admin Pages (Lazy Loaded) ---
const AdminPage = lazy(() => import("./pages/AdminPage")); 
const AdminCourseManagementPage = lazy(() => import("./pages/admin/CourseManagementPage"));
const AdminStudentManagementPage = lazy(() => import("./pages/admin/StudentManagementPage"));
const AdminReportsPage = lazy(() => import("./pages/admin/ReportsPage"));
const AdminSettingsPage = lazy(() => import("./pages/admin/SettingsPage")); 

// --- Admin Page Content Editor Pages (Lazy Loaded) ---
const AdminHomePageContentEditor = lazy(() => import("./pages/admin/content/AdminHomePageContentEditor"));
const AdminOverviewPageContentEditor = lazy(() => import("./pages/admin/content/AdminOverviewPageContentEditor"));
const AdminAboutPageContentEditor = lazy(() => import("./pages/admin/content/AdminAboutPageContentEditor"));
const AdminContactPageContentEditor = lazy(() => import("./pages/admin/content/AdminContactPageContentEditor"));
const AdminUserDashboardPageContentEditor = lazy(() => import("./pages/admin/content/AdminUserDashboardPageContentEditor"));
const AdminSiteBrandingEditor = lazy(() => import('./pages/admin/content/AdminSiteBrandingEditor')); 

console.log("VITE_API_BASE_URL from env:", import.meta.env.VITE_API_BASE_URL);

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <Suspense fallback={<LoadingFallback />}> {/* Wrap Routes with Suspense */}
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
             <Route path="/payment-success" element={<PaymentSuccessPage />} />

            <Route element={<ProtectedRoute />}> {/* Protects routes needing any authenticated user */}
              <Route path="/profile" element={<UserProfilePage />} />
            </Route>

            <Route element={<ProtectedRoute requiredRole="student" />}> {/* Protects routes needing 'student' role */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:id" element={<CourseDetailPage />} />
              <Route path="/discussions" element={<DiscussionForumPage />} />
              <Route path="/discussions/:courseId" element={<DiscussionForumPage />} />
              <Route path="/courses/:courseId/week/:weekId" element={<WeekContentPage />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute requiredRole="admin" />}> {/* All routes under here require admin role */}
            <Route path="/admin" element={<AdminLayout />}> {/* AdminLayout contains sidebar and <Outlet/> */}
              <Route index element={<AdminPage />} /> {/* /admin */}
              <Route path="courses" element={<AdminCourseManagementPage />} /> {/* /admin/courses */}
              <Route path="students" element={<AdminStudentManagementPage />} /> {/* /admin/students */}
              <Route path="reports" element={<AdminReportsPage />} /> {/* /admin/reports */}
              
              {/* Grouping Page Content Editors */}
              <Route path="pages"> {/* Base path: /admin/pages */}
                <Route path="home" element={<AdminHomePageContentEditor />} />
                <Route path="overview" element={<AdminOverviewPageContentEditor />} />
                <Route path="about" element={<AdminAboutPageContentEditor />} />
                <Route path="contact" element={<AdminContactPageContentEditor />} />
                <Route path="user-dashboard" element={<AdminUserDashboardPageContentEditor />} />
              </Route>

              {/* Grouping Site Settings - including branding */}
              <Route path="settings"> {/* Base path: /admin/settings */}
                <Route path="branding" element={<AdminSiteBrandingEditor />} /> {/* /admin/settings/branding */}
                <Route path="general" element={<AdminSettingsPage />} /> {/* /admin/settings/general - if AdminSettingsPage is for other settings */}
               
              </Route>
              
            </Route>
          </Route>
          
       
        </Routes>
      </Suspense>
    </ThemeProvider>
  );
}

export default App;