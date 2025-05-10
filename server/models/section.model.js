import { db } from "../config/firebase.config.js";

const sectionsCollection = db.collection("sections");

export const getSectionsByWeekId = async (weekId) => {
    try {
        // First check if the collection exists
        const collectionRef = db.collection("sections");
        const collectionSnapshot = await collectionRef.limit(1).get();
        
        if (collectionSnapshot.empty) {
            // Create the collection by adding a dummy document
            await collectionRef.add({
                weekId: weekId,
                title: "Initial Section",
                order: 1,
                content: [],
                createdAt: new Date(),
                updatedAt: new Date()
            });
            // Return empty array since this is a new collection
            return [];
        }

        const sectionsSnapshot = await sectionsCollection
            .where("weekId", "==", weekId)
            .orderBy("order", "asc")
            .get();

        const sections = [];
        sectionsSnapshot.forEach((doc) => {
            const sectionData = doc.data();
            if (sectionData.createdAt?.toDate) sectionData.createdAt = sectionData.createdAt.toDate();
            if (sectionData.updatedAt?.toDate) sectionData.updatedAt = sectionData.updatedAt.toDate();
            sections.push({ id: doc.id, ...sectionData });
        });

        return sections;
    } catch (error) {
        console.error("Error in getSectionsByWeekId:", error);
        throw error;
    }
};

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