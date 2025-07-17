import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, modelId, provider } = await req.json();

  let selectedModel;
  
  switch (provider) {
    case 'openai':
      selectedModel = openai(modelId);
      break;
    case 'anthropic':
      selectedModel = anthropic(modelId);
      break;
    case 'google':
      selectedModel = google(modelId);
      break;
    default:
      // Default to Claude Haiku if no provider specified
      selectedModel = anthropic('claude-3-haiku-20240307');
  }

  const result = streamText({
    model: selectedModel,
    messages,
  });

  return result.toDataStreamResponse();
}