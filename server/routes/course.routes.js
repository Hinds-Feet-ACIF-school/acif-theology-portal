    // server/routes/course.routes.js

    import express from "express";
    import * as CourseController from "../controllers/course.controller.js";
    import {
    verifyToken,
    isAdmin,
    isInstructor
    } from "../middleware/auth.middleware.js";

    const router = express.Router();

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

    router.get(
        "/:courseId",
        verifyToken,
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

    // NEW ROUTE FOR FETCHING USER'S GRADES FOR A COURSE
    router.get(
        "/:courseId/my-grades",
        verifyToken,
        CourseController.getUserCourseGrades // Assumes getUserCourseGrades exists in CourseController
    );

    export default router;