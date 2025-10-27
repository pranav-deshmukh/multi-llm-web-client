import mongoose from "mongoose";

const TestCaseResultSchema = new mongoose.Schema({
  testCaseId: String,
  prompt: String,
  expectedBehavior: String,
  response: String,
  toolsUsed: [String],
  toolInvocations: [{
    toolCallId: String,
    toolName: String,
    state: String,
    args: mongoose.Schema.Types.Mixed,
    result: mongoose.Schema.Types.Mixed,
    isError: Boolean,
    errorMessage: String,
    callInitiatedAt: Date,
    resultReceivedAt: Date,
    latencyMs: Number,
  }],
  totalToolCalls: Number,
  successfulToolCalls: Number,
  failedToolCalls: Number,
  firstErrorPosition: Number,
  responseTimeMs: Number,
  toolCallCorrectness: Boolean,
  resultPrecisionScore: Number,
  createdAt: Date,
});

const MCPTestSessionSchema = new mongoose.Schema({
  modelId: String,
  modelName: String,
  provider: String,
  mcpServerId: String,
  mcpServerName: String,
  mcpServerDescription: String,
  testSuiteVersion: String,
  totalTestCases: Number,
  testResults: [TestCaseResultSchema],
  metrics: {
    toolCallProcessAccuracy: Number,
    correctToolCalls: Number,
    totalToolCallsAcrossSuite: Number,
    averageResponseTimeMs: Number,
    medianResponseTimeMs: Number,
    minResponseTimeMs: Number,
    maxResponseTimeMs: Number,
    averageToolCallLatencyMs: Number,
    totalErrors: Number,
    recoveryAttempts: Number,
    successfulRecoveries: Number,
    errorRecoveryRate: Number,
    averageFirstErrorPosition: Number,
    errorPositionDistribution: [Number],
    averageResultPrecision: Number,
    testCasesWithPerfectPrecision: Number,
  },
  testStartTime: Date,
  testEndTime: Date,
  totalDurationMs: Number,
  annotationComplete: { type: Boolean, default: false },
  createdAt: Date,
  updatedAt: Date,
});

// 🔹 NEW: Dynamic getter
export function getTestSessionModel(modelId: string) {
  const collectionName = `test_sessions_${modelId.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
  return mongoose.models[collectionName] 
    || mongoose.model(collectionName, MCPTestSessionSchema, collectionName);
}
