import * as SectionModel from "../models/section.model.js";
import * as QuizModel from "../models/quiz.model.js"; // Ensure this path is correct and QuizModel is set up

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

    if (contentData.richContent && Array.isArray(contentData.richContent)) {
      for (let i = 0; i < contentData.richContent.length; i++) {
        const block = contentData.richContent[i];
        if (block.type === 'quiz' && block.quizContent) {
          if ((!block.quizContent.databaseQuizId || block.quizContent.databaseQuizId === block.quizContent.id) && block.quizContent.title && block.quizContent.questions && block.quizContent.questions.length > 0) {
            const newQuizEntityData = {
              title: block.quizContent.title,
              description: block.quizContent.description,
              questions: block.quizContent.questions,
              settings: block.quizContent.settings,
            };
            const createdMainQuiz = await QuizModel.createMainQuizFromContent(newQuizEntityData);
            contentData.richContent[i].quizContent.databaseQuizId = createdMainQuiz.id;
          }
        }
      }
    }
    
    const updatedSectionContainingNewContent = await SectionModel.addContentToSection(sectionId, contentData);
    const newContentItem = updatedSectionContainingNewContent.content?.find(
        item => item.id === contentData.id || (item.title === contentData.title && item.order === contentData.order)
    ) || updatedSectionContainingNewContent.content?.slice(-1)[0];
    
    res.status(201).json(newContentItem || updatedSectionContainingNewContent);
  } catch (error) {
    console.error(`Error adding content to section ${req.params.sectionId}:`, error);
    res.status(500).json({ message: `Failed to add content: ${error.message || ""}` });
  }
};

export const updateContent = async (req, res) => {
  const { sectionId, contentId } = req.params; // Defined here
  try {
    // ... your existing try block logic ...
    const contentData = req.body;

    if (contentData.richContent && Array.isArray(contentData.richContent)) {
      for (let i = 0; i < contentData.richContent.length; i++) {
        const block = contentData.richContent[i];
        if (block.type === 'quiz' && block.quizContent) {
          if ((!block.quizContent.databaseQuizId || block.quizContent.databaseQuizId === block.quizContent.id) && block.quizContent.title && block.quizContent.questions && block.quizContent.questions.length > 0) {
            const newQuizEntityData = {
              title: block.quizContent.title,
              description: block.quizContent.description || null, // Ensure defined
              questions: block.quizContent.questions || [],     // Ensure defined
              settings: block.quizContent.settings || {},       // Ensure defined
            };
            const createdMainQuiz = await QuizModel.createMainQuizFromContent(newQuizEntityData);
            contentData.richContent[i].quizContent.databaseQuizId = createdMainQuiz.id;
          } else if (block.quizContent.databaseQuizId && block.quizContent.databaseQuizId !== block.quizContent.id) {
            const mainQuizUpdateData = {
                title: block.quizContent.title,
                description: block.quizContent.description || null,
                questions: block.quizContent.questions || [],
                settings: block.quizContent.settings || {},
            };
            await QuizModel.updateQuiz(block.quizContent.databaseQuizId, mainQuizUpdateData);
          }
        }
      }
    }
    const updatedSectionContainingContent = await SectionModel.updateContent(sectionId, contentId, contentData);
    const updatedContentItem = updatedSectionContainingContent.content?.find(item => item.id === contentId);

    res.status(200).json(updatedContentItem || updatedSectionContainingContent);
  } catch (error) {
    // Use req.params.contentId here as contentId from try block is not in scope
    console.error(`Error updating content ${req.params.contentId} in section ${req.params.sectionId}:`, error); 
    res.status(500).json({ message: `Failed to update content: ${error.message || ""}` });
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