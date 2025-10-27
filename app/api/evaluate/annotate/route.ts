import { connectToMongoDB } from "@/lib/mongodb";
import { Evaluation } from "@/models/evaluationModel";
import { NextResponse } from "next/server";

function calculateScores(evaluation) {
  const { automated, manual } = evaluation;
  
  // 1. Tool Call Process Accuracy (TCPA)
  let TCPA = 0;
  if (manual.toolSelectionCorrect && manual.argumentsCorrect) {
    // Both correct - check if execution succeeded
    TCPA = automated.toolCallSuccess ? 1.0 : 0.7;
  } else if (manual.toolSelectionCorrect) {
    // Right tools, wrong args
    TCPA = 0.5;
  } else if (manual.argumentsCorrect) {
    // Right args, wrong tools (rare but possible)
    TCPA = 0.3;
  } else {
    // Both wrong
    TCPA = 0.0;
  }

  // 2. Result Precision (RP) - directly from manual annotation
  const RP = manual.resultQuality;

  // 3. Response Time Efficiency (RTE) - will be normalized later across all models
  // For now, store raw time
  const responseTime = automated.responseTimeMs || 0;

  return {
    TCPA,
    RP,
    responseTime
  };
}

export async function POST(req: Request) {
  try {
    await connectToMongoDB();

    const { evaluationId, manual } = await req.json();

    const evaluation = await Evaluation.findById(evaluationId);
    if (!evaluation) {
      return NextResponse.json({
        success: false,
        error: "Evaluation not found"
      }, { status: 404 });
    }

    // Update manual annotation
    evaluation.manual = manual;
    evaluation.annotatedAt = new Date();
    evaluation.status = 'annotated';

    // Calculate scores (RTE will be normalized later)
    const scores = calculateScores(evaluation);
    evaluation.scores = {
      TCPA: scores.TCPA,
      RP: scores.RP,
      RTE: null, // Will be calculated after normalization
      composite: null // Will be calculated after RTE normalization
    };

    await evaluation.save();

    return NextResponse.json({
      success: true,
      evaluationId: evaluation._id,
      scores: evaluation.scores
    });

  } catch (error: any) {
    console.error("Error saving annotation:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}