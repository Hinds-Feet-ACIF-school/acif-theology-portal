import { db } from "../config/firebase.config.js";
import { FieldValue } from 'firebase-admin/firestore';

const coursesCollection = db.collection("courses");
const weeksCollection = db.collection("weeks");


export const getAllCourseOverviews = async () => {
    try {
        const coursesSnapshot = await db.collection('courses')
                                         .orderBy('monthOrder', 'asc')
                                         .get();
        const courses = [];
        coursesSnapshot.forEach(doc => {
            const data = doc.data();
            courses.push({
                id: doc.id,
                title: data.title || 'Untitled Course',
                description: data.description || '',
                monthOrder: data.monthOrder || 0,
            });
        });
        return courses;
    } catch (error) {
        console.error("Error fetching all course overviews from Firestore:", error);
        throw new Error("Database error fetching course overviews.");
    }
};


export const createCourse = async (courseData) => {
  try {
    if (!courseData.title || !courseData.monthOrder) {
      throw new Error("Course title and monthOrder are required.");
    }
    if (courseData.monthOrder < 1 || courseData.monthOrder > 6) {
       throw new Error("monthOrder must be between 1 and 6.");
    }

    const courseRef = await coursesCollection.add({
      title: courseData.title,
      description: courseData.description || "",
      monthOrder: courseData.monthOrder,
      instructor: courseData.instructor || null,
      instructorName: courseData.instructorName || "",
      ects: courseData.ects || null,
      thumbnail: courseData.thumbnail || "",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { id: courseRef.id };
  } catch (error) {
    console.error("Error creating course in model:", error);
    throw new Error(`Error creating course: ${error.message}`);
  }
};


export const getCourseById = async (courseId) => {
  try {
    const courseDoc = await coursesCollection.doc(courseId).get();

    if (!courseDoc.exists) {
      return null;
    }
    const courseData = courseDoc.data();
    if (courseData.createdAt && courseData.createdAt.toDate) {
         courseData.createdAt = courseData.createdAt.toDate();
    }
    if (courseData.updatedAt && courseData.updatedAt.toDate) {
         courseData.updatedAt = courseData.updatedAt.toDate();
    }
    return { id: courseDoc.id, ...courseData };
  } catch (error) {
    console.error(`Error getting course by ID (${courseId}):`, error);
    throw new Error(`Database error getting course ${courseId}: ${error.message}`);
  }
};


export const updateCourse = async (courseId, courseData) => {
  try {
    const courseRef = coursesCollection.doc(courseId);

    if (courseData.monthOrder && (courseData.monthOrder < 1 || courseData.monthOrder > 6)) {
       throw new Error("monthOrder must be between 1 and 6.");
    }

    delete courseData.id;
    delete courseData.createdAt;

    const updateData = {
      ...courseData,
      updatedAt: FieldValue.serverTimestamp(),
    };

    await courseRef.update(updateData);

    const updatedDocData = await getCourseById(courseId); // Re-fetch to get resolved timestamp
    return updatedDocData;

  } catch (error) {
    console.error(`Error updating course (${courseId}):`, error);
    if (error.code === 5) { // NOT_FOUND
        throw new Error(`Cannot update course: Course with ID ${courseId} not found.`);
    }
    throw new Error(`Database error updating course ${courseId}: ${error.message}`);
  }
};


export const deleteCourse = async (courseId) => {
  try {

    await coursesCollection.doc(courseId).delete();

    console.log(`Course ${courseId} deleted.`);


    return { success: true, message: "Course deleted successfully" };
  } catch (error) {
    console.error(`Error deleting course (${courseId}):`, error);
     if (error.code === 5) { // NOT_FOUND
        return { success: false, message: `Course with ID ${courseId} not found.` }; // Return failure object
    }
    throw new Error(`Database error deleting course ${courseId}: ${error.message}`);
  }
};


export const getAllCourses = async () => {
  try {
    const coursesSnapshot = await coursesCollection.orderBy("monthOrder", "asc").get();
    const courses = [];

    coursesSnapshot.forEach((doc) => {
       const courseData = doc.data();
        if (courseData.createdAt && courseData.createdAt.toDate) {
             courseData.createdAt = courseData.createdAt.toDate();
        }
        if (courseData.updatedAt && courseData.updatedAt.toDate) {
             courseData.updatedAt = courseData.updatedAt.toDate();
        }
       courses.push({ id: doc.id, ...courseData });
    });

    return courses;
  } catch (error) {
    console.error("Error getting all courses:", error);
    throw new Error(`Database error getting all courses: ${error.message}`);
  }
};


export const getCoursesByInstructor = async (instructorId) => {
  try {
    const coursesSnapshot = await coursesCollection.where("instructor", "==", instructorId).orderBy("monthOrder", "asc").get();
    const courses = [];

    coursesSnapshot.forEach((doc) => {
       const courseData = doc.data();
        if (courseData.createdAt && courseData.createdAt.toDate) {
             courseData.createdAt = courseData.createdAt.toDate();
        }
        if (courseData.updatedAt && courseData.updatedAt.toDate) {
             courseData.updatedAt = courseData.updatedAt.toDate();
        }
       courses.push({ id: doc.id, ...courseData });
    });

    return courses;
  } catch (error) {
    console.error(`Error getting courses by instructor (${instructorId}):`, error);
    throw new Error(`Database error getting courses by instructor: ${error.message}`);
  }
};