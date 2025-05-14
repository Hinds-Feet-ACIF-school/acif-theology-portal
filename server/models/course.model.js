import { db } from "../config/firebase.config.js";
import { FieldValue } from 'firebase-admin/firestore';

const coursesCollection = db.collection("courses");

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
                monthOrder: data.monthOrder !== undefined ? data.monthOrder : null,
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
    if (!courseData.title || courseData.monthOrder === undefined || courseData.monthOrder === null) {
      throw new Error("Course title and monthOrder are required.");
    }

    if (typeof courseData.monthOrder !== 'number' || !Number.isInteger(courseData.monthOrder) || courseData.monthOrder < 1) {

       throw new Error("monthOrder must be a positive integer.");
    }


    const courseRef = await coursesCollection.add({
      title: courseData.title,
      description: courseData.description || "",
      monthOrder: courseData.monthOrder,
      instructor: courseData.instructor || null,
      instructorName: courseData.instructorName || "",
      ects: (courseData.ects !== undefined && courseData.ects !== null && !isNaN(Number(courseData.ects))) ? Number(courseData.ects) : null,
      thumbnail: courseData.thumbnail || "",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });


    const newCourseDoc = await courseRef.get();
    const newCourseData = newCourseDoc.data();
    return {
        id: courseRef.id,
        ...newCourseData,
        createdAt: newCourseData.createdAt.toDate(),
        updatedAt: newCourseData.updatedAt.toDate()
    };

  } catch (error) {
    console.error("Error creating course in model:", error);

    if (error.message.includes("monthOrder must be")) {
        throw error;
    }
    throw new Error(`Error creating course.`);
  }
};


export const getCourseById = async (courseId) => {
  try {
    const courseDoc = await coursesCollection.doc(courseId).get();

    if (!courseDoc.exists) {
      return null;
    }
    const courseData = courseDoc.data();

    if (courseData.createdAt && typeof courseData.createdAt.toDate === 'function') {
         courseData.createdAt = courseData.createdAt.toDate();
    }
    if (courseData.updatedAt && typeof courseData.updatedAt.toDate === 'function') {
         courseData.updatedAt = courseData.updatedAt.toDate();
    }
    return { id: courseDoc.id, ...courseData };
  } catch (error) {
    console.error(`Error getting course by ID (${courseId}):`, error);
    throw new Error(`Database error getting course ${courseId}.`);
  }
};


export const updateCourse = async (courseId, courseData) => {
  try {
    const courseRef = coursesCollection.doc(courseId);


    if (courseData.monthOrder !== undefined && courseData.monthOrder !== null) {
        if (typeof courseData.monthOrder !== 'number' || !Number.isInteger(courseData.monthOrder) || courseData.monthOrder < 1) {

            throw new Error("monthOrder must be a positive integer.");
        }
    }


    if (courseData.ects !== undefined && courseData.ects !== null) {
        if (isNaN(Number(courseData.ects))) {
            throw new Error("ECTS must be a valid number.");
        }
        courseData.ects = Number(courseData.ects);
    } else if (courseData.hasOwnProperty('ects')) {
         courseData.ects = null;
    }


    delete courseData.id;
    delete courseData.createdAt;

    const updateData = {
      ...courseData,
      updatedAt: FieldValue.serverTimestamp(),
    };

    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    await courseRef.update(updateData);

    const updatedDocData = await getCourseById(courseId);
    return updatedDocData;

  } catch (error) {
    console.error(`Error updating course (${courseId}):`, error);
    if (error.code === 5) {
        throw new Error(`Cannot update course: Course with ID ${courseId} not found.`);
    }

    if (error.message.includes("monthOrder must be") || error.message.includes("ECTS must be")) {
        throw error;
    }
    throw new Error(`Database error updating course ${courseId}.`);
  }
};


export const deleteCourse = async (courseId) => {
  try {


    await coursesCollection.doc(courseId).delete();

    console.log(`Course ${courseId} deleted.`);


    return { success: true, message: "Course deleted successfully" };
  } catch (error) {
    console.error(`Error deleting course (${courseId}):`, error);
     if (error.code === 5) {

        return { success: false, message: `Course with ID ${courseId} not found.` };
    }
    throw new Error(`Database error deleting course ${courseId}.`);
  }
};


export const getAllCourses = async () => {
  try {
    const coursesSnapshot = await coursesCollection.orderBy("monthOrder", "asc").get();
    const courses = [];

    coursesSnapshot.forEach((doc) => {
       const courseData = doc.data();

        if (courseData.createdAt && typeof courseData.createdAt.toDate === 'function') {
             courseData.createdAt = courseData.createdAt.toDate();
        }
        if (courseData.updatedAt && typeof courseData.updatedAt.toDate === 'function') {
             courseData.updatedAt = courseData.updatedAt.toDate();
        }
       courses.push({ id: doc.id, ...courseData });
    });

    return courses;
  } catch (error) {
    console.error("Error getting all courses:", error);
    throw new Error(`Database error getting all courses.`);
  }
};


export const getCoursesByInstructor = async (instructorId) => {
  try {
    const coursesSnapshot = await coursesCollection.where("instructor", "==", instructorId).orderBy("monthOrder", "asc").get();
    const courses = [];

    coursesSnapshot.forEach((doc) => {
       const courseData = doc.data();

        if (courseData.createdAt && typeof courseData.createdAt.toDate === 'function') {
             courseData.createdAt = courseData.createdAt.toDate();
        }
        if (courseData.updatedAt && typeof courseData.updatedAt.toDate === 'function') {
             courseData.updatedAt = courseData.updatedAt.toDate();
        }
       courses.push({ id: doc.id, ...courseData });
    });

    return courses;
  } catch (error) {
    console.error(`Error getting courses by instructor (${instructorId}):`, error);
    throw new Error(`Database error getting courses by instructor.`);
  }
};