import { auth } from "../config/firebase.config.js";
import * as UserModel from "../models/user.model.js";
import * as CourseModel from "../models/course.model.js";
import * as DiscussionModel from "../models/discussion.model.js";
import * as CohortModel from "../models/cohort.model.js";
import * as WeekModel from "../models/week.model.js";


export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error getting all users:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const users = await UserModel.getUsersByRole(role);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error getting users by role:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role) {
        return res.status(400).json({ message: "Role is required." });
    }




    await auth.setCustomUserClaims(userId, { role });
    console.log(`Firebase custom claims set for ${userId} to ${role}`);


    await UserModel.updateUser(userId, { role });
    console.log(`Firestore role updated for ${userId} to ${role}`);


    res.status(200).json({
      message: "User role updated successfully",
    });
  } catch (error) {
    console.error("Error updating user role:", error);

    if (error.code === 'auth/user-not-found') {
        return res.status(404).json({ message: `User with ID ${userId} not found in Firebase Auth.` });
    }
    res.status(500).json({ message: `Failed to update user role: ${error.message}` });
  }
};


export const createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'student', church, country } = req.body;

    if (!email || !password || !firstName || !lastName || !role ) {
        return res.status(400).json({ message: "Missing required fields (email, password, firstName, lastName, role)." });
    }

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });
    console.log(`User created in Firebase Auth: ${userRecord.uid}`);

    await auth.setCustomUserClaims(userRecord.uid, { role });
    console.log(`Custom claims set for ${userRecord.uid}: { role: ${role} }`);

    // Get current month to determine cohort
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();
    
    // Determine if this is a January or July cohort
    const isJanuaryCohort = currentMonth <= 6; // January-June registrations go to January cohort
    const cohortStartDate = isJanuaryCohort 
        ? new Date(currentYear, 0, 1) // January 1st
        : new Date(currentYear, 6, 1); // July 1st

    // Find or create the appropriate cohort
    let cohort;
    try {
        // Try to find an existing cohort for this period
        const allCohorts = await CohortModel.getAllCohorts();
        cohort = allCohorts.find(c => {
            const cohortDate = c.startDate.toDate ? c.startDate.toDate() : new Date(c.startDate);
            return cohortDate.getTime() === cohortStartDate.getTime();
        });

        if (!cohort) {
            // Create a new cohort if none exists
            const cohortName = `${isJanuaryCohort ? 'January' : 'July'} ${currentYear} Cohort`;
            cohort = await CohortModel.createCohort({
                name: cohortName,
                startDate: cohortStartDate
            });
            console.log(`Created new cohort: ${cohortName}`);
        }
    } catch (error) {
        console.error("Error handling cohort assignment:", error);
        // Continue without cohort assignment if there's an error
    }

    // Create user with enrollment if cohort was found/created
    const userData = {
        uid: userRecord.uid,
        email,
        firstName,
        lastName,
        churchAffiliation: church,
        country,
        role,
        enrollment: cohort ? {
            cohortId: cohort.id,
            enrollmentDate: currentDate
        } : null
    };

    await UserModel.createUser(userData);
    console.log(`User document created in Firestore for ${userRecord.uid}`);

    res.status(201).json({
        message: "User created successfully",
        userId: userRecord.uid,
        cohortId: cohort?.id
    });
  } catch (error) {
    console.error("Error creating user:", error);

    if (error.code === 'auth/email-already-exists') {
        return res.status(409).json({ message: 'Email already in use.' });
    }
    if (error.code === 'auth/invalid-password') {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    res.status(500).json({ message: `Failed to create user: ${error.message}` });
  }
};


export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;



    await auth.deleteUser(userId);
    console.log(`User deleted from Firebase Auth: ${userId}`);



    await UserModel.deleteUser(userId);

    console.log(`User document deleted/marked in Firestore for ${userId}`);

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
     if (error.code === 'auth/user-not-found') {

        try {
             await UserModel.deleteUser(userId);
             console.log(`User ${userId} not found in Auth, but removed from Firestore.`);
             return res.status(200).json({ message: "User not found in Auth, removed from database if existed." });
        } catch (dbError) {
             console.error("Error removing user from Firestore after Auth delete failed:", dbError);
             return res.status(500).json({ message: `User not found in Auth, error removing from DB: ${dbError.message}` });
        }
    }
    res.status(500).json({ message: `Failed to delete user: ${error.message}` });
  }
};


export const createCohort = async (req, res) => {
    try {
        const { name, startDate } = req.body;
        if (!name || !startDate) {
            return res.status(400).json({ message: "Cohort name and startDate are required." });
        }

        const cohort = await CohortModel.createCohort({ name, startDate });
        res.status(201).json({ message: "Cohort created successfully", cohortId: cohort.id });
    } catch (error) {
        console.error("Error creating cohort:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getAllCohorts = async (req, res) => {
    try {
        const cohorts = await CohortModel.getAllCohorts();
        res.status(200).json(cohorts);
    } catch (error) {
        console.error("Error getting all cohorts:", error);
        res.status(500).json({ message: error.message });
    }
};

export const enrollUserInCohort = async (req, res) => {
    try {
        const { cohortId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "userId is required in the request body." });
        }


        const user = await UserModel.getUserById(userId);
        if (!user) return res.status(404).json({ message: `User with ID ${userId} not found.` });
        const cohort = await CohortModel.getCohortById(cohortId);
        if (!cohort) return res.status(404).json({ message: `Cohort with ID ${cohortId} not found.` });


        await UserModel.setUserEnrollment(userId, cohortId);

        res.status(200).json({ message: `User ${userId} successfully enrolled in cohort ${cohortId}.` });

    } catch (error) {
        console.error(`Error enrolling user ${req.body.userId} in cohort ${req.params.cohortId}:`, error);
        res.status(500).json({ message: error.message });
    }
};



export const getSystemStats = async (req, res) => {
  try {
    const users = await UserModel.getAllUsers();
    const courses = await CourseModel.getAllCourses();
    const cohorts = await CohortModel.getAllCohorts();

    // Get current date to determine which cohort is active
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();
    
    // Determine if this is a January or July cohort
    const isJanuaryCohort = currentMonth <= 6; // January-June registrations go to January cohort
    const cohortStartDate = isJanuaryCohort 
        ? new Date(currentYear, 0, 1) // January 1st
        : new Date(currentYear, 6, 1); // July 1st

    // Find the current cohort
    const currentCohort = cohorts.find(c => {
        const cohortDate = c.startDate.toDate ? c.startDate.toDate() : new Date(c.startDate);
        return cohortDate.getTime() === cohortStartDate.getTime();
    });

    if (!currentCohort) {
        return res.status(404).json({ message: "No active cohort found" });
    }

    // Filter users for current cohort
    const currentCohortUsers = users.filter(user => 
        user.enrollment && 
        user.enrollment.cohortId === currentCohort.id
    );

    // Calculate user statistics for current cohort
    const totalUsers = currentCohortUsers.length;
    const totalStudents = currentCohortUsers.filter((user) => user.role === "student").length;
    const totalInstructors = currentCohortUsers.filter((user) => user.role === "instructor").length;
    const totalAdmins = currentCohortUsers.filter((user) => user.role === "admin").length;

    // Calculate course statistics for current cohort
    const totalCourses = courses.length;
    const activeCourses = courses.filter(course => course.status === "active").length;

    // Calculate enrollment statistics for current cohort
    const totalEnrollments = currentCohortUsers.filter(user => user.enrollment && user.enrollment.cohortId).length;
    const activeEnrollments = currentCohortUsers.filter(user => 
        user.enrollment && 
        user.enrollment.cohortId && 
        user.status === "active"
    ).length;

    const stats = {
        users: {
            total: totalUsers,
            students: totalStudents,
            instructors: totalInstructors,
            admins: totalAdmins,
        },
        program: {
            totalCourses: totalCourses,
            activeCourses: activeCourses,
            totalCohorts: cohorts.length,
            currentCohort: {
                id: currentCohort.id,
                name: currentCohort.name,
                startDate: currentCohort.startDate,
                isJanuaryCohort
            }
        },
        enrollments: {
            totalActiveStudents: totalEnrollments,
            activeEnrollments: activeEnrollments,
        },
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error getting system stats:", error);
    res.status(500).json({ message: error.message });
  }
};


export const getReportedPosts = async (req, res) => {

  try {
    const discussions = await DiscussionModel.getAllDiscussions();
    const allPosts = [];
    for (const discussion of discussions) {
      const posts = await DiscussionModel.getPostsByDiscussion(discussion.id);
      allPosts.push(...posts);
    }
    const reportedPosts = allPosts.filter((post) => post.isReported);
    res.status(200).json(reportedPosts);
  } catch (error) {
    console.error("Error getting reported posts:", error);
    res.status(500).json({ message: error.message });
  }
};