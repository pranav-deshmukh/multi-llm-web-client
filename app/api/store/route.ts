// app/api/store/route.ts
// @ts-nocheck

import { connectToMongoDB } from "@/lib/mongodb";
import { Chat } from "@/models/chatModel";
import { NextResponse } from "next/server";

// Helper function to extract timing and metrics from messages
function processMessagesForMetrics(messages) {
  const messagesWithMetrics = [];
  const conversationMetrics = {
    conversationStartTime: null,
    conversationEndTime: null,
    totalDurationMs: 0,
    totalToolCallsInConversation: 0,
    totalSuccessfulToolCalls: 0,
    totalFailedToolCalls: 0,
    totalRecoveryAttempts: 0,
    successfulRecoveries: 0,
    averageResponseTimeMs: 0,
    averageToolCallLatencyMs: 0,
    timeToFirstToolCall: null,
  };

  let firstUserMessageTime = null;
  let firstToolCallTime = null;
  let totalResponseTimes = [];
  let totalToolCallLatencies = [];
  let previousMessageTime = null;

  messages.forEach((message, msgIndex) => {
    const messageTime = new Date(message.createdAt);
    
    // Track conversation start/end
    if (!conversationMetrics.conversationStartTime) {
      conversationMetrics.conversationStartTime = messageTime;
    }
    conversationMetrics.conversationEndTime = messageTime;

    // Track first user message
    if (message.role === "user" && !firstUserMessageTime) {
      firstUserMessageTime = messageTime;
    }

    // Calculate response time (time between messages)
    if (previousMessageTime && message.role === "assistant") {
      const responseTime = messageTime.getTime() - previousMessageTime.getTime();
      totalResponseTimes.push(responseTime);
    }

    // Process tool invocations
    const toolInvocations = [];
    let totalToolCalls = 0;
    let successfulToolCalls = 0;
    let failedToolCalls = 0;
    let firstErrorPosition = -1;

    if (message.parts) {
      message.parts.forEach((part, partIndex) => {
        if (part.type === "tool-invocation" && part.toolInvocation) {
          const toolInv = part.toolInvocation;
          totalToolCalls++;
          conversationMetrics.totalToolCallsInConversation++;

          // Track first tool call time
          if (!firstToolCallTime) {
            firstToolCallTime = messageTime;
          }

          const toolMetrics = {
            toolCallId: toolInv.toolCallId,
            toolName: toolInv.toolName,
            state: toolInv.state,
            step: toolInv.step || partIndex,
            args: toolInv.args,
            result: toolInv.result,
            callInitiatedAt: messageTime,
            isError: toolInv.result?.isError || false,
          };

          // Estimate timing (if result exists in same message)
          if (toolInv.state === "result" && toolInv.result) {
            // Rough estimate: assume small delay for tool execution
            toolMetrics.resultReceivedAt = new Date(messageTime.getTime() + 100);
            toolMetrics.latencyMs = 100; // Placeholder - actual timing would need server-side tracking
            totalToolCallLatencies.push(toolMetrics.latencyMs);
            
            if (toolInv.result.isError) {
              toolMetrics.errorMessage = toolInv.result.error || "Unknown error";
              failedToolCalls++;
              conversationMetrics.totalFailedToolCalls++;
              
              if (firstErrorPosition === -1) {
                firstErrorPosition = totalToolCalls - 1;
              }
            } else {
              successfulToolCalls++;
              conversationMetrics.totalSuccessfulToolCalls++;
            }
          }

          toolInvocations.push(toolMetrics);
        }
      });
    }

    messagesWithMetrics.push({
      messageId: message.id,
      role: message.role,
      content: message.content || "",
      createdAt: messageTime,
      toolInvocations,
      totalToolCalls,
      successfulToolCalls,
      failedToolCalls,
      firstErrorPosition,
    });

    previousMessageTime = messageTime;
  });

  // Calculate aggregate metrics
  if (conversationMetrics.conversationStartTime && conversationMetrics.conversationEndTime) {
    conversationMetrics.totalDurationMs = 
      conversationMetrics.conversationEndTime.getTime() - 
      conversationMetrics.conversationStartTime.getTime();
  }

  if (totalResponseTimes.length > 0) {
    conversationMetrics.averageResponseTimeMs = 
      totalResponseTimes.reduce((a, b) => a + b, 0) / totalResponseTimes.length;
  }

  if (totalToolCallLatencies.length > 0) {
    conversationMetrics.averageToolCallLatencyMs = 
      totalToolCallLatencies.reduce((a, b) => a + b, 0) / totalToolCallLatencies.length;
  }

  if (firstUserMessageTime && firstToolCallTime) {
    conversationMetrics.timeToFirstToolCall = 
      firstToolCallTime.getTime() - firstUserMessageTime.getTime();
  }

  return { messagesWithMetrics, conversationMetrics };
}

export async function POST(req: Request) {
  try {
    await connectToMongoDB();
    const { id, messages, modelId, provider, mcpServer } = await req.json();

    // Process messages to extract metrics
    const { messagesWithMetrics, conversationMetrics } = processMessagesForMetrics(messages);

    const chat = new Chat({
      id,
      mcpServer: {
        id: mcpServer.id,
        name: mcpServer.name,
        description: mcpServer.description,
      },
      messages, // Keep original messages
      messagesWithMetrics, // Add processed metrics
      modelId,
      provider,
      conversationMetrics,
      createdAt: new Date(),
      updatedAt: new Date(),
      annotated: false,
      groundTruthAvailable: false,
    });

    await chat.save();
    
    return NextResponse.json({ 
      success: true, 
      chat: chat,
      metrics: conversationMetrics 
    });
  } catch (error: any) {
    console.error("Error saving chat:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    });
  }
}