import * as AssignmentModel from "../models/assignment.model.js";
import * as WeekModel from "../models/week.model.js";
import * as UserModel from "../models/user.model.js";


export const createAssignment = async (req, res) => {
    try {
        const assignmentData = req.body;
        const { uid } = req.user;


        if (!assignmentData.weekId || !assignmentData.title) {
            return res.status(400).json({ message: "weekId and title are required." });
        }


        const week = await WeekModel.getWeekById(assignmentData.weekId);
        if (!week) {
            return res.status(404).json({ message: `Week with ID ${assignmentData.weekId} not found.` });
        }

        assignmentData.createdBy = uid;

        const newAssignment = await AssignmentModel.createAssignment(assignmentData);
        res.status(201).json({ message: "Assignment created successfully", assignment: newAssignment });

    } catch (error) {
        console.error("Error creating assignment:", error);
        res.status(500).json({ message: `Failed to create assignment: ${error.message}` });
    }
};


export const getAssignmentById = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const assignment = await AssignmentModel.getAssignmentById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }
        res.status(200).json(assignment);
    } catch (error) {
        console.error(`Error getting assignment ${req.params.assignmentId}:`, error);
        res.status(500).json({ message: `Failed to get assignment: ${error.message}` });
    }
};


export const getAssignmentsByWeek = async (req, res) => {
    try {
        const { weekId } = req.params;
        if (!weekId) {
             return res.status(400).json({ message: "weekId parameter is required." });
        }
        const assignments = await AssignmentModel.getAssignmentsByWeekId(weekId);
        res.status(200).json(assignments);
    } catch (error) {
        console.error(`Error getting assignments for week ${req.params.weekId}:`, error);
        res.status(500).json({ message: `Failed to get assignments: ${error.message}` });
    }
};

export const updateAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const assignmentData = req.body;


        const existing = await AssignmentModel.getAssignmentById(assignmentId);
        if (!existing) {
             return res.status(404).json({ message: "Assignment not found" });
        }

        const updatedAssignment = await AssignmentModel.updateAssignment(assignmentId, assignmentData);
        res.status(200).json({ message: "Assignment updated successfully", assignment: updatedAssignment });

    } catch (error) {
        console.error(`Error updating assignment ${req.params.assignmentId}:`, error);
        res.status(500).json({ message: `Failed to update assignment: ${error.message}` });
    }
};

export const deleteAssignment = async (req, res) => {
     try {
        const { assignmentId } = req.params;



        await AssignmentModel.deleteAssignment(assignmentId);
        res.status(200).json({ message: "Assignment deleted successfully." });
    } catch (error) {
        console.error(`Error deleting assignment ${req.params.assignmentId}:`, error);
        res.status(500).json({ message: `Failed to delete assignment: ${error.message}` });
    }
};


export const submitAssignment = async (req, res) => {
    try {
        const submissionData = req.body;
        const { uid, name: userName, displayName } = req.user;
        const { assignmentId } = req.params;

        if (!assignmentId) {
             return res.status(400).json({ message: "assignmentId parameter is required." });
        }


        const assignment = await AssignmentModel.getAssignmentById(assignmentId);
        if (!assignment) return res.status(404).json({ message: "Assignment not found." });
        const week = await WeekModel.getWeekById(assignment.weekId);
        if (!week) return res.status(404).json({ message: "Parent week not found." });



        const dataToSubmit = {
            ...submissionData,
            assignmentId: assignmentId,
            userId: uid,
            userName: displayName || userName || "Unknown User",
            weekId: assignment.weekId,
            courseId: week.courseId,
        };

        const newSubmission = await AssignmentModel.submitAssignment(dataToSubmit);
        res.status(201).json({ message: "Assignment submitted successfully", submissionId: newSubmission.id });

    } catch (error) {
        console.error(`Error submitting assignment ${req.params.assignmentId} for user ${req.user.uid}:`, error);
        res.status(500).json({ message: `Failed to submit assignment: ${error.message}` });
    }
};

export const gradeSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const gradeData = req.body;
        const { uid: graderId } = req.user;

         if (gradeData.grade === undefined || gradeData.grade === null) {
            return res.status(400).json({ message: "A numeric grade value is required." });
        }


        const submission = await AssignmentModel.getSubmissionById(submissionId);
        if (!submission) return res.status(404).json({ message: "Submission not found." });

        gradeData.gradedBy = graderId;

        const updatedSubmission = await AssignmentModel.gradeSubmission(submissionId, gradeData);
        res.status(200).json({ message: "Submission graded successfully", submission: updatedSubmission });

    } catch (error) {
         console.error(`Error grading submission ${req.params.submissionId}:`, error);
         res.status(500).json({ message: `Failed to grade submission: ${error.message}` });
    }
};

export const getSubmissionsByAssignment = async (req, res) => {
     try {
        const { assignmentId } = req.params;
        if (!assignmentId) {
             return res.status(400).json({ message: "assignmentId parameter is required." });
        }
        const submissions = await AssignmentModel.getSubmissionsByAssignment(assignmentId);
        res.status(200).json(submissions);
    } catch (error) {
        console.error(`Error getting submissions for assignment ${req.params.assignmentId}:`, error);
        res.status(500).json({ message: `Failed to get submissions: ${error.message}` });
    }
};

export const getMySubmissionForAssignment = async (req, res) => {
     try {
        const { assignmentId } = req.params;
        const { uid: userId } = req.user;
        if (!assignmentId) {
             return res.status(400).json({ message: "assignmentId parameter is required." });
        }
        const submission = await AssignmentModel.getUserSubmissionForAssignment(userId, assignmentId);
         if (!submission) {

            return res.status(404).json({ message: "No submission found for this assignment." });
        }
        res.status(200).json(submission);
    } catch (error) {
        console.error(`Error getting user submission for assignment ${req.params.assignmentId}:`, error);
        res.status(500).json({ message: `Failed to get submission: ${error.message}` });
    }
};


export const getMySubmissions = async (req, res) => {
     try {
        const { uid: userId } = req.user;
        const submissions = await AssignmentModel.getSubmissionsByUser(userId);
        res.status(200).json(submissions);
    } catch (error) {
        console.error(`Error getting user submissions for user ${req.user.uid}:`, error);
        res.status(500).json({ message: `Failed to get submissions: ${error.message}` });
    }
};