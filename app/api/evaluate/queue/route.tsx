// app/api/evaluate/queue/route.ts
import { connectToMongoDB } from "@/lib/mongodb";
import { Evaluation } from "@/models/evaluationModel";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectToMongoDB();

    // Get all evaluations that need annotation
    const evaluations = await Evaluation.find({
      status: { $in: ['processed', 'pending'] }
    })
    .sort({ createdAt: 1 })
    .limit(100); // Load 100 at a time

    return NextResponse.json({
      success: true,
      evaluations,
      total: evaluations.length
    });

  } catch (error: any) {
    console.error("Error loading annotation queue:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}


// app/api/evaluate/annotate/route.ts



// app/api/evaluate/normalize/route.ts
