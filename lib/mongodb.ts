import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://pranavdeshmukh190_db_user:D3FbjgdkXKZGeAnQ@llm-benchmarking.5vb7sna.mongodb.net/mcp";

export const connectToMongoDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
    }
}