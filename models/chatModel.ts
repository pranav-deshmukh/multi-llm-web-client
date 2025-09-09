import mongoose from "mongoose";


const MCPServerSchema = new mongoose.Schema({
    id: String,
    name: String,
    description: String,
});

const ChatSchema = new mongoose.Schema({
    id: String,
    mcpServer: MCPServerSchema,
    messages: [],
    modelId: String,
    provider: String,
    createdAt: Date,
});

export const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);