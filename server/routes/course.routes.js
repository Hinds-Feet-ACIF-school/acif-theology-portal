// server/routes/course.routes.js

import express from "express"; // <--- ADD THIS LINE
import * as CourseController from "../controllers/course.controller.js";
import {
  verifyToken,
  isAdmin,
  isInstructor
} from "../middleware/auth.middleware.js";

const router = express.Router(); // Now 'express' is defined

// Your existing routes...
router.get(
    "/public/overview",
    CourseController.getPublicCourseOverview
);

router.get(
    "/content/my-program",
    verifyToken,
    CourseController.getAccessibleContent
);

router.post(
    "/",
    verifyToken,
    isInstructor,
    CourseController.createCourse
);

// This is the route that was causing the "Forbidden" error for students
// when CourseDetailPage.tsx tried to fetch course details.
// Make sure to adjust its protection as discussed previously if students should access it.
router.get(
    "/:courseId",
    verifyToken,
    // isInstructor, // Consider removing or adjusting this if students need to see basic course details
    CourseController.getCourse
);

router.put(
    "/:courseId",
    verifyToken,
    isInstructor,
    CourseController.updateCourse
);

router.delete(
    "/:courseId",
    verifyToken,
    isInstructor,
    CourseController.deleteCourse
);

router.get(
    "/admin/all",
    verifyToken,
    isAdmin,
    CourseController.getAllCoursesForAdmin
);

export default router;