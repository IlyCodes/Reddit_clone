import { Router } from "express";
import Comment from "../models/Comment.js";
import auth from "../middleware/auth.js";

const router = Router();

// create comment for a post
router.post("/:postId", auth, async (req, res) => {
	try {
		const { content, author } = req.body;

		if (!author) {
			return res.status(400).json({ error: "Author ID is required!" });
		}

		const newComment = new Comment({
			content,
			author,
			post: req.params.postId,
		});
		const savedComment = await newComment.save();

		res.status(201).json(savedComment);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.message });
	}
});

// get comments by post
router.get("/post/:postId", async (req, res) => {
	try {
		const comments = await Comment.find({ post: req.params.postId }).populate("author");
		res.json(comments);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.message });
	}
});

// delete comment
router.delete("/:commentId", auth, async (req, res) => {
	try {
		const deletedComment = await Comment.findByIdAndDelete(req.params.commentId);
		if (!deletedComment) {
			return res.status(404).json({ error: "Comment not found" });
		}
		res.json({ message: "Comment deleted successfully" });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.message });
	}
});

export default router;