import { Router } from "express";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { upload } from "../utils/uploadConfig.js";
import auth from "../middleware/auth.js";

const router = Router();

// get posts
router.get("/", async (req, res) => {
	try {
		const posts = await Post.find().populate("author subreddit");
		const postsWithCommentCounts = await Promise.all(
			posts.map(async (post) => {
				const commentCount = await Comment.countDocuments({ post: post._id });
				return { ...post.toObject(), commentCount };
			})
		);

		res.json(postsWithCommentCounts);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// get posts by subreddit
router.get("/subreddit/:subredditId", async (req, res) => {
	try {
		const posts = await Post.find({ subreddit: req.params.subredditId }).populate("author");
		res.json(posts);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// get posts by user
router.get('/user/:userId', async (req, res) => {
	const { userId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(userId)) {
		return res.status(400).json({ error: "Invalid user ID format" });
	}

	try {
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const posts = await Post.find({ author: user._id }).populate("author");
		res.json(posts);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// get post by id
router.get("/:postId", async (req, res) => {
	try {
		const post = await Post.findById(req.params.postId).populate("author subreddit");

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		res.json(post);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// create a post with file upload
router.post("/", auth, upload.single("image"), async (req, res) => {
	try {
		const postData = {
			subject: req.body.subject,
			body: req.body.body || "",
			author: req.body.author,
			subreddit: req.body.subreddit,
		};

		// file upload
		if (req.file) {
			postData.imageUrl = `/uploads/${req.file.filename}`;
		}

		const post = new Post(postData);
		const savedPost = await post.save();

		res.status(201).json(savedPost);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// delete post
router.delete("/:postId", auth, async (req, res) => {
	try {
		const deletedPost = await Post.findByIdAndDelete(req.params.postId);

		if (!deletedPost) {
			return res.status(404).json({ error: "Post not found" });
		}

		res.json({ message: "Post deleted successfully" });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

export default router;