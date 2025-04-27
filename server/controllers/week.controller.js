import * as WeekModel from "../models/week.model.js";
import * as CourseModel from "../models/course.model.js";

export const createWeek = async (req, res) => {
    try {
        const weekData = req.body;

        if (!weekData.courseId || !weekData.weekNumber || !weekData.title) {
            return res.status(400).json({ message: "courseId, weekNumber, and title are required." });
        }
        if (weekData.weekNumber < 1 || weekData.weekNumber > 4) {
            return res.status(400).json({ message: "weekNumber must be between 1 and 4." });
        }


        const course = await CourseModel.getCourseById(weekData.courseId);
        if (!course) {
            return res.status(404).json({ message: `Course with ID ${weekData.courseId} not found.` });
        }

        const newWeek = await WeekModel.createWeek(weekData);
        res.status(201).json({ message: "Week created successfully", week: newWeek });

    } catch (error) {
        console.error("Error creating week:", error);

        if (error.message.includes("already exists")) {
             return res.status(409).json({ message: error.message });
        }
        res.status(500).json({ message: `Failed to create week: ${error.message}` });
    }
};

export const getWeeksByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        if (!courseId) {
             return res.status(400).json({ message: "courseId parameter is required." });
        }
        const weeks = await WeekModel.getWeeksByCourseId(courseId);
        res.status(200).json(weeks);
    } catch (error) {
        console.error(`Error getting weeks for course ${req.params.courseId}:`, error);
        res.status(500).json({ message: `Failed to get weeks: ${error.message}` });
    }
};

export const updateWeek = async (req, res) => {
    try {
        const { weekId } = req.params;
        const weekData = req.body;

         if (weekData.weekNumber && (weekData.weekNumber < 1 || weekData.weekNumber > 4)) {
            return res.status(400).json({ message: "weekNumber must be between 1 and 4." });
        }




        const updatedWeek = await WeekModel.updateWeek(weekId, weekData);
        res.status(200).json({ message: "Week updated successfully", week: updatedWeek });

    } catch (error) {
        console.error(`Error updating week ${req.params.weekId}:`, error);
        res.status(500).json({ message: `Failed to update week: ${error.message}` });
    }
};

export const deleteWeek = async (req, res) => {
     try {
        const { weekId } = req.params;




        await WeekModel.deleteWeek(weekId);
        res.status(200).json({ message: "Week (and potentially related content) deleted successfully." });

    } catch (error) {
        console.error(`Error deleting week ${req.params.weekId}:`, error);
        res.status(500).json({ message: `Failed to delete week: ${error.message}` });
    }
};