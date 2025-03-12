import mongoose from "mongoose";

const VoteSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
        value: { type: Number, enum: [1, -1], required: true },
    },
    { timestamps: true }
);

// Ensure a user can vote only once per post
VoteSchema.index({ user: 1, post: 1 }, { unique: true });

const Vote = mongoose.model("Vote", VoteSchema);

export default Vote;