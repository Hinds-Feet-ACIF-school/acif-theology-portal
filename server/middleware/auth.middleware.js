// server/middleware/auth.middleware.js

import jwt from 'jsonwebtoken';
// import { auth } from "../config/firebase.config.js"; // Keep if used elsewhere, but not directly in these middlewares

/**
 * (Strict Authentication)
 * Verifies the JWT token from the Authorization header.
 * If the token is valid, populates req.user and calls next().
 * If the token is missing, invalid, or expired, it sends a 401 response.
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided or malformed header.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: Token not found in header.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Decoded token payload (e.g., { uid, role, email, etc. })
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Unauthorized: Token expired.', code: 'TOKEN_EXPIRED' });
      }
      console.warn('Token verification failed:', error.message); // Log for debugging
      return res.status(401).json({ message: 'Unauthorized: Invalid token.' });
    }
  } catch (error) {
    console.error('Unexpected error in verifyToken middleware:', error);
    return res.status(500).json({ message: 'Internal server error during authentication.' });
  }
};

/**
 * (Optional Authentication - like checkAuthStatus)
 * Attempts to verify the JWT token from the Authorization header.
 * If the token is valid, populates req.user.
 * If the token is missing, invalid, or expired, sets req.user to null.
 * Always calls next(), allowing the request to proceed.
 * Useful for routes that behave differently for authenticated vs. unauthenticated users.
 */
export const checkOptionalAuth = async (req, res, next) => {
  req.user = null; // Initialize req.user to null
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          req.user = decoded; // Set req.user if token is valid
        } catch (error) {
          // Token is invalid (e.g., expired, malformed).
          // We don't send an error response here, just log it and leave req.user as null.
          if (error.name === 'TokenExpiredError') {
            console.warn('Optional auth: Token expired for request to:', req.originalUrl);
          } else {
            console.warn('Optional auth: Invalid token for request to:', req.originalUrl, error.message);
          }
          // req.user remains null
        }
      }
    }
  } catch (error) {
    // This catch is for unexpected errors within the middleware logic itself,
    // not for token verification errors which are handled above.
    console.error('Unexpected error in checkOptionalAuth middleware for request to:', req.originalUrl, error);
    // req.user remains null
  }
  next(); // Always proceed
};


// Role-based authorization middlewares (these remain the same)

export const isAdmin = (req, res, next) => {
  // This middleware should always run AFTER verifyToken or checkOptionalAuth
  if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Forbidden: User role information unavailable. Ensure you are authenticated.' });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  next();
};


export const isInstructor = (req, res, next) => {
  // This middleware should always run AFTER verifyToken or checkOptionalAuth
  if (!req.user || !req.user.role) {
       return res.status(403).json({ message: 'Forbidden: User role information unavailable. Ensure you are authenticated.' });
  }

  const allowedRoles = ["instructor", "admin"]; // Admin can do everything an instructor can

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden: Instructor or Admin access required" });
  }
  next();
};


export const authorizeRole = (requiredRolesInput) => {
  const requiredRoles = Array.isArray(requiredRolesInput) ? requiredRolesInput : [requiredRolesInput];

  return (req, res, next) => {
    // This middleware should always run AFTER verifyToken or checkOptionalAuth
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Forbidden: User role information unavailable. Ensure you are authenticated.' });
    }

    const userRole = req.user.role;
    let authorized = false;

    if (requiredRoles.includes(userRole)) {
        authorized = true;
    } else if (userRole === 'admin' && (requiredRoles.includes('instructor') || requiredRoles.includes('student') /* or any other role admin should implicitly have */)) {
        // Admins often have implicit access to roles below them.
        // Customize this logic if 'admin' should only have explicitly assigned 'admin' role permissions.
        // For instance, if an admin should also be able to do what an instructor can:
        if (requiredRoles.includes('instructor')) authorized = true;
        if (requiredRoles.includes('student')) authorized = true; // Example: admin can also do what student can
    }


    if (!authorized) {
      return res.status(403).json({ message: `Forbidden: Your role ('${userRole}') does not have permission to access this resource. Required: ${requiredRoles.join(' or ')}.` });
    }
    next();
  };
};