import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider.js";


import UserLayout from "./components/UserLayout.js";
import AdminLayout from "./components/admin/AdminLayout.js";


import HomePage from "./pages/Home.js";
import ProgramOverviewPage from "./pages/ProgramOverView.js";
import CoursesPage from "./pages/CoursesPage.js";
import CourseDetailPage from "./pages/CourseDetailPage.js";
import RegisterPage from "./pages/RegisterPage.js";
import LoginPage from "./pages/LoginPage.js";
import DashboardPage from "./pages/Dashboard.js";
import CourseIntroductionPage from "./pages/CourseIntroductionPage.js";
import DiscussionForumPage from "./pages/DiscussionForumPage.js";


import AdminPage from "./pages/AdminPage.js";
import AdminCourseManagementPage from "./pages/admin/CourseManagementPage.js";
import AdminStudentManagementPage from "./pages/admin/StudentManagementPage.js";

import AdminQuizManagementPage from "./pages/admin/QuizManagementPage.js";

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

        <Route element={<UserLayout />}>

          <Route path="/" element={<HomePage />} />
          <Route path="/program-overview" element={<ProgramOverviewPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/contact" element={<ContactUsPage />} />
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

            {/* <Route path="/admin/quizzes" element={<AdminQuizManagementPage />} /> */}




            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>



      </Routes>
    </ThemeProvider>
  );
}

export default App;