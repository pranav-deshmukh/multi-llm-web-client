import { connectToMongoDB } from "@/lib/mongodb";
import { Chat } from "@/models/chatModel";
import { NextResponse } from "next/server";



export async function POST(req: Request) {
    try {
        
        await connectToMongoDB();
        const { id, messages, modelId, provider, mcpServer } = await req.json();
        const chat = new Chat({
            id,
            mcpServer:{
                id: mcpServer.id,
                name: mcpServer.name,
                description: mcpServer.description,
            },
            messages,
            modelId,
            provider,
            createdAt: new Date(),
        });
        await chat.save();
        return NextResponse.json({ success: true, chat: chat });
    } catch (error: any) {
        console.error("Error saving chat:", error);
        return NextResponse.json({ success: false, error: error.message });
    }
}