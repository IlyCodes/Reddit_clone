import express from "express";
import { PORT, mongoDBURL } from "./config.js";
import cors from "cors";
import mongoose from "mongoose";
import userRoutes from "./routes/UserRoutes.js";
import subredditRoutes from "./routes/SubredditRoutes.js";
import postRoutes from "./routes/PostRoutes.js";
import voteRoutes from "./routes/VoteRoutes.js";
import commentRoutes from "./routes/CommentRoutes.js";
import searchRoutes from "./routes/SearchRoutes.js";
import { uploadsPath } from "./utils/uploadConfig.js";
import topPostsRouter from "./routes/TopPosts.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsPath));

// routes
app.use("/users", userRoutes);
app.use("/subreddits", subredditRoutes);
app.use("/posts", postRoutes);
app.use("/votes", voteRoutes);
app.use("/comments", commentRoutes);
app.use("/search", searchRoutes);
app.use("/topposts", topPostsRouter);

mongoose.connect(mongoDBURL)
	.then(() => {
		try {
			app.listen(PORT, () => {
				console.log("MongoDB Connected Successfully!");
				console.log(`Server listening on port ${PORT}`);
			});
		} catch (err) {
			console.error(err);
			res.send({ message: err.message });
		}
	})