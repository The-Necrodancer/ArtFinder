import { Router } from "express";
import {
  createComment,
  getCommentsByTarget,
  updateComment,
  deleteComment,
  addReply,
  likeComment,
} from "../data/comments.js";
import { userMiddleware } from "../middleware.js";
import xss from "xss";

const router = Router();

// Get comments for a target (artwork or profile)
router.get("/:targetId", async (req, res) => {
  try {
    const { targetId } = req.params;
    const { targetType } = req.query;
    const comments = await getCommentsByTarget(targetId, targetType);
    res.json(comments);
  } catch (e) {
    res.status(400).json({ error: e.toString() });
  }
});

// Create a new comment
router.post("/", userMiddleware, async (req, res) => {
  try {
    const { content, targetId, targetType } = req.body;

    // Sanitize inputs
    const cleanedContent = xss(content);
    const cleanedTargetId = xss(targetId);
    const cleanedTargetType = xss(targetType);

    const comment = await createComment(
      cleanedContent,
      req.session.user._id,
      cleanedTargetId,
      cleanedTargetType
    );
    res.json(comment);
  } catch (e) {
    res.status(400).json({ error: e.toString() });
  }
});

// Update a comment
router.put("/:id", userMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    const cleanedContent = xss(content)
    const comment = await updateComment(req.params.id, cleanedContent);
    res.json(comment);
  } catch (e) {
    res.status(400).json({ error: e.toString() });
  }
});

// Delete a comment
router.delete("/:id", userMiddleware, async (req, res) => {
  try {
    await deleteComment(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.toString() });
  }
});

// Add a reply to a comment
router.post("/:id/reply", userMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    const reply = await addReply(req.params.id, content, req.session.user._id);
    res.json(reply);
  } catch (e) {
    res.status(400).json({ error: e.toString() });
  }
});

// Like a comment
router.post("/:id/like", userMiddleware, async (req, res) => {
  try {
    await likeComment(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.toString() });
  }
});

export default router;
