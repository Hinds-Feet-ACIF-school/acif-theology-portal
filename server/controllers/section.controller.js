import * as SectionModel from "../models/section.model.js";

export const getSectionsByWeek = async (req, res) => {
    try {
        const { weekId } = req.params;
        if (!weekId) {
            return res.status(400).json({ message: "weekId parameter is required." });
        }
        const sections = await SectionModel.getSectionsByWeekId(weekId);
        res.status(200).json(sections || []);
    } catch (error) {
        console.error(`Error getting sections for week ${req.params.weekId}:`, error);
        
        // Check if the error is due to index building
        if (error.message?.includes("index is currently building")) {
            return res.status(503).json({ 
                message: "The database is currently being updated. Please try again in a few moments.",
                details: error.message
            });
        }
        
        if (error.message === "Section not found") {
            return res.status(200).json([]);
        }
        
        res.status(500).json({ 
            message: `Failed to get sections: ${error.message}`,
            details: error.details || error.message
        });
    }
};

export const createSection = async (req, res) => {
    try {
        const sectionData = req.body;
        if (!sectionData.weekId || !sectionData.title || !sectionData.order) {
            return res.status(400).json({ message: "weekId, title, and order are required." });
        }
        const newSection = await SectionModel.createSection(sectionData);
        res.status(201).json(newSection);
    } catch (error) {
        console.error("Error creating section:", error);
        res.status(500).json({ message: `Failed to create section: ${error.message}` });
    }
};

export const updateSection = async (req, res) => {
    try {
        const { sectionId } = req.params;
        const sectionData = req.body;
        const updatedSection = await SectionModel.updateSection(sectionId, sectionData);
        res.status(200).json(updatedSection);
    } catch (error) {
        console.error(`Error updating section ${req.params.sectionId}:`, error);
        res.status(500).json({ message: `Failed to update section: ${error.message}` });
    }
};

export const deleteSection = async (req, res) => {
    try {
        const { sectionId } = req.params;
        await SectionModel.deleteSection(sectionId);
        res.status(200).json({ message: "Section deleted successfully" });
    } catch (error) {
        console.error(`Error deleting section ${req.params.sectionId}:`, error);
        res.status(500).json({ message: `Failed to delete section: ${error.message}` });
    }
};

export const addContentToSection = async (req, res) => {
    try {
        const { sectionId } = req.params;
        const contentData = req.body;
        const updatedSection = await SectionModel.addContentToSection(sectionId, contentData);
        res.status(201).json(updatedSection);
    } catch (error) {
        console.error(`Error adding content to section ${req.params.sectionId}:`, error);
        res.status(500).json({ message: `Failed to add content: ${error.message}` });
    }
};

export const updateContent = async (req, res) => {
    try {
        const { sectionId, contentId } = req.params;
        const contentData = req.body;
        const updatedSection = await SectionModel.updateContent(sectionId, contentId, contentData);
        res.status(200).json(updatedSection);
    } catch (error) {
        console.error(`Error updating content in section ${req.params.sectionId}:`, error);
        res.status(500).json({ message: `Failed to update content: ${error.message}` });
    }
};

export const deleteContent = async (req, res) => {
    try {
        const { sectionId, contentId } = req.params;
        await SectionModel.deleteContent(sectionId, contentId);
        res.status(200).json({ message: "Content deleted successfully" });
    } catch (error) {
        console.error(`Error deleting content from section ${req.params.sectionId}:`, error);
        res.status(500).json({ message: `Failed to delete content: ${error.message}` });
    }
}; 