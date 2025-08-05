import mongoose from "mongoose";

const MONGODB_URI = "mongodb://localhost:27017/multi-llm-web-client";

export const connectToMongoDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
    }
}