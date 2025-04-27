import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
const ProtectedRoute = ({ requiredRole }) => {
    const { isAuthenticated, currentUser, loading } = useAuth();
    const location = useLocation();
    if (loading) {
        return _jsx("div", { className: "flex justify-center items-center min-h-screen", children: "Loading..." });
    }
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/login", state: { from: location }, replace: true });
    }
    if (requiredRole && currentUser) {
        const userRole = currentUser.role;
        let hasPermission = false;
        if (requiredRole === "admin") {
            hasPermission = userRole === "admin";
        }
        else if (requiredRole === "instructor") {
            hasPermission = userRole === "admin" || userRole === "instructor";
        }
        else if (requiredRole === "student") {
            hasPermission = userRole === "admin" || userRole === "instructor" || userRole === "student";
        }
        if (!hasPermission) {
            console.warn(`Unauthorized access attempt to route requiring role: ${requiredRole}. User role: ${userRole}`);
            return _jsx(Navigate, { to: "/dashboard", replace: true });
        }
    }
    return _jsx(Outlet, {});
};
export default ProtectedRoute;
