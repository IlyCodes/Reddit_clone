import express from "express";
import Post from "../models/Post.js";
import Vote from "../models/Vote.js";
import User from "../models/User.js";
import Subreddit from "../models/Subreddit.js";

const router = express.Router();

// get top posts from the past day
router.get("/top", async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;

        // Get posts from the last 24 hours
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const recentPosts = await Post.find({
            createdAt: { $gt: oneDayAgo }
        })
            .sort({ createdAt: -1 })
            .limit(1000)
            .populate('author', 'username')
            .populate('subreddit', 'name')
            .lean();

        // Calculate scores for each post
        const postsWithScores = await Promise.all(
            recentPosts.map(async (post) => {

                // Get all votes for this post
                const votes = await Vote.find({ post: post._id });

                // Calculate upvotes and downvotes
                const upvotes = votes.filter(vote => vote.value === 1).length;
                const downvotes = votes.filter(vote => vote.value === -1).length;
                const score = upvotes - downvotes;

                // Format the response object
                return {
                    ...post,
                    score,
                    upvotes,
                    downvotes,
                    author: post.author ? { username: post.author.username } : { username: "[deleted]" },
                    subreddit: post.subreddit ? { name: post.subreddit.name } : { name: "[deleted]" }
                };
            })
        );

        // Sort by score and limit the results
        const topPosts = postsWithScores
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        res.json(topPosts);
    } catch (err) {
        console.error("Error fetching top posts:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;