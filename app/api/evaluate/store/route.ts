// app/api/evaluate/store/route.ts
// @ts-nocheck

import { connectToMongoDB } from "@/lib/mongodb";
import { Evaluation } from "@/models/evaluationModel";
import { NextResponse } from "next/server";

// Extract automated metrics from messages
function extractAutomatedMetrics(messages) {
  const automated = {
    toolCallSequence: [],
    toolCallSuccess: true,
    errorOccurred: false,
    firstErrorIndex: -1,
    responseTimeMs: 0,
    toolLatencies: [],
    totalToolCalls: 0,
    successfulToolCalls: 0,
    failedToolCalls: 0
  };

  let userMsgTime = null;
  let finalMsgTime = null;
  console.log(messages);
  messages.forEach((msg, idx) => {
    if (msg.role === "user" && !userMsgTime) {
      userMsgTime = new Date(msg.createdAt);
    }

    if (msg.role === "assistant") {
      finalMsgTime = new Date(msg.createdAt);

      if (msg.parts) {
        msg.parts.forEach(part => {
          console.log(part);
          if (part.type === "tool-invocation" && part.toolInvocation) {
            const tool = part.toolInvocation;
            automated.totalToolCalls++;
            automated.toolCallSequence.push(tool.toolName);

            // Check if this tool call has a result
            if (tool.result) {
              if (tool.result.isError || tool.state === "error") {
                automated.errorOccurred = true;
                automated.failedToolCalls++;
                automated.toolCallSuccess = false;

                if (automated.firstErrorIndex === -1) {
                  automated.firstErrorIndex = automated.totalToolCalls - 1;
                }
              } else if (tool.state === "result") {
                automated.successfulToolCalls++;
              }

              // Extract latency if available
              if (tool.latencyMs) {
                automated.toolLatencies.push(tool.latencyMs);
              }
            }
          }
        });
      }
    }
  });

  // Calculate response time
  if (userMsgTime && finalMsgTime) {
    automated.responseTimeMs = finalMsgTime.getTime() - userMsgTime.getTime();
  }

  return automated;
}

export async function POST(req: Request) {
  try {
    await connectToMongoDB();

    const data = await req.json();
    const {
      testCaseId,
      modelId,
      modelName,
      provider,
      mcpServerId,
      mcpServerName,
      prompt,
      expectedTools,
      expectedArgs,
      difficulty,
      category,
      messages
    } = data;

    // Extract automated metrics
    const automated = extractAutomatedMetrics(messages);

    // Check if evaluation already exists
    const existing = await Evaluation.findOne({ testCaseId, modelId });

    if (existing) {
      // Update existing
      existing.messages = messages;
      existing.automated = automated;
      existing.processedAt = new Date();
      existing.status = 'processed';
      await existing.save();

      return NextResponse.json({
        success: true,
        evaluationId: existing._id,
        message: "Evaluation updated"
      });
    }

    // Create new evaluation
    const evaluation = new Evaluation({
      testCaseId,
      modelId,
      modelName,
      provider,
      mcpServerId,
      mcpServerName,
      prompt,
      expectedTools,
      expectedArgs,
      difficulty,
      category,
      messages,
      automated,
      processedAt: new Date(),
      status: 'processed'
    });

    await evaluation.save();

    return NextResponse.json({
      success: true,
      evaluationId: evaluation._id,
      message: "Evaluation created"
    });

  } catch (error: any) {
    console.error("Error storing evaluation:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}