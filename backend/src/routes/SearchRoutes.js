import { Router } from "express";
import Post from "../models/Post.js";
import Subreddit from "../models/Subreddit.js";

const router = Router();

// search for posts or subreddits
router.get("/", async (req, res) => {
	try {
		const { q, subreddit } = req.query;

		if (!q || q.length < 2) {
			return res.status(400).json({ error: "Search query must be at least 2 characters" });
		}

		const results = [];
		const searchRegex = new RegExp(q, "i");

		if (subreddit) {

			const subredditDoc = await Subreddit.findOne({ name: subreddit });

			if (!subredditDoc) {
				return res.status(404).json({ error: "Subreddit not found" });
			}

			const posts = await Post.find({
				subreddit: subredditDoc._id,
				$or: [
					{ subject: searchRegex },
					{ body: searchRegex }
				]
			}).populate("subreddit", "name")
				.limit(10);

			results.push(...posts.map(post => ({
				_id: post._id,
				type: "post",
				title: post.subject,
				name: post.subreddit.name
			})));

		} else {
			// search for subreddits
			const subreddits = await Subreddit.find({ name: searchRegex }).limit(5);

			results.push(...subreddits.map(sub => ({
				_id: sub._id,
				type: "community",
				title: sub.name,
				name: sub.name
			})));

			// search for posts
			const posts = await Post.find({
				$or: [
					{ subject: searchRegex },
					{ body: searchRegex }
				]
			}).populate("subreddit", "name")
				.limit(5);

			results.push(...posts.map(post => ({
				_id: post._id,
				type: "post",
				title: post.subject,
				name: post.subreddit.name
			})));
		}

		res.json(results);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

export default router;