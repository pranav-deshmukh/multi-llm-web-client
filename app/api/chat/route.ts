import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import path from "path";
import {
  streamText,
  experimental_createMCPClient as createMCPClient,
} from "ai";
import { Experimental_StdioMCPTransport as StdioMCPTransport } from "ai/mcp-stdio";

export const maxDuration = 30;

export const providerMap = {
  openai,
  anthropic,
  google,
};

// Cache for MCP clients to avoid recreating them
let mcpClients = new Map();

// Clean up function for MCP clients
const cleanupMCPClient = async (clientId) => {
  const client = mcpClients.get(clientId);
  if (client) {
    try {
      // Close the client if it has a close method
      if (typeof client.close === 'function') {
        await client.close();
      }
    } catch (error) {
      console.warn('Error closing MCP client:', error);
    }
    mcpClients.delete(clientId);
  }
};

const createMCPClientForServer = async (mcpServer) => {
  // If no MCP server selected or it's "none", return null
  if (!mcpServer || mcpServer.id === "none" || !mcpServer.command) {
    return null;
  }

  const clientId = mcpServer.id;
  
  // Check if we already have a client for this server
  if (mcpClients.has(clientId)) {
    try {
      const existingClient = mcpClients.get(clientId);
      // Test if the client is still working by trying to get tools
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

    // Test the client by getting tools
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
  try {
    const { modelId, provider, messages, mcpServer } = await req.json();
    
    console.log('Request received:', {
      modelId,
      provider,
      mcpServer: mcpServer?.name || 'none',
      messagesCount: messages?.length || 0
    });

    const providerFn = providerMap[provider];
    if (!providerFn) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    let tools = {};
    let mcpClient = null;

    // Create MCP client if server is specified
    if (mcpServer && mcpServer.id !== "none") {
      try {
        mcpClient = await createMCPClientForServer(mcpServer);
        if (mcpClient) {
          tools = await mcpClient.tools();
          console.log(`Using MCP server: ${mcpServer.name} with ${Object.keys(tools).length} tools`);
        }
      } catch (error) {
        console.error(`MCP server ${mcpServer.name} failed to initialize:`, error);
        // Continue without MCP tools rather than failing the entire request
        console.log('Continuing without MCP tools...');
      }
    }

    const streamConfig = {
      model: providerFn(modelId),
      messages,
      maxSteps: 10,
    };

    // Only add tools if we have them
    if (Object.keys(tools).length > 0) {
      streamConfig.tools = tools;
    }

    const result = streamText(streamConfig);

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('API error:', error);
    
    // Clean up all MCP clients on error
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

// Optional: Add cleanup on process termination
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