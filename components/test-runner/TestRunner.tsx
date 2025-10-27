// components/test-runner/TestRunner.tsx
"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import { testSuite, getTestById } from "@/data/testSuite";

export default function TestRunner({ selectedModel, selectedMCPServer }) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [currentTest, setCurrentTest] = useState(null);

  const runTestSuite = async (mcpId) => {
    const tests = testSuite[mcpId];
    if (!tests) {
      toast.error(`No tests found for MCP: ${mcpId}`);
      return;
    }

    setRunning(true);
    setProgress({ current: 0, total: tests.length });

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      setCurrentTest(test);
      setProgress({ current: i + 1, total: tests.length });

      try {
        // Run the test
        const result = await runSingleTest(test);
        
        // Store in database
        await storeTestResult(result);
        
        toast.success(`Test ${test.id} completed`);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        toast.error(`Test ${test.id} failed: ${error.message}`);
        console.error(error);
      }
    }

    setRunning(false);
    setCurrentTest(null);
    toast.success(`Test suite completed: ${tests.length} tests`);
  };

  const runSingleTest = async (test) => {
    // Call the chat API with the test prompt
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: test.prompt,
            createdAt: new Date().toISOString()
          }
        ],
        modelId: selectedModel.id,
        provider: selectedModel.provider,
        mcpServer: selectedMCPServer
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    // Parse streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let messages = [];
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      
      // Parse data stream (AI SDK format)
      const lines = buffer.split("\n");
      buffer = lines.pop(); // Keep incomplete line

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "message") {
              messages.push(data.message);
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }

    return {
      testCaseId: test.id,
      prompt: test.prompt,
      expectedTools: test.expectedTools,
      expectedArgs: test.expectedArgs,
      difficulty: test.difficulty,
      category: test.category,
      messages: messages,
      modelId: selectedModel.id,
      modelName: selectedModel.name,
      provider: selectedModel.provider,
      mcpServerId: selectedMCPServer.id,
      mcpServerName: selectedMCPServer.name,
      timestamp: new Date().toISOString()
    };
  };

  const storeTestResult = async (result) => {
    const response = await fetch("/api/evaluate/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result)
    });

    if (!response.ok) {
      throw new Error("Failed to store test result");
    }

    return response.json();
  };

  const runAllTests = async () => {
    if (selectedMCPServer.id === "none") {
      toast.error("Please select an MCP server");
      return;
    }

    await runTestSuite(selectedMCPServer.id);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Test Runner</h2>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-zinc-400">Model: {selectedModel.name}</p>
          <p className="text-sm text-zinc-400">MCP: {selectedMCPServer.name}</p>
        </div>

        {running && (
          <div>
            <div className="mb-2">
              <p className="text-sm">
                Running test {progress.current} of {progress.total}
              </p>
              <div className="w-full bg-zinc-800 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(progress.current / progress.total) * 100}%`
                  }}
                />
              </div>
            </div>

            {currentTest && (
              <div className="bg-zinc-800 p-3 rounded mt-2">
                <p className="text-xs text-zinc-400">Current Test:</p>
                <p className="text-sm">{currentTest.id}</p>
                <p className="text-xs text-zinc-400 mt-1">{currentTest.prompt}</p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={runAllTests}
          disabled={running || selectedMCPServer.id === "none"}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          {running ? "Running Tests..." : "Run Test Suite"}
        </button>

        <div className="text-xs text-zinc-500 mt-2">
          <p>Available tests:</p>
          <ul className="list-disc list-inside mt-1">
            {Object.entries(testSuite).map(([mcpId, tests]) => (
              <li key={mcpId}>
                {mcpId}: {tests.length} tests
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}