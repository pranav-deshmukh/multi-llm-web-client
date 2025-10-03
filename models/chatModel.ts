// models/chatModel.ts
import mongoose from "mongoose";

const ToolInvocationMetricsSchema = new mongoose.Schema({
  toolCallId: String,
  toolName: String,
  state: String, // "call", "result", "error"
  step: Number,
  
  // Timing metrics
  callInitiatedAt: Date,
  resultReceivedAt: Date,
  latencyMs: Number, // resultReceivedAt - callInitiatedAt
  
  // Arguments and validation
  args: mongoose.Schema.Types.Mixed,
  argsValid: { type: Boolean, default: null }, // to be annotated manually later
  
  // Result data
  result: mongoose.Schema.Types.Mixed,
  isError: { type: Boolean, default: false },
  errorMessage: String,
  errorType: String, // "tool_unavailable", "invalid_args", "timeout", "unexpected_format"
  
  // Recovery tracking
  isRecoveryAttempt: { type: Boolean, default: false },
  originalFailedCallId: String,
  recoveryStrategy: String, // "retry", "alternative_tool", "ask_user", "partial_result"
  recoverySuccessful: { type: Boolean, default: null },
});

const MessageMetricsSchema = new mongoose.Schema({
  messageId: String,
  role: String,
  content: String,
  
  // Timing
  createdAt: Date,
  
  // Tool call tracking
  toolInvocations: [ToolInvocationMetricsSchema],
  totalToolCalls: { type: Number, default: 0 },
  successfulToolCalls: { type: Number, default: 0 },
  failedToolCalls: { type: Number, default: 0 },
  
  // First error position (index of first failed tool call)
  firstErrorPosition: { type: Number, default: -1 },
  
  // Response quality (to be annotated manually)
  expectedToolCalls: [String], // manually annotated ground truth
  correctToolSelection: { type: Boolean, default: null },
  resultPrecisionScore: { type: Number, default: null }, // 0-1 score
});

const MCPServerSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
});

const ConversationMetricsSchema = new mongoose.Schema({
  // Overall timing
  conversationStartTime: Date,
  conversationEndTime: Date,
  totalDurationMs: Number,
  
  // Aggregate tool call metrics
  totalToolCallsInConversation: { type: Number, default: 0 },
  totalSuccessfulToolCalls: { type: Number, default: 0 },
  totalFailedToolCalls: { type: Number, default: 0 },
  totalRecoveryAttempts: { type: Number, default: 0 },
  successfulRecoveries: { type: Number, default: 0 },
  
  // Response time metrics
  averageResponseTimeMs: Number,
  averageToolCallLatencyMs: Number,
  timeToFirstToolCall: Number, // ms from first user message to first tool call
  
  // Calculated metrics (computed during analysis)
  toolCallProcessAccuracy: Number, // percentage
  errorHandlingRecoveryRate: Number, // percentage
  avgFirstErrorPosition: Number,
  overallResultPrecision: Number,
});

const ChatSchema = new mongoose.Schema({
  id: String,
  mcpServer: MCPServerSchema,
  
  // Original messages array (preserved for backward compatibility)
  messages: [],
  
  // Enhanced messages with metrics
  messagesWithMetrics: [MessageMetricsSchema],
  
  // Model info
  modelId: String,
  provider: String,
  
  // Conversation-level metrics
  conversationMetrics: ConversationMetricsSchema,
  
  // Metadata
  createdAt: Date,
  updatedAt: Date,
  
  // Manual annotation fields
  annotated: { type: Boolean, default: false },
  annotationNotes: String,
  groundTruthAvailable: { type: Boolean, default: false },
});

ChatSchema.index({ modelId: 1, 'mcpServer.id': 1, createdAt: -1 });

export const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);