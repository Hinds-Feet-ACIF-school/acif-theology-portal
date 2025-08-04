import { db } from "../config/firebase.config.js";

const usersCollection = db.collection("users");
const coursesCollection = db.collection("courses");

const getAllPublicCourses = async () => {
  try {
    const snapshot = await coursesCollection.orderBy("monthOrder", "asc").get();
    const courseList = [];
    snapshot.forEach(doc => courseList.push({ id: doc.id, ...doc.data() }));
    return courseList;
  } catch (error) {
    console.error("Error in getAllPublicCourses:", error);
    return [];
  }
};

const parseCohortId = (cohortId) => {
  // ... (keep this helper function as is from the previous correct version)
  if (!cohortId || typeof cohortId !== 'string' || cohortId.length < 7) {
    return null;
  }
  const monthStr = cohortId.substring(0, 3).toUpperCase();
  const yearStr = cohortId.substring(3);
  const year = parseInt(yearStr, 10);
  if (isNaN(year)) {
    return null;
  }
  let monthIndex;
  let fullMonthName;
  if (monthStr === "JAN") {
    monthIndex = 0; fullMonthName = "January";
  } else if (monthStr === "JUL") {
    monthIndex = 6; fullMonthName = "July";
  } else {
    return null;
  }
  return {
    name: `${fullMonthName} ${year} Intake`,
    startDate: new Date(year, monthIndex, 1),
  };
};


export const getCourseAccessStateForUser = async (userId) => {
  const publicCourses = await getAllPublicCourses();

  try {
    if (!userId) {
      return {
        courses: publicCourses.map(course => ({ ...course, status: 'locked', progress: 0 })),
        enrollmentMessage: "Please log in or sign up to access course materials.",
      };
    }

    const userDoc = await usersCollection.doc(userId).get();
    if (!userDoc.exists) {
      throw new Error("User not found.");
    }

    const userData = userDoc.data();
    const enrolledCohortId = userData.enrollment?.cohortId;
    const userEnrollmentTimestamp = userData.enrollment?.enrollmentDate; // Get user's enrollment date

    if (!enrolledCohortId) {
      return {
        courses: publicCourses.map(course => ({ ...course, status: 'locked', progress: 0 })),
        enrollmentMessage: "You are not currently enrolled in a cohort. Please enroll to access courses.",
      };
    }
     // --- Ensure userEnrollmentDate is valid ---
    if (!userEnrollmentTimestamp || !userEnrollmentTimestamp.toDate) {
        console.error(`User ${userId} in cohort ${enrolledCohortId} has no valid enrollmentDate.`);
        return {
            courses: publicCourses.map(course => ({ ...course, status: 'locked', progress: 0 })),
            enrollmentMessage: "Your enrollment information is incomplete. Please contact support.",
        };
    }
    const userEnrollmentDate = userEnrollmentTimestamp.toDate();
    userEnrollmentDate.setHours(0,0,0,0); // Normalize

    const cohortDetails = parseCohortId(enrolledCohortId);

    if (!cohortDetails) {
      console.error(`Could not parse or understand cohortId "${enrolledCohortId}" for user ${userId}.`);
      return {
        courses: publicCourses.map(course => ({ ...course, status: 'locked', progress: 0 })),
        enrollmentMessage: "There was an issue understanding your cohort enrollment. Please contact support.",
      };
    }

    const cohortStartDate = cohortDetails.startDate; // Already a Date object, normalized
    const cohortName = cohortDetails.name;

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    let enrollmentMessage = null;
    let processedCourses = [];

    if (cohortStartDate > currentDate) {
      // Scenario 1: Enrolled cohort is in the FUTURE (user registered before cohort starts)
      enrollmentMessage = `Your courses for the "${cohortName}" cohort will unlock month by month, starting on ${cohortStartDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.`;
      processedCourses = publicCourses.map(course => ({
        ...course,
        status: 'locked',
        progress: 0,
      }));
    } else {
      // Scenario 2: Enrolled cohort has STARTED or is ONGOING
      
      // Calculate the current "program month" based on how long ago the cohort started
      const currentProgramMonthNumber = 
        (currentDate.getFullYear() - cohortStartDate.getFullYear()) * 12 + 
        (currentDate.getMonth() - cohortStartDate.getMonth()) + 1;

      // Calculate which "program month" was active when the user enrolled in this cohort
      // This determines the first month the user should get access to.
      const userEnrollmentProgramMonthNumber =
        (userEnrollmentDate.getFullYear() - cohortStartDate.getFullYear()) * 12 +
        (userEnrollmentDate.getMonth() - cohortStartDate.getMonth()) + 1;

      // The first monthOrder this user should have access to.
      // It's the later of their enrollment month (relative to cohort start) OR month 1.
      // And it cannot be later than the current actual program month.
      const firstAccessibleMonthOrderForUser = Math.max(1, userEnrollmentProgramMonthNumber);
      
      // If user enrolled in May for a Jan cohort, their enrollment program month is 5.
      // Current program month is also 5.
      // They get month 5. Months 1-4 are locked.

      processedCourses = publicCourses.map(course => {
        let status = 'locked';
        if (course.monthOrder >= firstAccessibleMonthOrderForUser && // Course is at or after user's access start
            course.monthOrder <= currentProgramMonthNumber        // And course is at or before current cohort program month
        ) {
          status = 'active';
        }
        return { ...course, status: status, progress: 0 };
      });

      // Optional: Message if they joined an ongoing cohort late.
      if (firstAccessibleMonthOrderForUser > 1 && firstAccessibleMonthOrderForUser === currentProgramMonthNumber) {
          enrollmentMessage = `Welcome to the "${cohortName}" cohort! You've joined in Month ${firstAccessibleMonthOrderForUser}. Access to previous months is restricted. Future months will unlock progressively.`;
      } else if (firstAccessibleMonthOrderForUser === 1 && currentProgramMonthNumber > 1) {
          enrollmentMessage = `Welcome to the "${cohortName}" cohort! Month ${currentProgramMonthNumber} is currently active.`;
      } else if (firstAccessibleMonthOrderForUser === currentProgramMonthNumber) {
          enrollmentMessage = `Welcome to the "${cohortName}" cohort! Month ${currentProgramMonthNumber} is now available.`;
      }

    }

    return {
      courses: processedCourses,
      enrollmentMessage,
    };

  } catch (error) {
    console.error(`Critical Error in getCourseAccessStateForUser (userId: ${userId}):`, error);
    return {
        courses: publicCourses.map(course => ({ ...course, status: 'locked', progress: 0 })),
        enrollmentMessage: "An unexpected error occurred while loading your course information. Please try again later.",
    };
  }
};