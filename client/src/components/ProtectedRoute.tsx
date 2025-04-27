import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js'; 

interface ProtectedRouteProps {
  requiredRole?: "student" | "instructor" | "admin";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { isAuthenticated, currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && currentUser) {
    const userRole = currentUser.role;
    let hasPermission = false;

    if (requiredRole === "admin") {
      hasPermission = userRole === "admin";
    } else if (requiredRole === "instructor") {
      hasPermission = userRole === "admin" || userRole === "instructor";
    } else if (requiredRole === "student") {
      
      hasPermission = userRole === "admin" || userRole === "instructor" || userRole === "student";
    }

    if (!hasPermission) {
     
      console.warn(`Unauthorized access attempt to route requiring role: ${requiredRole}. User role: ${userRole}`);
      return <Navigate to="/dashboard" replace />; 
    }
  }
  return <Outlet />;
};

export default ProtectedRoute;