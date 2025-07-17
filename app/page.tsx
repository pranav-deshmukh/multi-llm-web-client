'use client'
import React, { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { ChevronDown, FileText, Settings, Globe, Zap, Search } from 'lucide-react';
import {ModelSelector} from "@/components/model-selector/page"




const Chat = () => {
  const [selectedModel, setSelectedModel] = useState({
    id: 'claude-3-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    capabilities: ['tools', 'vision', 'web'],
    speed: 'medium',
    description: 'Most capable model for complex tasks'
  });

  const models = [
    {
      id: 'gpt-4',
      name: 'GPT-4 Turbo',
      provider: 'openai',
      capabilities: ['tools', 'vision'],
      speed: 'medium',
      description: 'OpenAI\'s most capable model'
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'openai',
      capabilities: ['tools', 'vision'],
      speed: 'fast',
      description: 'Faster, cost-effective model'
    },
    {
      id: 'claude-3-sonnet',
      name: 'Claude 3.5 Sonnet',
      provider: 'anthropic',
      capabilities: ['tools', 'vision', 'web'],
      speed: 'medium',
      description: 'Most capable model for complex tasks'
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      capabilities: ['tools', 'vision'],
      speed: 'slow',
      description: 'Highest quality reasoning'
    },
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'google',
      capabilities: ['tools', 'vision'],
      speed: 'fast',
      description: 'Google\'s multimodal AI'
    },
    
  ];

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({});

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const syntheticEvent = {
      preventDefault: () => { },
      target: { value: input }
    };

    handleSubmit(syntheticEvent);
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {messages.map(message => (
            <div key={message.id} className="mb-6">
              <div className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">✦</span>
                  </div>
                )}
                <div className={`max-w-2xl ${message.role === 'user' ? 'bg-zinc-800 rounded-lg p-3' : ''}`}>
                  <div className="whitespace-pre-wrap">
                    {message.content || (
                      message.parts?.map((part, i) => {
                        switch (part.type) {
                          case 'text':
                            return <div key={`${message.id}-${i}`}>{part.text}</div>;
                          default:
                            return null;
                        }
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">✦</span>
                </div>
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-100"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-200"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-zinc-800 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Your message..."
                  className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg resize-none focus:outline-none focus:border-zinc-500 min-h-[50px] max-h-32"
                  rows={1}
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleFormSubmit(e);
                    }
                  }}
                />
              </div>
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                models={models}
              />
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
            <span>Using {selectedModel.name}</span>
            {selectedModel.capabilities.includes('tools') && (
              <span className="flex items-center gap-1">
                <Settings className="w-3 h-3" />
                Tools
              </span>
            )}
            {selectedModel.capabilities.includes('vision') && (
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Vision
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;