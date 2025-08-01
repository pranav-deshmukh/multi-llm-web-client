import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { streamText, experimental_createMCPClient as createMCPClient } from 'ai';
import { Experimental_StdioMCPTransport as StdioMCPTransport } from 'ai/mcp-stdio';

export const maxDuration = 30;
export const providerMap = {
  openai,
  anthropic,
  google,
}

export async function POST(req: Request) {
  const requestData = await req.json();
  console.log('messages', requestData);
  const {modelId, provider, messages} = requestData;
  const providerFn = providerMap[provider];
  const mcpClient = await createMCPClient({
    transport: new StdioMCPTransport({
      command: 'node',
      args: ['C:\\Users\\prana\\OneDrive\\Desktop\\Code\\mcp-try\\index.js',], 
    }),
  });
  console.log('MCP client created', mcpClient.tools);

  const result =  streamText({
    model: providerFn(modelId),
    messages,
    tools: await mcpClient.tools(),
    maxSteps:10
  });

  return result.toDataStreamResponse();
}
