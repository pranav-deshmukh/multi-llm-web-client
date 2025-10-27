// app/api/evaluate/leaderboard/route.ts
import { connectToMongoDB } from "@/lib/mongodb";
import { ModelPerformance } from "@/models/evaluationModel";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectToMongoDB();

    // Get all model performances sorted by composite score
    const leaderboard = await ModelPerformance.find({})
      .sort({ 'overall.avgComposite': -1 })
      .lean();

    return NextResponse.json({
      success: true,
      leaderboard,
      total: leaderboard.length
    });

  } catch (error: any) {
    console.error("Error loading leaderboard:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}