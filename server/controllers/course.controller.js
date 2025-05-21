// server/controllers/course.controller.js
import * as CourseModel from "../models/course.model.js";
import * as WeekModel from "../models/week.model.js";
import * as MaterialModel from "../models/material.model.js";
import * as QuizModel from "../models/quiz.model.js";
import * as UserModel from "../models/user.model.js";
import * as SectionModel from "../models/section.model.js";
import * as QuizSubmissionModel from "../models/quizSubmission.model.js";

export const getPublicCourseOverview = async (req, res) => {
  try {
    const courses = await CourseModel.getAllCourseOverviews();
    res.status(200).json(courses);
  } catch (error) {
    console.error("Error getting public course overview:", error);
    res.status(500).json({ message: error.message || "Failed to load course overview." });
  }
};

export const createCourse = async (req, res) => {
  try {
    const courseData = req.body;
    const { uid: creatorId } = req.user; // ID of the user creating the course

    if (!courseData.title || courseData.monthOrder === undefined || courseData.monthOrder === null) {
      return res.status(400).json({ message: "Course title and monthOrder are required." });
    }

    const parsedMonthOrder = parseInt(courseData.monthOrder, 10);
    if (isNaN(parsedMonthOrder) || parsedMonthOrder < 1) {
      return res.status(400).json({ message: "Month Order must be a positive integer." });
    }

    let parsedEcts = null;
    if (courseData.ects !== undefined && courseData.ects !== null && String(courseData.ects).trim() !== '') {
      parsedEcts = parseInt(courseData.ects, 10);
      if (isNaN(parsedEcts) || parsedEcts < 0) {
        return res.status(400).json({ message: "ECTS must be a non-negative number if provided." });
      }
    }

    const payload = {
      title: courseData.title.trim(),
      description: courseData.description ? courseData.description.trim() : null,
      monthOrder: parsedMonthOrder,
      ects: parsedEcts,
      instructorName: courseData.instructor ? courseData.instructor.trim() : 'Unknown Instructor',
      // If your database schema has an 'instructor' field intended for the typed name, use this:
      // instructor: courseData.instructor ? courseData.instructor.trim() : null,
      // If your database schema has a field like 'creatorId' or 'authorId':
      // creatorId: creatorId,
    };

    // Remove instructor from payload if it's not a direct field for the name in your DB
    // and you are only using instructorName for the display name.
    // This depends on your CourseModel.createCourse and DB schema.
    // For example, if your DB 'instructor' field is a foreign key to users table,
    // you'd set that differently, perhaps with creatorId.
    // If 'instructor' is the text field for the name, the above is fine.
    // Let's assume 'instructorName' is the primary field for display name for now.
    if (payload.hasOwnProperty('instructor') && payload.instructor === payload.instructorName) {
        // If courseData.instructor was passed and it's the same as instructorName,
        // and your DB doesn't need a separate 'instructor' text field, you could delete it.
        // delete payload.instructor; // Only if 'instructor' from req.body is not directly saved as such.
    }


    const newCourse = await CourseModel.createCourse(payload);
    res.status(201).json({
      message: "Course created successfully",
      course: newCourse,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    if (error.message && (error.message.includes("monthOrder must be") || error.message.includes("ECTS must be"))) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to create course. " + (error.message || "") });
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
    console.error(`Error getting course ${req.params.courseId}:`, error);
    res.status(500).json({ message: error.message || "Failed to retrieve course." });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const courseData = req.body; // This contains `instructor` from the frontend form

    const updatePayload = {};

    if (courseData.hasOwnProperty('title') && typeof courseData.title === 'string') {
        updatePayload.title = courseData.title.trim();
    }
    if (courseData.hasOwnProperty('description')) {
        updatePayload.description = typeof courseData.description === 'string' ? courseData.description.trim() : null;
    }

    if (courseData.monthOrder !== undefined && courseData.monthOrder !== null) {
      const parsedMonthOrder = parseInt(courseData.monthOrder, 10);
      if (isNaN(parsedMonthOrder) || parsedMonthOrder < 1) {
        return res.status(400).json({ message: "Month Order must be a positive integer." });
      }
      updatePayload.monthOrder = parsedMonthOrder;
    } else if (courseData.hasOwnProperty('monthOrder')) {
      return res.status(400).json({ message: "Month Order cannot be empty if provided." });
    }

    if (courseData.ects !== undefined && courseData.ects !== null) {
        if (String(courseData.ects).trim() === '') {
            updatePayload.ects = null;
        } else {
            const parsedEcts = parseInt(courseData.ects, 10);
            if (isNaN(parsedEcts) || parsedEcts < 0) {
                return res.status(400).json({ message: "ECTS must be a non-negative number if provided." });
            }
            updatePayload.ects = parsedEcts;
        }
    } else if (courseData.hasOwnProperty('ects')) {
        updatePayload.ects = null;
    }

    if (courseData.hasOwnProperty('instructor')) {
      // This assumes 'instructorName' is the field in your DB for the display name.
      // If your DB uses 'instructor' for the display name, then use:
      // updatePayload.instructor = courseData.instructor ? courseData.instructor.trim() : 'Unknown Instructor';
      updatePayload.instructorName = courseData.instructor ? courseData.instructor.trim() : 'Unknown Instructor';

      // If your 'instructor' field in DB is for something else (like an ID),
      // and the frontend sends 'instructor' as the name, ensure your updatePayload
      // correctly maps to your DB schema.
      // For now, we're setting instructorName based on the form's instructor field.
    }


    if (Object.keys(updatePayload).length === 0) {
        return res.status(400).json({ message: "No valid fields provided for update." });
    }

    const updatedCourse = await CourseModel.updateCourse(courseId, updatePayload);
    res.status(200).json({
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.error(`Error updating course ${req.params.courseId}:`, error);
    if (error.message && (error.message.includes("monthOrder must be") || error.message.includes("ECTS must be") || error.message.includes("not found"))) {
      return res.status(error.message.includes("not found") ? 404 : 400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to update course. " + (error.message || "") });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await CourseModel.deleteCourse(courseId);
    if (!result.success) {
        const statusCode = result.message.includes("not found") ? 404 : 500;
      return res.status(statusCode).json({ message: result.message || "Failed to delete course" });
    }
    res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error(`Error deleting course ${req.params.courseId}:`, error);
    res.status(500).json({ message: error.message || "Failed to delete course." });
  }
};

export const getAllCoursesForAdmin = async (req, res) => {
  try {
    const courses = await CourseModel.getAllCourses();
    res.status(200).json(courses);
  } catch (error) {
    console.error("Error getting all courses for admin:", error);
    res.status(500).json({ message: error.message || "Failed to retrieve courses." });
  }
};

export const getAccessibleContent = async (req, res) => {
  try {
    if (!req.user || !req.user.uid) {
        return res.status(401).json({ message: "Authentication required." });
    }
    // const { uid } = req.user; // uid not directly used in this version of logic
    const allCourses = await CourseModel.getAllCourseOverviews();
    const accessibleContent = [];

    for (const course of allCourses) {
        if (course.monthOrder === null || course.monthOrder === undefined || course.monthOrder < 1) {
            continue;
        }
        const courseWeeks = await WeekModel.getWeeksByCourseId(course.id);
        const accessibleWeeksInCourse = [];
        for (const week of courseWeeks) {
            if (week.weekNumber === null || week.weekNumber === undefined || week.weekNumber < 1) {
                continue;
            }
            const materials = await MaterialModel.getMaterialsByWeekId(week.id);
            const quizzes = await QuizModel.getQuizzesByWeekId(week.id);
            const calculatedQuizzes = quizzes.map(q => ({ ...q, calculatedDueDate: null  }));
            accessibleWeeksInCourse.push({
                ...week,
                absoluteWeekNumber: (course.monthOrder - 1) * 4 + week.weekNumber,
                materials,
                quizzes: calculatedQuizzes,
            });
        }
        accessibleContent.push({
            ...course,
            weeks: accessibleWeeksInCourse,
        });
    }
    res.status(200).json(accessibleContent);
  } catch (error) {
    console.error("Error in getAccessibleContent:", error);
    res.status(500).json({ message: error.message || "Failed to retrieve program content." });
  }
};


export const getUserCourseGrades = async (req, res) => {
  try {
      const { courseId } = req.params;
      const userId = req.user?.uid;

      if (!courseId) {
          return res.status(400).json({ message: "courseId parameter is required." });
      }
      if (!userId) {
          return res.status(401).json({ message: "Authentication required." });
      }

      const course = await CourseModel.getCourseById(courseId);
      if (!course) {
          return res.status(404).json({ message: "Course not found." });
      }

      const weeks = await WeekModel.getWeeksByCourseId(courseId);
      const initialMonthlyProgress = {
          totalItems: 0,
          completedItems: 0,
          overallProgress: 0,
          quizScores: []
      };

      if (!weeks || weeks.length === 0) {
          return res.status(200).json({
              weeklyGrades: [],
              monthlyProgress: initialMonthlyProgress
          });
      }

      const courseGradesSummary = [];
      let overallCourseTotalRelevantItems = 0;
      let overallCourseCompletedRelevantItems = 0;
      const allQuizScoresForMonthly = [];

      for (const week of weeks) {
          const gradedItemsForDisplay = []; // Items to return in the API for UI display
          let weekTotalRelevantItemsForProgress = 0;
          let weekCompletedRelevantItemsForProgress = 0;

          const sections = await SectionModel.getSectionsByWeekId(week.id);
          const sectionProgress = await WeekModel.getUserProgressForWeek(userId, week.id); // Fetches user's completion status for sections

          for (const section of sections) {
              const sectionData = typeof section.data === 'function' ? section.data() : section;
              const currentSectionId = section.id?.toString() || section._id?.toString() || sectionData.id;
              const isSectionMarkedComplete = sectionProgress[currentSectionId] === true;

              // --- Section Completion (Type 1 for Progress) ---
              weekTotalRelevantItemsForProgress++;
              overallCourseTotalRelevantItems++;
              if (isSectionMarkedComplete) {
                  weekCompletedRelevantItemsForProgress++;
                  overallCourseCompletedRelevantItems++;
              }
              gradedItemsForDisplay.push({
                  id: currentSectionId,
                  title: sectionData.title || "Unnamed Section",
                  type: 'section_completion',
                  status: isSectionMarkedComplete ? 'completed' : (sectionProgress[currentSectionId] !== undefined ? 'incomplete' : 'not_started'),
                  isGraded: true, // Per new rule, section_completion is considered for grading/progress
                  progressPercent: isSectionMarkedComplete ? 100 : 0, // Simplified progress for sections
              });

              // Iterate through content items within the section (primarily for quizzes now)
              if (sectionData.content && Array.isArray(sectionData.content)) {
                  for (const contentItem of sectionData.content) {
                      const contentItemData = typeof contentItem.data === 'function' ? contentItem.data() : contentItem;
                      
                      // Handle rich content blocks
                      if (contentItemData.richContent && Array.isArray(contentItemData.richContent)) {
                          for (const richBlock of contentItemData.richContent) {
                              const richBlockData = typeof richBlock.data === 'function' ? richBlock.data() : richBlock;

                              if (richBlockData.type === 'quiz' && richBlockData.quizContent && richBlockData.quizContent.databaseQuizId) {
                                  const quizContent = richBlockData.quizContent;
                                  const actualDatabaseQuizId = quizContent.databaseQuizId;

                                  // --- Quiz Score (Type 2 for Progress) ---
                                  weekTotalRelevantItemsForProgress++;
                                  overallCourseTotalRelevantItems++;

                                  const submission = await QuizModel.getUserSubmissionForQuiz(userId, actualDatabaseQuizId);
                                  const mainQuizDetails = await QuizModel.getQuizById(actualDatabaseQuizId);
                                  const mainQuizSettings = mainQuizDetails?.settings || {};
                                  
                                  let defaultPassingScore = 70; // Global default
                                  if (course && course.settings && typeof course.settings.defaultPassingScore === 'number') {
                                      defaultPassingScore = course.settings.defaultPassingScore;
                                  }
                                  const quizPassingScore = mainQuizSettings?.passingScore ?? quizContent.settings?.passingScore ?? defaultPassingScore;

                                  let quizStatus = 'not_started';
                                  let quizScore = null;
                                  let quizIsGraded = false; // Will be true if submitted

                                  if (submission && typeof submission.score === 'number') {
                                      const passed = submission.score >= quizPassingScore;
                                      quizStatus = passed ? 'passed' : 'failed';
                                      quizScore = submission.score;
                                      quizIsGraded = true; // A submitted quiz is part of the grading display

                                      // Add to monthly quiz scores
                                      allQuizScoresForMonthly.push({
                                          quizId: actualDatabaseQuizId,
                                          title: quizContent.title || mainQuizDetails?.title || "Untitled Quiz",
                                          score: submission.score,
                                          passingScore: quizPassingScore,
                                          passed: passed,
                                          submittedAt: submission.submittedAt
                                      });
                                      
                                      // For progress calculation: an *attempted* quiz counts as "completed" for its slot
                                      weekCompletedRelevantItemsForProgress++;
                                      overallCourseCompletedRelevantItems++;

                                  } else if (submission) { // Submitted but pending grade (e.g., manual)
                                      quizStatus = submission.status || 'pending_grade'; // Use submission status if available
                                      quizIsGraded = true; // It's submitted, so show it in grades
                                      // Does not count towards 'completedRelevantItemsForProgress' until scored.
                                  }
                                  
                                  gradedItemsForDisplay.push({
                                      id: actualDatabaseQuizId,
                                      title: quizContent.title || mainQuizDetails?.title || "Untitled Quiz",
                                      type: 'quiz_score',
                                      score: quizScore,
                                      maxScore: 100, // Assuming max score is 100 for quizzes
                                      isGraded: quizIsGraded,
                                      status: quizStatus,
                                      passingScore: quizPassingScore
                                  });
                              }
                              // Note: We are NO LONGER adding 'note_completion' or text blocks to gradedItemsForDisplay
                              // or counting them towards weekTotalRelevantItemsForProgress / weekCompletedRelevantItemsForProgress
                              // unless they are explicitly part of the `isGraded: true` items in the UI list.
                              // The `gradedItemsForDisplay` will only contain `section_completion` and `quiz_score` if `isGraded` is true for them.
                          }
                      }
                  }
              }
          }

          const overallWeekProgress = weekTotalRelevantItemsForProgress > 0 
              ? Math.round((weekCompletedRelevantItemsForProgress / weekTotalRelevantItemsForProgress) * 100) 
              : 0;

          courseGradesSummary.push({
              weekId: week.id?.toString() || week._id?.toString() || week.id,
              weekNumber: week.weekNumber,
              weekTitle: week.title,
              items: gradedItemsForDisplay, // This list will be filtered by UI based on isGraded again
              overallWeekProgress: overallWeekProgress,
          });
      }

      const overallCourseProgress = overallCourseTotalRelevantItems > 0 
          ? Math.round((overallCourseCompletedRelevantItems / overallCourseTotalRelevantItems) * 100) 
          : 0;

      res.status(200).json({
          weeklyGrades: courseGradesSummary,
          monthlyProgress: {
              totalItems: overallCourseTotalRelevantItems, // Total based on relevant types
              completedItems: overallCourseCompletedRelevantItems, // Completed based on relevant types
              overallProgress: overallCourseProgress,
              quizScores: allQuizScoresForMonthly
          }
      });
  } catch (error) {
      console.error(`[getUserCourseGrades] Error for course ${req.params.courseId}, user ${req.user?.uid}:`, error);
      res.status(500).json({ message: "Failed to get course grades. " + (error.message || "Unknown error") });
  }
};