import { jsx as _jsx_1 } from "react/jsx-runtime";
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
const AdminRoute = () => {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const location = useLocation();
    if (loading) {
        return _jsx_1("div", { className: "flex justify-center items-center h-screen", children: "Loading..." });
    }
    if (!isAuthenticated) {
        return _jsx_1(Navigate, { to: "/login", state: { from: location }, replace: true });
    }
    if (!isAdmin) {
        console.warn("Unauthorized access attempt to admin route.");
        return _jsx_1(Navigate, { to: "/dashboard", replace: true });
    }
    return _jsx_1(Outlet, {});
};
export default AdminRoute;
