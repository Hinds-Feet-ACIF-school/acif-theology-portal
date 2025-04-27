import { db } from "../config/firebase.config.js";
import { FieldValue } from 'firebase-admin/firestore';

const materialsCollection = db.collection("materials");

export const createMaterial = async (materialData) => {
  try {
    if (!materialData.weekId || !materialData.title || !materialData.type) {
      throw new Error("weekId, title, and type are required.");
    }

    const dataToSave = {
      weekId: materialData.weekId,
      title: materialData.title,
      type: materialData.type,
      description: materialData.description || "",
      details: materialData.details || "",
      contentUrl: materialData.contentUrl || null,
      storagePath: materialData.storagePath || null,
      order: materialData.order || 0,
      createdBy: materialData.createdBy || null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const materialRef = await materialsCollection.add(dataToSave);
    return { id: materialRef.id, ...dataToSave };

  } catch (error) {
    console.error("Error creating material:", error);
    throw new Error(`Error creating material: ${error.message}`);
  }
};

export const getMaterialById = async (materialId) => {
  try {
    const materialDoc = await materialsCollection.doc(materialId).get();
    if (!materialDoc.exists) {
      return null;
    }
     const data = materialDoc.data();
     if (data.createdAt?.toDate) data.createdAt = data.createdAt.toDate();
     if (data.updatedAt?.toDate) data.updatedAt = data.updatedAt.toDate();
    return { id: materialDoc.id, ...data };
  } catch (error) {
    console.error(`Error getting material by ID (${materialId}):`, error);
    throw new Error(`Database error getting material ${materialId}: ${error.message}`);
  }
};

export const getMaterialsByWeekId = async (weekId) => {
  try {
    if (!weekId) throw new Error("weekId is required.");

    const materialsSnapshot = await materialsCollection
      .where("weekId", "==", weekId)
      .orderBy("order", "asc")
      .orderBy("createdAt", "asc")
      .get();

    const materials = [];
    materialsSnapshot.forEach((doc) => {
       const data = doc.data();
       if (data.createdAt?.toDate) data.createdAt = data.createdAt.toDate();
       if (data.updatedAt?.toDate) data.updatedAt = data.updatedAt.toDate();
       materials.push({ id: doc.id, ...data });
    });

    return materials;
  } catch (error) {
    console.error(`Error getting materials for week (${weekId}):`, error);

    throw new Error(`Database error getting materials by week: ${error.message}`);
  }
};

export const updateMaterial = async (materialId, materialData) => {
  try {
    if (!materialId) throw new Error("materialId is required for update.");

    delete materialData.id;
    delete materialData.weekId;
    delete materialData.createdAt;
    delete materialData.createdBy;

    const updateData = {
      ...materialData,

      contentUrl: materialData.contentUrl === undefined ? FieldValue.delete() : materialData.contentUrl,
      storagePath: materialData.storagePath === undefined ? FieldValue.delete() : materialData.storagePath,
      updatedAt: FieldValue.serverTimestamp(),
    };

    await materialsCollection.doc(materialId).update(updateData);
    const updatedDocData = await getMaterialById(materialId);
    return updatedDocData;

  } catch (error) {
    console.error(`Error updating material (${materialId}):`, error);
     if (error.code === 5) {
        throw new Error(`Cannot update material: Material with ID ${materialId} not found.`);
    }
    throw new Error(`Database error updating material ${materialId}: ${error.message}`);
  }
};

export const deleteMaterial = async (materialId) => {
  try {
    if (!materialId) throw new Error("materialId is required for deletion.");


    await materialsCollection.doc(materialId).delete();

    return { success: true };
  } catch (error) {
    console.error(`Error deleting material (${materialId}):`, error);
    if (error.code === 5) {
        return { success: false, message: `Material with ID ${materialId} not found.` };
    }
    throw new Error(`Database error deleting material ${materialId}: ${error.message}`);
  }
};