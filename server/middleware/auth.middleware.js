// middleware/auth.middleware.js

import jwt from 'jsonwebtoken';
import { auth } from "../config/firebase.config.js"; // Keep import if needed elsewhere

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: Malformed token.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Unauthorized: Token expired.', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ message: 'Unauthorized: Invalid token.' });
    }
  } catch (error) {
    console.error('Unexpected error in verifyToken middleware:', error); // Keep essential error log
    return res.status(500).json({ message: 'Internal server error during authentication.' });
  }
};


export const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Forbidden: User role information unavailable.' });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  next();
};


export const isInstructor = (req, res, next) => {
  if (!req.user || !req.user.role) {
       return res.status(403).json({ message: 'Forbidden: User role information unavailable.' });
  }

  const allowedRoles = ["instructor", "admin"];

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden: Instructor or Admin access required" });
  }
  next();
};


export const authorizeRole = (requiredRolesInput) => {
  const requiredRoles = Array.isArray(requiredRolesInput) ? requiredRolesInput : [requiredRolesInput];

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Forbidden: User role information unavailable.' });
    }

    const userRole = req.user.role;
    let authorized = false;

    if (requiredRoles.includes(userRole)) {
        authorized = true;
    } else {
        if (requiredRoles.includes('instructor') && userRole === 'admin') {
            authorized = true;
        }
    }

    if (!authorized) {
      return res.status(403).json({ message: `Forbidden: Your role ('${userRole}') does not have permission to access this resource.` });
    }
    next();
  };
};