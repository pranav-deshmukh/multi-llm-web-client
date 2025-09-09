import mongoose from "mongoose";

const MONGODB_URI = "";

export const connectToMongoDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
    }
}