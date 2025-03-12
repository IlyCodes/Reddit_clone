import { Router } from "express";
import Vote from "../models/Vote.js";
import auth from "../middleware/auth.js";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../config.js";

const router = Router();

// create & update vote
router.post("/", auth, async (req, res) => {
	try {
		const { post, value } = req.body;
		const user = req.user.id;

		if (![1, -1, 0].includes(value)) {
			return res.status(400).json({ error: "Invalid vote value" });
		}

		let vote = await Vote.findOne({ user, post });
		let newUserVote = 0;

		if (vote) {
			if (value === 0 || vote.value === value) {
				await Vote.deleteOne({ _id: vote._id });
				newUserVote = 0;
			} else {
				vote.value = value;
				await vote.save();
				newUserVote = value;
			}
		} else if (value !== 0) {
			const newVote = new Vote({ user, post, value });
			await newVote.save();
			newUserVote = value;
		}

		// calculate updated total votes
		const votes = await Vote.find({ post });
		const totalVotes = votes.reduce((acc, vote) => acc + vote.value, 0);

		res.json({
			message: "Vote updated",
			totalVotes,
			userVote: newUserVote
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// get total votes & user's vote for a post
router.get("/post/:postId", async (req, res) => {
	try {
		const postId = req.params.postId;
		const votes = await Vote.find({ post: postId });
		const totalVotes = votes.reduce((acc, vote) => acc + vote.value, 0);

		// get user's vote 
		let userVote = 0;
		const token = req.header('Authorization')?.replace('Bearer ', '');

		if (token) {
			try {
				const decoded = jwt.verify(token, JWT_SECRET);
				const userId = decoded.user.id;

				if (userId) {
					const userVote = await Vote.findOne({ user: userId, post: postId });
					userVote = userVote?.value || 0;
				}

			} catch (err) {
				console.log("Invalid token : ", err.message);
			}
		}

		res.json({ postId, totalVotes, userVote });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// delete vote
router.delete("/:voteId", auth, async (req, res) => {
	try {
		const deletedVote = await Vote.findByIdAndDelete(req.params.voteId);

		if (!deletedVote) return res.status(404).json({ error: "Vote not found" });

		res.json({ message: "Vote deleted successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

export default router;