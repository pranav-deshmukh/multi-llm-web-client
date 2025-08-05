import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";


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

let mcpClient = null;

export async function POST(req: Request) {
  // console.log('messages', requestData);
  const { modelId, provider, messages } = await req.json();
  const providerFn = providerMap[provider];
  try {
    if (!mcpClient) {
      mcpClient = await createMCPClient({
        transport: new StdioMCPTransport({
          command: "node",
          args: [
            "C:\\Users\\prana\\OneDrive\\Desktop\\Code\\mcp-try\\index.js",
          ],
        }),
      });
    }
    const tools = await mcpClient.tools();
    console.log("MCP client created", typeof mcpClient);
    const result = streamText({
      model: providerFn(modelId),
      messages,
      tools: await mcpClient.tools(),
      maxSteps: 10,
    });

    return result.toDataStreamResponse();
  } catch (e) {
    mcpClient=null;
  }

}
