// @ts-nocheck

import { connectToMongoDB } from "@/lib/mongodb";
import { Evaluation } from "@/models/evaluationModel";
import { NextResponse } from "next/server";

function calculateScores(evaluation) {
  const { automated, manual } = evaluation;
  
  let TCPA = 0;
  if (manual.toolSelectionCorrect && manual.argumentsCorrect) {
    TCPA = automated.toolCallSuccess ? 1.0 : 0.7;
  } else if (manual.toolSelectionCorrect) {
    TCPA = 0.5;
  } else if (manual.argumentsCorrect) {
    TCPA = 0.3;
  } else {
    TCPA = 0.0;
  }

  const RP = manual.resultQuality;

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

    evaluation.manual = manual;
    evaluation.annotatedAt = new Date();
    evaluation.status = 'annotated';

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