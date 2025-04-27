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
        return res.status(401).json({ message: "User information not found in request." });
    }
    const { uid } = req.user;

    const user = await UserModel.getUserById(uid);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.enrollment || !user.enrollment.cohortId) {
      console.log(`User ${uid} requested accessible content but is not enrolled.`);
      return res.status(200).json([]);
    }

    const { cohortId, enrollmentDate: enrollmentTimestamp } = user.enrollment;

    const cohort = await CohortModel.getCohortById(cohortId);
    if (!cohort || !cohort.startDate) {
        console.error(`Cohort details not found or invalid for cohortId: ${cohortId}`);
        return res.status(404).json({ message: "Associated cohort details not found or invalid." });
    }

    const cohortStartDate = cohort.startDate.toDate ? cohort.startDate.toDate() : new Date(cohort.startDate);
    const enrollmentDate = enrollmentTimestamp?.toDate ? enrollmentTimestamp.toDate() : (enrollmentTimestamp ? new Date(enrollmentTimestamp) : cohortStartDate);

    if (isNaN(cohortStartDate.getTime()) || isNaN(enrollmentDate.getTime())) {
         console.error(`Invalid date format detected for user ${uid}. CohortStart: ${cohort.startDate}, Enrollment: ${enrollmentTimestamp}`);
         return res.status(500).json({ message: "Internal error processing enrollment dates." });
    }

    const currentProgramWeekNum = getCurrentWeek(cohortStartDate);
    const studentStartWeekNum = getCurrentWeek(enrollmentDate);

    console.log(`User: ${uid}, Cohort: ${cohortId}, StartDate: ${cohortStartDate.toISOString()}, EnrollDate: ${enrollmentDate.toISOString()}`);
    console.log(`Current Program Week: ${currentProgramWeekNum}, Student Start Week: ${studentStartWeekNum}`);

    const allCourses = await CourseModel.getAllCourseOverviews();
    const accessibleContent = [];

    for (const course of allCourses) {
      const courseWeeks = await WeekModel.getWeeksByCourseId(course.id);
      const accessibleWeeksInCourse = [];

      for (const week of courseWeeks) {
         const absoluteWeekNumber = (course.monthOrder - 1) * 4 + week.weekNumber;

         const isWeekUnlocked = absoluteWeekNumber <= currentProgramWeekNum;
         const isAfterEnrollmentStart = absoluteWeekNumber >= studentStartWeekNum;

         if (isWeekUnlocked && isAfterEnrollmentStart) {
            const materials = await MaterialModel.getMaterialsByWeekId(week.id);
            const quizzes = await QuizModel.getQuizzesByWeekId(week.id);

             const calculatedQuizzes = quizzes.map(q => {
                let dueDate = null;
                if (q.dueDateOffsetDays !== null && q.dueDateOffsetDays >= 0) {
                    const weekStartDate = new Date(cohortStartDate);
                    weekStartDate.setDate(weekStartDate.getDate() + (absoluteWeekNumber - 1) * 7);
                    dueDate = new Date(weekStartDate);
                    dueDate.setDate(dueDate.getDate() + q.dueDateOffsetDays);
                }
                return { ...q, calculatedDueDate: dueDate?.toISOString() || null };
             });

            accessibleWeeksInCourse.push({
              ...week,
              absoluteWeekNumber,
              materials,
              quizzes: calculatedQuizzes,
            });
         }
      }

      if (accessibleWeeksInCourse.length > 0) {
        accessibleContent.push({
          ...course,
          weeks: accessibleWeeksInCourse,
        });
      }
    }

    res.status(200).json(accessibleContent);

  } catch (error) {
    console.error("Error getting accessible content:", error);
    res.status(500).json({ message: "Failed to retrieve accessible content." });
  }
};