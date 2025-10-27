import { connectToMongoDB } from "@/lib/mongodb";
import { Evaluation, ModelPerformance } from "@/models/evaluationModel";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectToMongoDB();

    // Get all annotated evaluations
    const evaluations = await Evaluation.find({
      status: 'annotated',
      'scores.TCPA': { $ne: null },
      'scores.RP': { $ne: null }
    });

    if (evaluations.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No annotated evaluations found"
      });
    }

    // Find min and max response times for normalization
    const times = evaluations
      .map(e => e.automated?.responseTimeMs)
      .filter(t => t != null && t > 0);

    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    console.log(`Normalizing RTE: min=${minTime}ms, max=${maxTime}ms`);

    // Update each evaluation with normalized RTE and composite score
    for (const evaluation of evaluations) {
      const responseTime = evaluation.automated?.responseTimeMs || 0;
      
      // Normalize RTE (higher is better, so we invert)
      let RTE = 0;
      if (maxTime > minTime) {
        RTE = 1 - (responseTime - minTime) / (maxTime - minTime);
      } else {
        RTE = 1.0; // All times are the same
      }

      // Calculate composite score
      const TCPA = evaluation.scores.TCPA || 0;
      const RP = evaluation.scores.RP || 0;
      const composite = (0.4 * TCPA) + (0.3 * RTE) + (0.3 * RP);

      // Update scores
      evaluation.scores.RTE = RTE;
      evaluation.scores.composite = composite;
      evaluation.status = 'complete';

      await evaluation.save();
    }

    // Now aggregate results by model
    await aggregateModelPerformance();

    return NextResponse.json({
      success: true,
      message: `Normalized ${evaluations.length} evaluations`,
      minTime,
      maxTime
    });

  } catch (error: any) {
    console.error("Error normalizing scores:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

async function aggregateModelPerformance() {
  // Aggregate overall performance per model
  const results = await Evaluation.aggregate([
    {
      $match: { status: 'complete' }
    },
    {
      $group: {
        _id: "$modelId",
        modelName: { $first: "$modelName" },
        provider: { $first: "$provider" },
        avgTCPA: { $avg: "$scores.TCPA" },
        avgRTE: { $avg: "$scores.RTE" },
        avgRP: { $avg: "$scores.RP" },
        avgComposite: { $avg: "$scores.composite" },
        totalTests: { $sum: 1 }
      }
    },
    {
      $sort: { avgComposite: -1 }
    }
  ]);

  // Per-MCP performance
  const perMcpResults = await Evaluation.aggregate([
    {
      $match: { status: 'complete' }
    },
    {
      $group: {
        _id: { modelId: "$modelId", mcpServerId: "$mcpServerId" },
        mcpServerName: { $first: "$mcpServerName" },
        avgTCPA: { $avg: "$scores.TCPA" },
        avgRTE: { $avg: "$scores.RTE" },
        avgRP: { $avg: "$scores.RP" },
        avgComposite: { $avg: "$scores.composite" },
        testCount: { $sum: 1 }
      }
    }
  ]);

  // Save aggregated results
  for (const result of results) {
    const mcpBreakdown = perMcpResults
      .filter(m => m._id.modelId === result._id)
      .map(m => ({
        mcpServerId: m._id.mcpServerId,
        mcpServerName: m.mcpServerName,
        avgTCPA: m.avgTCPA,
        avgRTE: m.avgRTE,
        avgRP: m.avgRP,
        avgComposite: m.avgComposite,
        testCount: m.testCount
      }));

    await ModelPerformance.findOneAndUpdate(
      { modelId: result._id },
      {
        modelId: result._id,
        modelName: result.modelName,
        provider: result.provider,
        overall: {
          avgTCPA: result.avgTCPA,
          avgRTE: result.avgRTE,
          avgRP: result.avgRP,
          avgComposite: result.avgComposite,
          totalTests: result.totalTests,
          completedTests: result.totalTests
        },
        perMcp: mcpBreakdown,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );
  }
}