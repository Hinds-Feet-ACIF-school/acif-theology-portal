import * as WeekModel from "../models/week.model.js";
import * as CourseModel from "../models/course.model.js";
import * as SectionModel from "../models/section.model.js"; // Keep if getSectionsForWeekRoute uses it

export const createWeek = async (req, res) => {
    try {
        const weekData = req.body;
        if (!weekData.courseId || !weekData.weekNumber || !weekData.title) {
            return res.status(400).json({ message: "courseId, weekNumber, and title are required." });
        }
        const course = await CourseModel.getCourseById(weekData.courseId);
        if (!course) {
            return res.status(404).json({ message: `Course with ID ${weekData.courseId} not found.` });
        }
        const newWeek = await WeekModel.createWeek(weekData);
        res.status(201).json({ message: "Week created successfully", week: newWeek });
    } catch (error) {
        console.error("Error creating week:", error);
        const errorMessage = (error && typeof error === 'object' && error.message) ? error.message : "Unknown error creating week.";
        const errorCode = (error && typeof error === 'object' && 'code' in error) ? error.code : null;

        if (errorMessage.includes("already exists") || errorCode === 11000 || errorMessage.includes("Use update instead")) {
             return res.status(409).json({ message: errorMessage });
        }
        res.status(500).json({ message: `Failed to create week: ${errorMessage}` });
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
        const errorMessage = (error && typeof error === 'object' && error.message) ? error.message : "Unknown error getting weeks by course.";
        res.status(500).json({ message: `Failed to get weeks: ${errorMessage}` });
    }
};

export const getWeekWithDetails = async (req, res) => {
    try {
        const { weekId } = req.params;
        if (!weekId) {
            return res.status(400).json({ message: "weekId parameter is required." });
        }

        // 1. Fetch the basic week data
        const weekData = await WeekModel.getWeekById(weekId); // Assumes this fetches the week document

        if (!weekData) {
            return res.status(404).json({ message: "Week not found." });
        }

        // 2. Fetch all sections for this week.
        // Your SectionModel.getSectionsByWeekId returns section documents.
        // Each section document ALREADY CONTAINS its 'content' array with 'richContent'
        // where 'databaseQuizId' SHOULD HAVE BEEN SAVED by section.controller.js.
        const sectionsFromDb = await SectionModel.getSectionsByWeekId(weekId);

        // 3. Process the fetched data to ensure correct structure and string IDs for frontend
        const processedSections = (sectionsFromDb || []).map(section => {
            const sectionDataFromDb = typeof section.data === 'function' ? section.data() : section; // Handle direct data or Firestore doc snapshot
            
            const processedContent = (sectionDataFromDb.content || []).map(ci => {
                const contentItemDataFromDb = typeof ci.data === 'function' ? ci.data() : ci;
                
                return {
                    ...contentItemDataFromDb,
                    id: ci.id?.toString() || ci._id?.toString() || contentItemDataFromDb.id, // Prioritize existing string id
                    richContent: (contentItemDataFromDb.richContent || []).map(rcb => {
                        const richContentBlockDataFromDb = typeof rcb.data === 'function' ? rcb.data() : rcb;

                        const processedQuizContent = richContentBlockDataFromDb.quizContent ? {
                            ...richContentBlockDataFromDb.quizContent,
                            id: richContentBlockDataFromDb.quizContent.id?.toString() || richContentBlockDataFromDb.quizContent._id?.toString() || richContentBlockDataFromDb.quizContent.id,
                            // CRITICAL: Ensure databaseQuizId is passed through as saved
                            databaseQuizId: richContentBlockDataFromDb.quizContent.databaseQuizId || null 
                        } : undefined;

                        const processedVideoContent = richContentBlockDataFromDb.videoContent ? {
                            ...richContentBlockDataFromDb.videoContent,
                            id: richContentBlockDataFromDb.videoContent.id?.toString() || richContentBlockDataFromDb.videoContent._id?.toString() || richContentBlockDataFromDb.videoContent.id,
                        } : undefined;
                        
                        return {
                            ...richContentBlockDataFromDb,
                            id: rcb.id?.toString() || rcb._id?.toString() || richContentBlockDataFromDb.id,
                            quizContent: processedQuizContent,
                            videoContent: processedVideoContent,
                        };
                    })
                };
            });
            return { 
                ...sectionDataFromDb, 
                id: section.id?.toString() || section._id?.toString() || sectionDataFromDb.id, 
                content: processedContent 
            };
        });
        
        const weekDataFromDb = typeof weekData.data === 'function' ? weekData.data() : weekData;
        const detailedWeek = {
            ...weekDataFromDb,
            id: weekData.id?.toString() || weekData._id?.toString() || weekDataFromDb.id,
            sections: processedSections,
        };

        res.status(200).json(detailedWeek);

    } catch (error) {
        console.error(`Error getting detailed week content for week ${req.params.weekId}:`, error);
        const errorMessage = (error && typeof error === 'object' && error.message) ? error.message : "Unknown error getting week details.";
        res.status(500).json({ message: `Failed to get detailed week content: ${errorMessage}` });
    }
};

export const updateWeek = async (req, res) => {
    try {
        const { weekId } = req.params;
        const weekData = req.body;
        const updatedWeek = await WeekModel.updateWeek(weekId, weekData);
        if (!updatedWeek) {
            return res.status(404).json({ message: "Week not found for update." });
        }
        res.status(200).json({ message: "Week updated successfully", week: updatedWeek });
    } catch (error) {
        console.error(`Error updating week ${req.params.weekId}:`, error);
        const errorMessage = (error && typeof error === 'object' && error.message) ? error.message : "Unknown error updating week.";
        const errorCode = (error && typeof error === 'object' && 'code' in error) ? error.code : null;
        if (errorMessage.includes("already exists") || errorCode === 11000 || errorMessage.includes("Use update instead")) {
             return res.status(409).json({ message: errorMessage });
        }
        res.status(500).json({ message: `Failed to update week: ${errorMessage}` });
    }
};

export const deleteWeek = async (req, res) => {
     try {
        const { weekId } = req.params;
        const result = await WeekModel.deleteWeek(weekId);
        if (!result || (typeof result.deletedCount === 'number' && result.deletedCount === 0 && !result.success) ) {
             return res.status(404).json({ message: "Week not found or unable to delete." });
        }
        res.status(200).json({ message: "Week deleted successfully." });
    } catch (error) {
        console.error(`Error deleting week ${req.params.weekId}:`, error);
        const errorMessage = (error && typeof error === 'object' && error.message) ? error.message : "Unknown error deleting week.";
        res.status(500).json({ message: `Failed to delete week: ${errorMessage}` });
    }
};

export const getSectionsForWeekRoute = async (req, res) => {
    try {
        const { weekId } = req.params;
        if (!weekId) {
            return res.status(400).json({ message: "weekId parameter is required." });
        }
        const sections = await SectionModel.getSectionsByWeekId(weekId);
        res.status(200).json(sections);
    } catch (error) {
        console.error(`Error getting sections for week ${req.params.weekId}:`, error);
        const errorMessage = (error && typeof error === 'object' && error.message) ? error.message : "Unknown error getting sections for week.";
        res.status(500).json({ message: `Failed to get sections: ${errorMessage}` });
    }
};

export const getUserProgress = async (req, res) => {
    try {
        const { weekId } = req.params;
        const userId = req.user?.uid;

        if (!weekId) {
            return res.status(400).json({ message: "weekId parameter is required." });
        }
        if (!userId) {
            return res.status(401).json({ message: "Authentication required." });
        }

        const progress = await WeekModel.getUserProgressForWeek(userId, weekId);
        res.status(200).json(progress);

    } catch (error) {
        console.error(`Error getting user progress for week ${req.params.weekId}, user ${req.user?.uid}:`, error);
        const errorMessage = (error && typeof error === 'object' && error.message) ? error.message : "Unknown error getting user progress.";
        res.status(500).json({ message: `Failed to get user progress: ${errorMessage}` });
    }
};

export const updateUserSectionProgress = async (req, res) => {
    try {
        const { weekId, sectionId } = req.params;
        const userId = req.user?.uid;
        const { completed } = req.body;

        if (!weekId || !sectionId) {
            return res.status(400).json({ message: "weekId and sectionId parameters are required." });
        }
        if (!userId) {
            return res.status(401).json({ message: "Authentication required." });
        }
        if (typeof completed !== 'boolean') {
            return res.status(400).json({ message: "Request body must include a 'completed' boolean field." });
        }

        await WeekModel.updateSectionProgress(userId, weekId, sectionId, completed);
        res.status(200).json({ message: "Progress updated successfully." });

    } catch (error) {
        console.error(`Error updating section progress for week ${req.params.weekId}, section ${req.params.sectionId}, user ${req.user?.uid}:`, error);
        const errorMessage = (error && typeof error === 'object' && error.message) ? error.message : "Unknown error updating progress.";
        res.status(500).json({ message: `Failed to update progress: ${errorMessage}` });
    }
};