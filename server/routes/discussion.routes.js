import express from "express"
import * as DiscussionController from "../controllers/discussion.controller.js"
import { isInstructor } from "../middleware/auth.middleware.js"

const router = express.Router()


// Public routes (for authenticated users)
router.get("/", DiscussionController.getAllDiscussions)
router.get("/:discussionId", DiscussionController.getDiscussion)
router.get("/course/:courseId", DiscussionController.getDiscussionsByCourse)
router.get("/:discussionId/posts", DiscussionController.getPostsByDiscussion)
router.post("/:discussionId/posts", DiscussionController.createPost)
router.post("/posts/:postId/like", DiscussionController.likePost)
router.post("/posts/:postId/report", DiscussionController.reportPost)

// Instructor/Admin routes
router.post("/", isInstructor, DiscussionController.createDiscussion)
router.put("/:discussionId", isInstructor, DiscussionController.updateDiscussion)
router.delete("/:discussionId", isInstructor, DiscussionController.deleteDiscussion)

export default router
