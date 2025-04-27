import { db } from "../config/firebase.config.js"

const discussionsCollection = db.collection("discussions")
const postsCollection = db.collection("posts")

export const createDiscussion = async (discussionData) => {
  try {
    const discussionRef = await discussionsCollection.add({
      title: discussionData.title,
      description: discussionData.description,
      courseId: discussionData.courseId,
      moduleId: discussionData.moduleId,
      createdBy: discussionData.createdBy,
      creatorName: discussionData.creatorName,
      category: discussionData.category || "general",
      isPinned: discussionData.isPinned || false,
      isAnnouncement: discussionData.isAnnouncement || false,
      tags: discussionData.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivity: new Date(),
    })

    return { id: discussionRef.id }
  } catch (error) {
    throw new Error(`Error creating discussion: ${error.message}`)
  }
}

export const getDiscussionById = async (discussionId) => {
  try {
    const discussionDoc = await discussionsCollection.doc(discussionId).get()

    if (!discussionDoc.exists) {
      throw new Error("Discussion not found")
    }

    return { id: discussionDoc.id, ...discussionDoc.data() }
  } catch (error) {
    throw new Error(`Error getting discussion: ${error.message}`)
  }
}

export const updateDiscussion = async (discussionId, discussionData) => {
  try {
    const updateData = {
      ...discussionData,
      updatedAt: new Date(),
    }

    await discussionsCollection.doc(discussionId).update(updateData)

    return { id: discussionId, ...updateData }
  } catch (error) {
    throw new Error(`Error updating discussion: ${error.message}`)
  }
}

export const deleteDiscussion = async (discussionId) => {
  try {
    const postsSnapshot = await postsCollection.where("discussionId", "==", discussionId).get()

    const batch = db.batch()
    postsSnapshot.forEach((doc) => {
      batch.delete(doc.ref)
    })

    batch.delete(discussionsCollection.doc(discussionId))

    await batch.commit()

    return { success: true, message: "Discussion and all posts deleted successfully" }
  } catch (error) {
    throw new Error(`Error deleting discussion: ${error.message}`)
  }
}

export const getAllDiscussions = async () => {
  try {
    const discussionsSnapshot = await discussionsCollection.orderBy("lastActivity", "desc").get()
    const discussions = []

    discussionsSnapshot.forEach((doc) => {
      discussions.push({ id: doc.id, ...doc.data() })
    })

    return discussions
  } catch (error) {
    throw new Error(`Error getting all discussions: ${error.message}`)
  }
}

export const getDiscussionsByCourse = async (courseId) => {
  try {
    const discussionsSnapshot = await discussionsCollection
      .where("courseId", "==", courseId)
      .orderBy("lastActivity", "desc")
      .get()

    const discussions = []

    discussionsSnapshot.forEach((doc) => {
      discussions.push({ id: doc.id, ...doc.data() })
    })

    return discussions
  } catch (error) {
    throw new Error(`Error getting discussions by course: ${error.message}`)
  }
}

export const createPost = async (postData) => {
  try {
    const postRef = await postsCollection.add({
      discussionId: postData.discussionId,
      content: postData.content,
      userId: postData.userId,
      userName: postData.userName,
      userRole: postData.userRole,
      parentId: postData.parentId || null,
      attachments: postData.attachments || [],
      likes: [],
      isReported: false,
      reportReason: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await discussionsCollection.doc(postData.discussionId).update({
      lastActivity: new Date(),
    })

    return { id: postRef.id }
  } catch (error) {
    throw new Error(`Error creating post: ${error.message}`)
  }
}

export const getPostsByDiscussion = async (discussionId) => {
  try {
    const postsSnapshot = await postsCollection
      .where("discussionId", "==", discussionId)
      .orderBy("createdAt", "asc")
      .get()

    const posts = []

    postsSnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() })
    })

    return posts
  } catch (error) {
    throw new Error(`Error getting posts by discussion: ${error.message}`)
  }
}

export const likePost = async (postId, userId) => {
  try {
    const postRef = postsCollection.doc(postId)

    await db.runTransaction(async (transaction) => {
      const postDoc = await transaction.get(postRef)

      if (!postDoc.exists) {
        throw new Error("Post not found")
      }

      const postData = postDoc.data()
      const likes = postData.likes || []

      if (likes.includes(userId)) {
        transaction.update(postRef, {
          likes: likes.filter((id) => id !== userId),
          updatedAt: new Date(),
        })
      } else {
        transaction.update(postRef, {
          likes: [...likes, userId],
          updatedAt: new Date(),
        })
      }
    })

    return { success: true, message: "Post like status updated successfully" }
  } catch (error) {
    throw new Error(`Error updating post like status: ${error.message}`)
  }
}

export const reportPost = async (postId, reportData) => {
  try {
    await postsCollection.doc(postId).update({
      isReported: true,
      reportReason: reportData.reason,
      reportedBy: reportData.userId,
      reportedAt: new Date(),
      updatedAt: new Date(),
    })

    return { success: true, message: "Post reported successfully" }
  } catch (error) {
    throw new Error(`Error reporting post: ${error.message}`)
  }
}
