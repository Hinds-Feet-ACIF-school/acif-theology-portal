import { db } from "../config/firebase.config.js";

const sectionsCollection = db.collection("sections");

export const createSection = async (sectionData) => {
    try {
        const docRef = await sectionsCollection.add({
            ...sectionData,
            content: [],
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return { id: docRef.id, ...sectionData, content: [] };
    } catch (error) {
        console.error("Error in createSection:", error);
        throw error;
    }
};
export const getSectionsByWeekId = async (weekId) => {
    try {
        if (!weekId) { // Good practice to validate input
            throw new Error("weekId parameter is required for getSectionsByWeekId.");
        }

        const sectionsSnapshot = await sectionsCollection
            .where("weekId", "==", weekId)
            .orderBy("order", "asc") // Assuming you want them ordered
            .get();

        const sections = [];
        sectionsSnapshot.forEach((doc) => {
            const sectionData = doc.data();
            // Convert Firestore Timestamps to JS Dates for consistency if needed by frontend
            if (sectionData.createdAt && typeof sectionData.createdAt.toDate === 'function') {
                sectionData.createdAt = sectionData.createdAt.toDate();
            }
            if (sectionData.updatedAt && typeof sectionData.updatedAt.toDate === 'function') {
                sectionData.updatedAt = sectionData.updatedAt.toDate();
            }
            sections.push({ id: doc.id, ...sectionData });
        });

        return sections; // This will be an empty array if no sections match the weekId
    } catch (error) {
        console.error("Error in getSectionsByWeekId for weekId:", weekId, error);
        // Rethrow the error so the controller can handle it and send an appropriate response
        throw new Error(`Database error fetching sections for week ${weekId}: ${error.message}`);
    }
};
export const updateSection = async (sectionId, sectionData) => {
    try {
        const sectionRef = sectionsCollection.doc(sectionId);
        const sectionDoc = await sectionRef.get();
        
        if (!sectionDoc.exists) {
            throw new Error("Section not found");
        }

        await sectionRef.update({
            ...sectionData,
            updatedAt: new Date()
        });

        const updatedDoc = await sectionRef.get();
        const updatedData = updatedDoc.data();
        if (updatedData.createdAt?.toDate) updatedData.createdAt = updatedData.createdAt.toDate();
        if (updatedData.updatedAt?.toDate) updatedData.updatedAt = updatedData.updatedAt.toDate();
        
        return { id: updatedDoc.id, ...updatedData };
    } catch (error) {
        console.error("Error in updateSection:", error);
        throw error;
    }
};

export const deleteSection = async (sectionId) => {
    try {
        const sectionRef = sectionsCollection.doc(sectionId);
        const sectionDoc = await sectionRef.get();
        
        if (!sectionDoc.exists) {
            throw new Error("Section not found");
        }

        await sectionRef.delete();
    } catch (error) {
        console.error("Error in deleteSection:", error);
        throw error;
    }
};

export const addContentToSection = async (sectionId, contentData) => {
    try {
        const sectionRef = sectionsCollection.doc(sectionId);
        const sectionDoc = await sectionRef.get();
        
        if (!sectionDoc.exists) {
            throw new Error("Section not found");
        }

        const contentId = db.collection('_').doc().id; // Generate a unique ID
        const content = {
            ...contentData,
            id: contentId,
            createdAt: new Date()
        };

        await sectionRef.update({
            content: [...(sectionDoc.data().content || []), content],
            updatedAt: new Date()
        });

        const updatedDoc = await sectionRef.get();
        const updatedData = updatedDoc.data();
        if (updatedData.createdAt?.toDate) updatedData.createdAt = updatedData.createdAt.toDate();
        if (updatedData.updatedAt?.toDate) updatedData.updatedAt = updatedData.updatedAt.toDate();
        
        return { id: updatedDoc.id, ...updatedData };
    } catch (error) {
        console.error("Error in addContentToSection:", error);
        throw error;
    }
};

export const updateContent = async (sectionId, contentId, contentData) => {
    try {
        const sectionRef = sectionsCollection.doc(sectionId);
        const sectionDoc = await sectionRef.get();
        
        if (!sectionDoc.exists) {
            throw new Error("Section not found");
        }

        const content = sectionDoc.data().content || [];
        const contentIndex = content.findIndex(item => item.id === contentId);
        
        if (contentIndex === -1) {
            throw new Error("Content not found");
        }

        content[contentIndex] = {
            ...content[contentIndex],
            ...contentData,
            updatedAt: new Date()
        };

        await sectionRef.update({
            content,
            updatedAt: new Date()
        });

        const updatedDoc = await sectionRef.get();
        const updatedData = updatedDoc.data();
        if (updatedData.createdAt?.toDate) updatedData.createdAt = updatedData.createdAt.toDate();
        if (updatedData.updatedAt?.toDate) updatedData.updatedAt = updatedData.updatedAt.toDate();
        
        return { id: updatedDoc.id, ...updatedData };
    } catch (error) {
        console.error("Error in updateContent:", error);
        throw error;
    }
};

export const deleteContent = async (sectionId, contentId) => {
    try {
        const sectionRef = sectionsCollection.doc(sectionId);
        const sectionDoc = await sectionRef.get();
        
        if (!sectionDoc.exists) {
            throw new Error("Section not found");
        }

        const content = sectionDoc.data().content || [];
        const updatedContent = content.filter(item => item.id !== contentId);

        await sectionRef.update({
            content: updatedContent,
            updatedAt: new Date()
        });
    } catch (error) {
        console.error("Error in deleteContent:", error);
        throw error;
    }
}; 