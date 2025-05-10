// server/controllers/week.controller.js
import * as WeekModel from "../models/week.model.js";
import * as CourseModel from "../models/course.model.js";
import * as SectionModel from "../models/section.model.js";

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
        // Check for 'code' property if error is an object
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

        const week = await WeekModel.getWeekById(weekId); 
        if (!week) {
            return res.status(404).json({ message: "Week not found." });
        }

        const sectionsFromDb = await SectionModel.getSectionsByWeekId(weekId); 
        
        const sectionsWithProcessedContent = (sectionsFromDb || []).map(section => {
            // Prefer .id, fallback to ._id if it exists and .id doesn't
            const sectionIdStr = section.id?.toString() || (section._id ? section._id.toString() : undefined); 
            const processedContent = (section.content || []).map(ci => {
                const contentItemIdStr = ci.id?.toString() || (ci._id ? ci._id.toString() : undefined);
                return {
                    ...ci,
                    id: contentItemIdStr,
                    richContent: (ci.richContent || []).map(rcb => {
                        const rcbIdStr = rcb.id?.toString() || (rcb._id ? rcb._id.toString() : undefined) || `rcb-fallback-${Math.random().toString(36).substring(2)}`;
                        // Handle nested videoContent IDs
                        let processedVideoContent;
                        if (rcb.videoContent) {
                            const videoContentIdStr = rcb.videoContent.id?.toString() || (rcb.videoContent._id ? rcb.videoContent._id.toString() : undefined) || `vc-fallback-${Math.random().toString(36).substring(2)}`;
                            processedVideoContent = { ...rcb.videoContent, id: videoContentIdStr };
                        }
                        // Handle nested quizContent IDs
                        let processedQuizContent;
                        if (rcb.quizContent) {
                            const quizContentIdStr = rcb.quizContent.id?.toString() || (rcb.quizContent._id ? rcb.quizContent._id.toString() : undefined) || `qc-fallback-${Math.random().toString(36).substring(2)}`;
                            processedQuizContent = { ...rcb.quizContent, id: quizContentIdStr };
                        }
                        return {
                            ...rcb,
                            id: rcbIdStr,
                            videoContent: processedVideoContent,
                            quizContent: processedQuizContent,
                        };
                    })
                };
            });
            return { ...section, id: sectionIdStr, content: processedContent };
        });

        const detailedWeek = {
            ...week, 
            id: week.id?.toString() || (week._id ? week._id.toString() : undefined),
            sections: sectionsWithProcessedContent,
        };
        
        console.log("WeekController: Sending detailed week data for weekId:", weekId);
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
        
        const processedSections = (sections || []).map(section => {
            const sectionIdStr = section.id?.toString() || (section._id ? section._id.toString() : undefined);
            const processedContent = (section.content || []).map(ci => {
                const contentItemIdStr = ci.id?.toString() || (ci._id ? ci._id.toString() : undefined);
                return {
                    ...ci,
                    id: contentItemIdStr,
                    richContent: (ci.richContent || []).map(rcb => {
                        const rcbIdStr = rcb.id?.toString() || (rcb._id ? rcb._id.toString() : undefined) || `rcb-fallback-${Math.random().toString(36).substring(2)}`;
                        // Handle nested videoContent IDs
                        let processedVideoContent;
                        if (rcb.videoContent) {
                            const videoContentIdStr = rcb.videoContent.id?.toString() || (rcb.videoContent._id ? rcb.videoContent._id.toString() : undefined) || `vc-fallback-${Math.random().toString(36).substring(2)}`;
                            processedVideoContent = { ...rcb.videoContent, id: videoContentIdStr };
                        }
                        // Handle nested quizContent IDs
                        let processedQuizContent;
                        if (rcb.quizContent) {
                            const quizContentIdStr = rcb.quizContent.id?.toString() || (rcb.quizContent._id ? rcb.quizContent._id.toString() : undefined) || `qc-fallback-${Math.random().toString(36).substring(2)}`;
                            processedQuizContent = { ...rcb.quizContent, id: quizContentIdStr };
                        }
                        return {
                            ...rcb,
                            id: rcbIdStr,
                            videoContent: processedVideoContent,
                            quizContent: processedQuizContent,
                        };
                    })
                };
            });
            return { ...section, id: sectionIdStr, content: processedContent };
        });
        res.status(200).json(processedSections);
    } catch (error) {
        console.error(`Error getting sections for week ${req.params.weekId}:`, error);
        const errorMessage = (error && typeof error === 'object' && error.message) ? error.message : "Unknown error getting sections for week.";
        res.status(500).json({ message: `Failed to get sections: ${errorMessage}` });
    }
};