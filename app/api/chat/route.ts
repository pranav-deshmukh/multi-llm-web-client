import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import {
  streamText,
  experimental_createMCPClient as createMCPClient,
} from "ai";
import { Experimental_StdioMCPTransport as StdioMCPTransport } from "ai/mcp-stdio";
import { McpServerI } from "@/app/page";

export const maxDuration = 30;
export const providerMap: { [key: string]: any } = { openai, anthropic, google };

let mcpClients = new Map();

const cleanupMCPClient = async (clientId:string) => {
  const client = mcpClients.get(clientId);
  if (client) {
    try {
      if (typeof client.close === 'function') {
        await client.close();
      }
    } catch (error) {
      console.warn('Error closing MCP client:', error);
    }
    mcpClients.delete(clientId);
  }
};

const createMCPClientForServer = async (mcpServer:McpServerI) => {
  if (!mcpServer || mcpServer.id === "none" || !mcpServer.command) {
    return null;
  }

  const clientId = mcpServer.id;
  
  if (mcpClients.has(clientId)) {
    try {
      const existingClient = mcpClients.get(clientId);
      await existingClient.tools();
      return existingClient;
    } catch (error) {
      console.warn(`Existing MCP client for ${clientId} is not working, creating new one:`, error);
      await cleanupMCPClient(clientId);
    }
  }

  try {
    console.log(`Creating MCP client for server: ${mcpServer.name}`);
    
    const client = await createMCPClient({
      transport: new StdioMCPTransport({
        command: mcpServer.command,
        args: mcpServer.args || [],
      }),
    });

    const tools = await client.tools();
    console.log(`MCP client created successfully for ${mcpServer.name}. Available tools:`, Object.keys(tools).length);
    
    mcpClients.set(clientId, client);
    return client;
  } catch (error) {
    console.error(`Failed to create MCP client for ${mcpServer.name}:`, error);
    throw error;
  }
};

export async function POST(req: Request) {
  const requestStartTime = Date.now();
  
  try {
    const { modelId, provider, messages, mcpServer } = await req.json();
    
    console.log('Request received:', {
      modelId,
      provider,
      mcpServer: mcpServer?.name || 'none',
      messagesCount: messages?.length || 0,
      timestamp: new Date().toISOString()
    });

    const providerFn = providerMap[provider];
    if (!providerFn) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    let tools = {};
    let mcpClient = null;
    const toolSetupStartTime = Date.now();

    if (mcpServer && mcpServer.id !== "none") {
      try {
        mcpClient = await createMCPClientForServer(mcpServer);
        if (mcpClient) {
          tools = await mcpClient.tools();
          const toolSetupTime = Date.now() - toolSetupStartTime;
          console.log(`MCP setup time: ${toolSetupTime}ms - Using ${Object.keys(tools).length} tools`);
        }
      } catch (error) {
        console.error(`MCP server ${mcpServer.name} failed to initialize:`, error);
        console.log('Continuing without MCP tools...');
      }
    }

    const streamConfig = {
      model: providerFn(modelId),
      messages,
      tools: {},
      maxSteps: 10,
    };

    if (Object.keys(tools).length > 0) {
      streamConfig.tools = tools;
    }

    const modelInvokeStartTime = Date.now();
    const result = streamText(streamConfig);
    
    console.log(`Model invoked after ${modelInvokeStartTime - requestStartTime}ms`);

    return result.toDataStreamResponse();
  } catch (error:any) {
    console.error('API error:', error);
    
    if (mcpClients.size > 0) {
      console.log('Cleaning up MCP clients due to error...');
      for (const [clientId] of mcpClients) {
        await cleanupMCPClient(clientId);
      }
    }

    return new Response(
      JSON.stringify({ 
        error: error.message || "Unknown error",
        details: error.stack || "No stack trace available"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

process.on('SIGINT', async () => {
  console.log('Cleaning up MCP clients...');
  for (const [clientId] of mcpClients) {
    await cleanupMCPClient(clientId);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Cleaning up MCP clients...');
  for (const [clientId] of mcpClients) {
    await cleanupMCPClient(clientId);
  }
  process.exit(0);
});