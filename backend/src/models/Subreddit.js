import mongoose from "mongoose";

const SubredditSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        description: { type: String },
        creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

const Subreddit = mongoose.model("Subreddit", SubredditSchema);

export default Subreddit;