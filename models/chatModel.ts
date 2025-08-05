import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
    id: String,
    messages: [],
    modelId: String,
    provider: String,
    createdAt: Date,
});

export const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);