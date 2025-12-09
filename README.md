# 🛠️ MCP-Workbench (Multi-LLM Client)

> **The integrated environment to Debug, Benchmark, and Evaluate your Model Context Protocol (MCP) servers.**


## 🚨 The Problem

Building **Model Context Protocol (MCP)** servers is the easy part. Debugging them is hard.

When your LLM fails to use a tool correctly, is it because:
1. The model is not capable enough?
2. The tool description is vague?
3. The JSON schema is malformed?

**MCP-Workbench** is an open-source interface that lets you plug in any MCP server, chat with it using multiple models (Claude, GPT-4, etc.), and **run statistical evaluations** on tool performance.



## ✨ Key Features

### 🔌 Universal MCP Inspector
Connect any local or remote MCP server (Filesystem, Brave Search, Postgres, etc.) directly to the web client.
- **Tool Discovery:** Auto-detects available tools and resources.
- **Interactive Chat:** Test tools manually in a chat interface to verify logic.

### 📊 Eval-Stats Dashboard
*Switch to the `eval-stats` branch to access this feature.*
Stop guessing. Run evaluation datasets against your connected MCP tools.
- **Success Rate Tracking:** See how often the model successfully calls the tool vs. failing.
- **Performance Metrics:** Track latency and execution reliability for your tools.
- **Data-Driven Optimization:** Use the stats to refine your tool descriptions and schemas.

### ⚔️ Multi-Model Support
Compare how different models handle your tools.
- Does `gpt-4o` handle your complex schema better than `claude-3-5-sonnet`?
- Switch models instantly to verify cross-model compatibility.



## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** MongoDB (Chat history & Eval logs)
- **AI Integration:** Anthropic SDK / OpenAI SDK / MCP SDK

