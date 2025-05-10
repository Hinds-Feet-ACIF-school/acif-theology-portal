import * as CourseModel from "../models/course.model.js";
import * as UserModel from "../models/user.model.js";
import * as CohortModel from "../models/cohort.model.js";
import * as WeekModel from "../models/week.model.js";
import * as MaterialModel from "../models/material.model.js";
import * as QuizModel from "../models/quiz.model.js";

export const getPublicCourseOverview = async (req, res) => {
  try {
    const courses = await CourseModel.getAllCourseOverviews();
    res.status(200).json(courses);
  } catch (error) {
    console.error("Error getting public course overview:", error);
    res.status(500).json({ message: "Failed to load course overview." });
  }
};

export const createCourse = async (req, res) => {
  try {
    const courseData = req.body;
    const { uid, name: instructorName } = req.user;

    if (!courseData.title || !courseData.monthOrder) {
      return res.status(400).json({ message: "Course title and monthOrder are required." });
    }
    if (courseData.monthOrder < 1 || courseData.monthOrder > 6) {
        return res.status(400).json({ message: "monthOrder must be between 1 and 6." });
    }

    courseData.instructor = uid;
    courseData.instructorName = instructorName || 'Unknown Instructor';

    const course = await CourseModel.createCourse(courseData);

    res.status(201).json({
      message: "Course created successfully",
      courseId: course.id,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await CourseModel.getCourseById(courseId);

    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course);
  } catch (error) {
    console.error("Error getting course:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const courseData = req.body;

     if (courseData.monthOrder && (courseData.monthOrder < 1 || courseData.monthOrder > 6)) {
        return res.status(400).json({ message: "monthOrder must be between 1 and 6." });
    }

    if (courseData.instructor === undefined) delete courseData.instructor;

    const updatedCourse = await CourseModel.updateCourse(courseId, courseData);

    if (!updatedCourse) {
         return res.status(404).json({ message: "Course not found or update failed" });
    }

    res.status(200).json({
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await CourseModel.deleteCourse(courseId);

    if (!result.success) {
      return res.status(500).json({ message: result.message || "Failed to delete course" });
    }

    res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllCoursesForAdmin = async (req, res) => {
  try {
    const courses = await CourseModel.getAllCourses();
    res.status(200).json(courses);
  } catch (error) {
    console.error("Error getting all courses for admin:", error);
    res.status(500).json({ message: error.message });
  }
};

const getCurrentWeek = (startDate) => {
  if (!startDate || !(startDate instanceof Date)) return 0;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - startDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
};

export const getAccessibleContent = async (req, res) => {
  try {
    if (!req.user || !req.user.uid) {
        console.error("No user or uid found in request");
        return res.status(401).json({ message: "User information not found in request." });
    }
    const { uid } = req.user;
    console.log(`Processing accessible content request for user: ${uid}`);

    const user = await UserModel.getUserById(uid);
    if (!user) {
        console.error(`User not found in database: ${uid}`);
        return res.status(404).json({ message: "User not found." });
    }

    console.log(`User data retrieved:`, {
        uid: user.uid,
        email: user.email,
        enrollment: user.enrollment,
        createdAt: user.createdAt
    });

    const allCourses = await CourseModel.getAllCourseOverviews();
    console.log(`Found ${allCourses.length} total courses`);

    const accessibleContent = [];
    const processedMonthOrders = new Set();

    for (const course of allCourses) {
        // Skip if we've already processed this month order
        if (processedMonthOrders.has(course.monthOrder)) {
            console.log(`Skipping duplicate month order ${course.monthOrder} for course ${course.id}`);
            continue;
        }

        const courseWeeks = await WeekModel.getWeeksByCourseId(course.id);
        console.log(`Found ${courseWeeks.length} weeks for course ${course.id}`);

        const accessibleWeeksInCourse = [];

        for (const week of courseWeeks) {
            const materials = await MaterialModel.getMaterialsByWeekId(week.id);
            const quizzes = await QuizModel.getQuizzesByWeekId(week.id);

            const calculatedQuizzes = quizzes.map(q => {
                let dueDate = null;
                if (q.dueDateOffsetDays !== null && q.dueDateOffsetDays >= 0) {
                    dueDate = new Date();
                    dueDate.setDate(dueDate.getDate() + q.dueDateOffsetDays);
                }
                return { ...q, calculatedDueDate: dueDate?.toISOString() || null };
            });

            accessibleWeeksInCourse.push({
                ...week,
                absoluteWeekNumber: (course.monthOrder - 1) * 4 + week.weekNumber,
                materials,
                quizzes: calculatedQuizzes,
            });
        }

        // Include the course even if it has no weeks yet
        accessibleContent.push({
            ...course,
            weeks: accessibleWeeksInCourse,
        });
        processedMonthOrders.add(course.monthOrder);
    }

    res.json(accessibleContent);
  } catch (error) {
    console.error("Error in getAccessibleContent:", error);
    res.status(500).json({ message: error.message });
  }
};