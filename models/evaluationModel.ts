// models/evaluationModel.ts
import mongoose from "mongoose";

const ToolCallSchema = new mongoose.Schema({
  toolName: String,
  args: mongoose.Schema.Types.Mixed,
  timestamp: Date,
  latencyMs: Number,
  isError: Boolean,
  errorMessage: String
});

const AutomatedMetricsSchema = new mongoose.Schema({
  toolCallSequence: [String],
  toolCallSuccess: Boolean,
  errorOccurred: Boolean,
  firstErrorIndex: Number,
  responseTimeMs: Number,
  toolLatencies: [Number],
  totalToolCalls: Number,
  successfulToolCalls: Number,
  failedToolCalls: Number
});

const ManualAnnotationSchema = new mongoose.Schema({
  toolSelectionCorrect: { type: Boolean, default: null },
  argumentsCorrect: { type: Boolean, default: null },
  resultQuality: { type: Number, min: 0, max: 1, default: null },
  notes: String,
  annotatorId: String,
  annotatedAt: Date,
  reviewed: { type: Boolean, default: false }
});

const ScoresSchema = new mongoose.Schema({
  TCPA: { type: Number, min: 0, max: 1, default: null },
  RTE: { type: Number, min: 0, max: 1, default: null },
  RP: { type: Number, min: 0, max: 1, default: null },
  composite: { type: Number, min: 0, max: 1, default: null }
});

const EvaluationSchema = new mongoose.Schema({
  testCaseId: { type: String, required: true, index: true },
  modelId: { type: String, required: true, index: true },
  modelName: String,
  provider: String,
  mcpServerId: { type: String, required: true, index: true },
  mcpServerName: String,
  
  // Test case info
  prompt: String,
  expectedTools: [String],
  expectedArgs: mongoose.Schema.Types.Mixed,
  difficulty: String,
  category: String,
  
  // Raw conversation data
  messages: [],
  conversationId: String, // Reference to original chat
  
  // Automated metrics (computed automatically)
  automated: AutomatedMetricsSchema,
  
  // Manual annotation (filled by human)
  manual: ManualAnnotationSchema,
  
  // Final computed scores
  scores: ScoresSchema,
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  processedAt: Date,
  annotatedAt: Date,
  status: {
    type: String,
    enum: ['pending', 'processed', 'annotated', 'reviewed', 'complete'],
    default: 'pending'
  }
});

// Compound indexes for querying
EvaluationSchema.index({ modelId: 1, mcpServerId: 1 });
EvaluationSchema.index({ status: 1, createdAt: -1 });
EvaluationSchema.index({ testCaseId: 1, modelId: 1 }, { unique: true });

export const Evaluation = mongoose.models.Evaluation || 
  mongoose.model("Evaluation", EvaluationSchema);


// Aggregated Results Schema (for leaderboard)
const ModelPerformanceSchema = new mongoose.Schema({
  modelId: { type: String, required: true, unique: true },
  modelName: String,
  provider: String,
  
  overall: {
    avgTCPA: Number,
    avgRTE: Number,
    avgRP: Number,
    avgComposite: Number,
    totalTests: Number,
    completedTests: Number
  },
  
  perMcp: [{
    mcpServerId: String,
    mcpServerName: String,
    avgTCPA: Number,
    avgRTE: Number,
    avgRP: Number,
    avgComposite: Number,
    testCount: Number
  }],
  
  perDifficulty: [{
    difficulty: String,
    avgTCPA: Number,
    avgRTE: Number,
    avgRP: Number,
    avgComposite: Number,
    testCount: Number
  }],
  
  perCategory: [{
    category: String,
    avgTCPA: Number,
    avgRTE: Number,
    avgRP: Number,
    avgComposite: Number,
    testCount: Number
  }],
  
  lastUpdated: { type: Date, default: Date.now }
});

export const ModelPerformance = mongoose.models.ModelPerformance || 
  mongoose.model("ModelPerformance", ModelPerformanceSchema);