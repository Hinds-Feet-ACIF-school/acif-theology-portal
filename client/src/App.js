import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import AdminReportsPage from "./pages/admin/ReportsPage.js";
import AdminSettingsPage from "./pages/admin/SettingsPage.js";
import AboutUsPage from "./pages/AboutUsPage.js";
import ContactUsPage from "./pages/ContactUsPage.js";
import ProtectedRoute from "./components/ProtectedRoute.js";
import "./App.css";
function App() {
    return (_jsx(ThemeProvider, { defaultTheme: "light", children: _jsxs(Routes, { children: [_jsxs(Route, { element: _jsx(UserLayout, {}), children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/program-overview", element: _jsx(ProgramOverviewPage, {}) }), _jsx(Route, { path: "/about", element: _jsx(AboutUsPage, {}) }), _jsx(Route, { path: "/contact", element: _jsx(ContactUsPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/courses", element: _jsx(CoursesPage, {}) }), _jsxs(Route, { element: _jsx(ProtectedRoute, { requiredRole: "student" }), children: [_jsx(Route, { path: "/dashboard", element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "/courses/:id", element: _jsx(CourseDetailPage, {}) }), _jsx(Route, { path: "/course-introduction", element: _jsx(CourseIntroductionPage, {}) }), _jsx(Route, { path: "/discussions", element: _jsx(DiscussionForumPage, {}) }), _jsx(Route, { path: "/discussions/:courseId", element: _jsx(DiscussionForumPage, {}) })] })] }), _jsx(Route, { element: _jsx(ProtectedRoute, { requiredRole: "admin" }), children: _jsxs(Route, { element: _jsx(AdminLayout, {}), children: [_jsx(Route, { path: "/admin", element: _jsx(AdminPage, {}) }), _jsx(Route, { path: "/admin/courses", element: _jsx(AdminCourseManagementPage, {}) }), _jsx(Route, { path: "/admin/students", element: _jsx(AdminStudentManagementPage, {}) }), _jsx(Route, { path: "/admin/reports", element: _jsx(AdminReportsPage, {}) }), _jsx(Route, { path: "/admin/settings", element: _jsx(AdminSettingsPage, {}) })] }) })] }) }));
}
export default App;
