import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
    {
        subject: { type: String, required: true },
        body: { type: String, required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        subreddit: { type: mongoose.Schema.Types.ObjectId, ref: "Subreddit", required: true },
        imageUrl: { type: String },
    },
    { timestamps: true }
);

const Post = mongoose.model("Post", PostSchema);

export default Post;