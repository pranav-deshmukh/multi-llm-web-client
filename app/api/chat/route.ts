import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { streamText, experimental_createMCPClient as createMCPClient } from 'ai';
import { Experimental_StdioMCPTransport as StdioMCPTransport } from 'ai/mcp-stdio';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const mcpClient = await createMCPClient({
    transport: new StdioMCPTransport({
      command: 'node',
      args: ['C:\\Users\\prana\\OneDrive\\Desktop\\Code\\mcp-try\\index.js',], 
    }),
  });
  console.log('MCP client created', mcpClient.tools);

  const result =  streamText({
    model: anthropic('claude-3-haiku-20240307'),
    messages,
    tools: await mcpClient.tools(),
    maxSteps:10
  });

  return result.toDataStreamResponse();
}
