// @ts-nocheck

"use client";
import React, { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import {
  ChevronDown,
  FileText,
  Settings,
  Globe,
  Zap,
  Search,
  Server,
} from "lucide-react";
import { ModelSelector } from "@/components/model-selector/page";
import { models } from "@/data/models";
import { Toaster, toast } from "sonner";
import TestRunner from "@/components/test-runner/TestRunner";

export interface McpServerI{
  id: string,
  name: string,
  description: string,
  command: string,
  args: string[],
}

const mcpServers = [
  {
    id: "none",
    name: "No MCP Server",
    description: "Use AI model without MCP tools",
    command: null,
    args: null,
  },
  {
    id: "calculator",
    name: "Calculator Server",
    description: "Python-based calculator MCP server",
    command: "python",
    args: ["-m", "mcp_server_calculator"],
  },
  {
    id: "google scholar",
    name: "Google Scholar Server",
    description: "Python-based google scholar MCP server",
    command: "python",
    args: ["C:/Users/prana/OneDrive/Desktop/MCPs/Google-Scholar-MCP-Server/google_scholar_server.py"],
  },
  {
    id: "blender",
    name: "Blender Server",
    description: "Node.js Blender MCP server",
    command: "node",
    args: ["C:/Users/prana/OneDrive/Desktop/Code/mcp-try/index.js"],
  },
  // Add more MCP servers here as needed
  {
    id: "figma",
    name: "Framelink Figma MCP",
    description: "Figma API MCP server for design operations",
    command: "node",
    args: [
      "C:/Users/prana/OneDrive/Desktop/Code/Figma-Context-MCP/dist/cli.js",
      `--figma-api-key=${process.env.FIGMA_API_KEY}`,
      "--stdio",
    ],
  },
  {
  "id": "mongodb",
  "name": "MongoDB MCP",
  "command": "docker",
  "args": [
    "run",
    "--rm",
    "-i",
    "-e",
    "MDB_MCP_CONNECTION_STRING=mongodb+srv://pranavdeshmukh190_db_user:D3FbjgdkXKZGeAnQ@llm-benchmarking.5vb7sna.mongodb.net/mcp",
    "-e",
    "MDB_MCP_READ_ONLY=true",
    "mongodb/mongodb-mcp-server:latest"
  ]
  
},
{
  id: "github",
  name: "GitHub MCP (Docker)",
  command: "docker",
  args: [
    "run",
    "--rm",
    "-i",
    "-e",
    `GITHUB_PERSONAL_ACCESS_TOKEN=${process.env.NEXT_PUBLIC_GITHUB_PERSONAL_ACCESS_TOKEN}`,
    "ghcr.io/github/github-mcp-server:latest"
  ]
},
{
    id: "notion",
    name: "Notion MCP",
    command: "docker",
    args: [
      "run",
      "--rm",
      "-i",
      "-e",
      "NOTION_TOKEN",
      "mcp/notion"
    ],
    env: {
      NOTION_TOKEN: `${process.env.NEXT_PUBLIC_NOTION_TOKEN}`
    }
  }


];
const MCPServerSelector = ({ selectedServer, onServerChange, servers }:{servers:McpServerI[], selectedServer:McpServerI, onServerChange:any}) => {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
  console.log(process.env.NEXT_PUBLIC_NOTION_TOKEN)
}, [])

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm hover:border-zinc-500 focus:outline-none focus:border-zinc-500"
      >
        <Server className="w-4 h-4" />
        <span className="max-w-32 truncate">{selectedServer.name}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 w-80 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
          {servers.map((server) => (
            <button
              key={server.id}
              onClick={() => {
                onServerChange(server);
                setIsOpen(false);
              }}
              className="w-full text-left p-3 hover:bg-zinc-800 first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">
                      {server.name}
                    </span>
                    {server.id === selectedServer.id && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    {server.description}
                  </div>
                  {server.command && (
                    <div className="text-xs text-zinc-500 mt-1 font-mono">
                      {server.command} {server.args?.join(" ")}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Chat = () => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [selectedModel, setSelectedModel] = useState({
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    capabilities: ["tools", "vision", "web"],
    speed: "medium",
    description: "Most capable model for complex tasks",
  });

  const [selectedMCPServer, setSelectedMCPServer] = useState(mcpServers[0]);

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat",
      experimental_prepareRequestBody: ({ messages, id, ...rest }) => ({
        messages,
        id,
        ...rest,
        modelId: selectedModel.id,
        provider: selectedModel.provider,
        mcpServer: selectedMCPServer,
      }),
    });

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
      console.log(messages)
    }
  }, [messages]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const syntheticEvent = {
      preventDefault: () => {},
      target: { value: input },
    };

    handleSubmit(syntheticEvent);
  };

  const renderMessageContent = (message) => {
    const parts = [];

    if (message.parts && message.parts.length > 0) {
      message.parts.forEach((part, i) => {
        switch (part.type) {
          case "text":
            parts.push(
              <div
                key={`part-text-${i}`}
                className="text-white whitespace-pre-wrap"
              >
                {part.text}
              </div>
            );
            break;
          case "step-start":
            parts.push(
              <div
                key={`part-step-${i}`}
                className="text-blue-400 text-sm flex items-center gap-1"
              >
                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                Processing...
              </div>
            );
            break;
          case "source":
            parts.push(
              <div key={`part-source-${i}`} className="text-blue-400 underline">
                <a
                  href={part.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Source: {part.source.url}
                </a>
              </div>
            );
            break;
          case "reasoning":
            parts.push(
              <div
                key={`part-reasoning-${i}`}
                className="bg-yellow-900/30 border border-yellow-600 text-yellow-100 p-3 rounded-lg mt-2"
              >
                <div className="text-yellow-200 font-semibold mb-1">
                  Reasoning:
                </div>
                {part.reasoning}
              </div>
            );
            break;
          case "tool-invocation":
            const toolInv = part.toolInvocation;
            parts.push(
              <div
                key={`part-tool-${i}`}
                className="bg-purple-900/30 border border-purple-600 rounded-lg p-3 mt-2"
              >
                <div className="text-purple-300 font-semibold flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Tool: {toolInv?.toolName || "Unknown"}
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      toolInv?.state === "call"
                        ? "bg-yellow-600 text-yellow-100"
                        : toolInv?.state === "result"
                        ? "bg-green-600 text-green-100"
                        : "bg-gray-600 text-gray-100"
                    }`}
                  >
                    {toolInv?.state || "unknown"}
                  </span>
                </div>
                {toolInv?.args && Object.keys(toolInv.args).length > 0 && (
                  <pre className="text-purple-100 text-xs bg-purple-900/50 p-2 rounded mt-2 overflow-x-auto">
                    {JSON.stringify(toolInv.args, null, 2)}
                  </pre>
                )}
                {toolInv?.result && (
                  <div className="mt-2">
                    <div className="text-green-200 text-sm">Result:</div>
                    <div className="bg-green-900/30 p-2 rounded mt-1">
                      {toolInv.result.content &&
                        toolInv.result.content.map(
                          (contentItem, contentIndex) => {
                            if (contentItem.type === "text") {
                              return (
                                <div
                                  key={contentIndex}
                                  className="text-green-100 text-sm whitespace-pre-wrap"
                                >
                                  {contentItem.text}
                                </div>
                              );
                            }
                            return (
                              <pre
                                key={contentIndex}
                                className="text-green-100 text-xs overflow-x-auto"
                              >
                                {JSON.stringify(contentItem, null, 2)}
                              </pre>
                            );
                          }
                        )}
                      {!toolInv.result.content && (
                        <pre className="text-green-100 text-xs overflow-x-auto">
                          {typeof toolInv.result === "string"
                            ? toolInv.result
                            : JSON.stringify(toolInv.result, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
            break;
          case "tool-result":
            parts.push(
              <div
                key={`part-tool-result-${i}`}
                className="bg-green-900/30 border border-green-600 rounded-lg p-3 mt-2"
              >
                <div className="text-green-300 font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Tool Result: {part.toolCallId}
                </div>
                <pre className="text-green-100 text-xs bg-green-900/50 p-2 rounded mt-2 overflow-x-auto">
                  {typeof part.result === "string"
                    ? part.result
                    : JSON.stringify(part.result, null, 2)}
                </pre>
              </div>
            );
            break;
          case "file":
            parts.push(
              <img
                key={`part-file-${i}`}
                src={`data:${part.mimeType};base64,${part.data}`}
                alt="AI Output"
                className="rounded max-w-xs mt-2"
              />
            );
            break;
          default:
            parts.push(
              <div
                key={`part-unknown-${i}`}
                className="text-red-400 italic bg-red-900/20 p-2 rounded mt-2"
              >
                Unsupported part type: {part.type}
                <pre className="text-xs mt-1 text-red-300">
                  {JSON.stringify(part, null, 2)}
                </pre>
              </div>
            );
        }
      });
    }

    if (parts.length === 0) {
      parts.push(
        <div
          key="fallback"
          className="text-gray-400 bg-gray-900/20 p-2 rounded"
        >
          <div className="text-sm">Raw message data:</div>
          <pre className="text-xs mt-1 overflow-x-auto">
            {JSON.stringify(message, null, 2)}
          </pre>
        </div>
      );
    }

    return <div className="space-y-2">{parts}</div>;
  };

  // Update the storeData function in your Chat component
const storeData = async () => {
  // Generate a unique test case ID based on the prompt
  const testCaseId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const prompt = messages.find(m => m.role === "user")?.content || "";

  const response = await fetch("/api/benchmark/store", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      modelId: selectedModel.id,
      modelName: selectedModel.name,
      provider: selectedModel.provider,
      mcpServer: selectedMCPServer,
      testCaseId,
      prompt,
      messages: messages,
      testSuiteVersion: "v1.0",
    }),
  });

  if (response.ok) {
    const data = await response.json();
    toast.success(`Test case stored! (${data.testCasesCompleted} tests completed)`);
    console.log("Current metrics:", data.currentMetrics);
  } else {
    toast.error("Failed to store test case");
    console.error("Failed to store data:", response.statusText);
  }
};

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <Toaster position="top-center" richColors />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {messages.map((message) => (
            <div key={message.id} className="mb-6">
              <div
                className={`flex items-start gap-3 ${
                  message.role === "user" ? "justify-end" : ""
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">✦</span>
                  </div>
                )}
                <div
                  className={`max-w-2xl ${
                    message.role === "user" ? "bg-zinc-800 rounded-lg p-3" : ""
                  }`}
                >
                  {renderMessageContent(message)}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef}></div>
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
        <div className="max-w-[1000px] mx-auto">
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
                    if (e.key === "Enter" && !e.shiftKey) {
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
              <MCPServerSelector
              
                selectedServer={selectedMCPServer}
                onServerChange={setSelectedMCPServer}
                servers={mcpServers}
              />
              <button
                onClick={storeData}
                className="bg-gray-800 p-2 rounded-lg text-sm"
              >
                Store Data
              </button>
              <TestRunner selectedMCPServer={selectedMCPServer} selectedModel={selectedModel} />
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
            <span>Using {selectedModel.name}</span>
            {selectedMCPServer.id !== "none" && (
              <span className="flex items-center gap-1">
                <Server className="w-3 h-3" />
                {selectedMCPServer.name}
              </span>
            )}
            {selectedModel.capabilities.includes("tools") && (
              <span className="flex items-center gap-1">
                <Settings className="w-3 h-3" />
                Tools
              </span>
            )}
            {selectedModel.capabilities.includes("vision") && (
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
