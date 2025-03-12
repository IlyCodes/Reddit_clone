import { Router } from "express";
import Subreddit from "../models/Subreddit.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = Router();

// create a new subreddit
router.post("/", auth, async (req, res) => {
	try {
		const { name, description, creator } = req.body;
		const userExists = await User.findById(creator);

		if (!userExists) {
			return res.status(404).json({ error: "User not found!" });
		}

		const newSubreddit = new Subreddit({ name, description, creator });
		const savedSubreddit = await newSubreddit.save();

		res.status(201).json(savedSubreddit);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// get all subreddits
router.get("/", async (req, res) => {
	try {
		const subreddits = await Subreddit.find();
		res.json(subreddits);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// get subreddit by name
router.get("/:name", async (req, res) => {
	try {
		const subreddit = await Subreddit.findOne({ name: req.params.name });

		if (!subreddit) return res.status(404).json({ error: "Subreddit not found" });

		res.json(subreddit);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// get subreddit by id
router.get("/id/:subredditId", async (req, res) => {
	try {
		const subreddit = await Subreddit.findById(req.params.subredditId);

		if (!subreddit) return res.status(404).json({ error: "Subreddit not found" });

		res.json(subreddit);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// delete subreddit by id
router.delete("/:subredditId", auth, async (req, res) => {
	try {
		const deletedSubreddit = await Subreddit.findByIdAndDelete(req.params.subredditId);

		if (!deletedSubreddit) {
			return res.status(404).json({ error: "Subreddit not found" });
		}

		res.json({ message: "Subreddit deleted successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

export default router;