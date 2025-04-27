import * as DiscussionModel from "../models/discussion.model.js"
import { auth } from "../config/firebase.config.js"

export const createDiscussion = async (req, res) => {
  try {
    const discussionData = req.body
    const { uid } = req.user

    const userRecord = await auth.getUser(uid)

    discussionData.createdBy = uid
    discussionData.creatorName = userRecord.displayName || "Anonymous"

    const discussion = await DiscussionModel.createDiscussion(discussionData)

    res.status(201).json({
      message: "Discussion created successfully",
      discussionId: discussion.id,
    })
  } catch (error) {
    console.error("Error creating discussion:", error)
    res.status(500).json({ message: error.message })
  }
}

export const getDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params

    const discussion = await DiscussionModel.getDiscussionById(discussionId)

    res.status(200).json(discussion)
  } catch (error) {
    console.error("Error getting discussion:", error)
    res.status(500).json({ message: error.message })
  }
}

export const updateDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params
    const discussionData = req.body

    const updatedDiscussion = await DiscussionModel.updateDiscussion(discussionId, discussionData)

    res.status(200).json({
      message: "Discussion updated successfully",
      discussion: updatedDiscussion,
    })
  } catch (error) {
    console.error("Error updating discussion:", error)
    res.status(500).json({ message: error.message })
  }
}

export const deleteDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params

    await DiscussionModel.deleteDiscussion(discussionId)

    res.status(200).json({
      message: "Discussion deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting discussion:", error)
    res.status(500).json({ message: error.message })
  }
}

export const getAllDiscussions = async (req, res) => {
  try {
    const discussions = await DiscussionModel.getAllDiscussions()

    res.status(200).json(discussions)
  } catch (error) {
    console.error("Error getting all discussions:", error)
    res.status(500).json({ message: error.message })
  }
}

export const getDiscussionsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params

    const discussions = await DiscussionModel.getDiscussionsByCourse(courseId)

    res.status(200).json(discussions)
  } catch (error) {
    console.error("Error getting discussions by course:", error)
    res.status(500).json({ message: error.message })
  }
}

export const createPost = async (req, res) => {
  try {
    const { discussionId } = req.params
    const postData = req.body
    const { uid } = req.user

    const userRecord = await auth.getUser(uid)
    const customClaims = userRecord.customClaims || {}

    postData.discussionId = discussionId
    postData.userId = uid
    postData.userName = userRecord.displayName || "Anonymous"
    postData.userRole = customClaims.role || "student"

    const post = await DiscussionModel.createPost(postData)

    res.status(201).json({
      message: "Post created successfully",
      postId: post.id,
    })
  } catch (error) {
    console.error("Error creating post:", error)
    res.status(500).json({ message: error.message })
  }
}

export const getPostsByDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params

    const posts = await DiscussionModel.getPostsByDiscussion(discussionId)

    res.status(200).json(posts)
  } catch (error) {
    console.error("Error getting posts by discussion:", error)
    res.status(500).json({ message: error.message })
  }
}

export const likePost = async (req, res) => {
  try {
    const { postId } = req.params
    const { uid } = req.user

    await DiscussionModel.likePost(postId, uid)

    res.status(200).json({
      message: "Post like status updated successfully",
    })
  } catch (error) {
    console.error("Error updating post like status:", error)
    res.status(500).json({ message: error.message })
  }
}

export const reportPost = async (req, res) => {
  try {
    const { postId } = req.params
    const reportData = req.body
    const { uid } = req.user

    reportData.userId = uid

    await DiscussionModel.reportPost(postId, reportData)

    res.status(200).json({
      message: "Post reported successfully",
    })
  } catch (error) {
    console.error("Error reporting post:", error)
    res.status(500).json({ message: error.message })
  }
}
