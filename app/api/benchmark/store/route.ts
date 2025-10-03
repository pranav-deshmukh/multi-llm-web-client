// app/api/benchmark/store/route.ts
import { connectToMongoDB } from "@/lib/mongodb";
import { getTestSessionModel } from "@/models/benchmarkModel";

import { NextResponse } from "next/server";

function calculateMetricsFromTestResults(testResults) {
  const metrics = {
    toolCallProcessAccuracy: 0,
    correctToolCalls: 0,
    totalToolCallsAcrossSuite: 0,
    averageResponseTimeMs: 0,
    medianResponseTimeMs: 0,
    minResponseTimeMs: Infinity,
    maxResponseTimeMs: 0,
    averageToolCallLatencyMs: 0,
    totalErrors: 0,
    recoveryAttempts: 0,
    successfulRecoveries: 0,
    errorRecoveryRate: 0,
    averageFirstErrorPosition: 0,
    errorPositionDistribution: [],
    averageResultPrecision: 0,
    testCasesWithPerfectPrecision: 0,
  };

  if (testResults.length === 0) return metrics;

  let responseTimes = [];
  let toolLatencies = [];
  let errorPositions = [];
  let precisionScores = [];
  let annotatedTestCases = 0;

  testResults.forEach((test) => {
    // Tool call accuracy
    metrics.totalToolCallsAcrossSuite += test.totalToolCalls || 0;
    if (test.toolCallCorrectness) {
      metrics.correctToolCalls += test.successfulToolCalls || 0;
    }

    // Response time
    if (test.responseTimeMs) {
      responseTimes.push(test.responseTimeMs);
      metrics.minResponseTimeMs = Math.min(
        metrics.minResponseTimeMs,
        test.responseTimeMs
      );
      metrics.maxResponseTimeMs = Math.max(
        metrics.maxResponseTimeMs,
        test.responseTimeMs
      );
    }

    // Tool latency
    test.toolInvocations?.forEach((inv) => {
      if (inv.latencyMs) {
        toolLatencies.push(inv.latencyMs);
      }
    });

    // Error handling
    const errors = test.failedToolCalls || 0;
    metrics.totalErrors += errors;

    if (test.firstErrorPosition >= 0) {
      errorPositions.push(test.firstErrorPosition);
    }

    // Precision (only if annotated)
    if (
      test.resultPrecisionScore !== null &&
      test.resultPrecisionScore !== undefined
    ) {
      precisionScores.push(test.resultPrecisionScore);
      annotatedTestCases++;
      if (test.resultPrecisionScore === 1.0) {
        metrics.testCasesWithPerfectPrecision++;
      }
    }
  });

  // Calculate averages
  if (metrics.totalToolCallsAcrossSuite > 0) {
    metrics.toolCallProcessAccuracy =
      (metrics.correctToolCalls / metrics.totalToolCallsAcrossSuite) * 100;
  }

  if (responseTimes.length > 0) {
    metrics.averageResponseTimeMs =
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

    responseTimes.sort((a, b) => a - b);
    const mid = Math.floor(responseTimes.length / 2);
    metrics.medianResponseTimeMs =
      responseTimes.length % 2 === 0
        ? (responseTimes[mid - 1] + responseTimes[mid]) / 2
        : responseTimes[mid];
  }

  if (toolLatencies.length > 0) {
    metrics.averageToolCallLatencyMs =
      toolLatencies.reduce((a, b) => a + b, 0) / toolLatencies.length;
  }

  if (metrics.totalErrors > 0 && metrics.recoveryAttempts > 0) {
    metrics.errorRecoveryRate =
      (metrics.successfulRecoveries / metrics.recoveryAttempts) * 100;
  }

  if (errorPositions.length > 0) {
    metrics.averageFirstErrorPosition =
      errorPositions.reduce((a, b) => a + b, 0) / errorPositions.length;
    metrics.errorPositionDistribution = errorPositions;
  }

  if (precisionScores.length > 0) {
    metrics.averageResultPrecision =
      precisionScores.reduce((a, b) => a + b, 0) / precisionScores.length;
  }

  if (metrics.minResponseTimeMs === Infinity) {
    metrics.minResponseTimeMs = 0;
  }

  return metrics;
}

function extractTestResultFromMessages(messages, testCaseId, prompt) {
  const testResult = {
    testCaseId,
    prompt,
    expectedBehavior: "", // to be filled manually
    response: "",
    toolsUsed: [],
    toolInvocations: [],
    totalToolCalls: 0,
    successfulToolCalls: 0,
    failedToolCalls: 0,
    firstErrorPosition: -1,
    responseTimeMs: 0,
    toolCallCorrectness: null,
    resultPrecisionScore: null,
    createdAt: new Date(),
  };

  let userMessageTime = null;
  let assistantMessageTime = null;

  messages.forEach((message, idx) => {
    if (message.role === "user" && !userMessageTime) {
      userMessageTime = new Date(message.createdAt);
    }

    if (message.role === "assistant") {
      assistantMessageTime = new Date(message.createdAt);
      testResult.response = message.content || "";

      if (message.parts) {
        message.parts.forEach((part) => {
          if (part.type === "tool-invocation" && part.toolInvocation) {
            const inv = part.toolInvocation;
            testResult.totalToolCalls++;

            const toolInv = {
              toolCallId: inv.toolCallId,
              toolName: inv.toolName,
              state: inv.state,
              args: inv.args,
              result: inv.result,
              isError: inv.result?.isError || false,
              errorMessage: inv.result?.error || "",
              callInitiatedAt: new Date(message.createdAt),
              resultReceivedAt:
                inv.state === "result"
                  ? new Date(new Date(message.createdAt).getTime() + 50)
                  : null,
              latencyMs: inv.state === "result" ? 50 : null, // placeholder
            };

            testResult.toolInvocations.push(toolInv);

            if (!testResult.toolsUsed.includes(inv.toolName)) {
              testResult.toolsUsed.push(inv.toolName);
            }

            if (inv.result?.isError) {
              testResult.failedToolCalls++;
              if (testResult.firstErrorPosition === -1) {
                testResult.firstErrorPosition = testResult.totalToolCalls - 1;
              }
            } else if (inv.state === "result") {
              testResult.successfulToolCalls++;
            }
          }
        });
      }
    }
  });

  if (userMessageTime && assistantMessageTime) {
    testResult.responseTimeMs =
      assistantMessageTime.getTime() - userMessageTime.getTime();
  }

  return testResult;
}

export async function POST(req: Request) {
  try {
    await connectToMongoDB();

    const {
      modelId,
      modelName,
      provider,
      mcpServer,
      testCaseId,
      prompt,
      messages,
      testSuiteVersion = "v1.0",
    } = await req.json();

    const testStartTime = new Date();

    // Extract test result from messages
    const testResult = extractTestResultFromMessages(
      messages,
      testCaseId,
      prompt
    );

    const MCPTestSession = getTestSessionModel(modelId);

    let session = await MCPTestSession.findOne({
      mcpServerId: mcpServer.id,
      testSuiteVersion,
    });

    if (!session) {
      session = new MCPTestSession({
        modelId,
        modelName,
        provider,
        mcpServerId: mcpServer.id,
        mcpServerName: mcpServer.name,
        mcpServerDescription: mcpServer.description,
        testSuiteVersion,
        totalTestCases: 0,
        testResults: [],
        metrics: {},
        testStartTime,
        createdAt: new Date(),
      });
    }

    // Add or update test result
    const existingIndex = session.testResults.findIndex(
      (tr) => tr.testCaseId === testCaseId
    );

    if (existingIndex >= 0) {
      session.testResults[existingIndex] = testResult;
    } else {
      session.testResults.push(testResult);
      session.totalTestCases = session.testResults.length;
    }

    // Recalculate metrics
    session.metrics = calculateMetricsFromTestResults(session.testResults);
    session.testEndTime = new Date();
    session.totalDurationMs =
      session.testEndTime.getTime() - session.testStartTime.getTime();
    session.updatedAt = new Date();

    await session.save();

    return NextResponse.json({
      success: true,
      sessionId: session._id,
      testCaseId,
      currentMetrics: session.metrics,
      testCasesCompleted: session.totalTestCases,
    });
  } catch (error: any) {
    console.error("Error storing benchmark data:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}
