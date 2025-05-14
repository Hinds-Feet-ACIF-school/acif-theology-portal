// server/controllers/userCourseAccess.controller.js
import * as userCourseAccessService from '../services/userCourseAccess.service.js';

export const getUserCourseAccessState = async (req, res) => {
  try {
    // req.user will be populated by checkOptionalAuth if token is valid,
    // otherwise it will be null.
    const userId = req.user ? req.user.uid : null;

    const accessState = await userCourseAccessService.getCourseAccessStateForUser(userId);
    res.status(200).json(accessState);
  } catch (error) {
    // The service itself handles internal errors and returns a valid structure,
    // but this catch is for unexpected errors in the controller layer.
    console.error("Controller error in getUserCourseAccessState:", error);
    res.status(500).json({
        courses: [],
        enrollmentMessage: "Failed to retrieve course information due to a server error."
    });
  }
};