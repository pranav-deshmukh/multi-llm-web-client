// @ts-nocheck
'use client';


import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Clock, Target, Award } from 'lucide-react';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const response = await fetch('/api/evaluate/leaderboard');
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      setLoading(false);
    }
  };

  const normalizeResults = async () => {
    if (!confirm('This will recalculate all scores. Continue?')) return;
    
    try {
      const response = await fetch('/api/evaluate/normalize', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        alert(`Normalized ${data.message}`);
        loadLeaderboard();
      }
    } catch (error) {
      console.error('Failed to normalize:', error);
      alert('Normalization failed');
    }
  };

  const getColorForScore = (score) => {
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400';
    if (score >= 0.4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getRankMedal = (rank) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-5 h-5 text-amber-600" />;
    return <span className="text-zinc-500">#{rank}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-8 flex items-center justify-center">
        <div className="animate-pulse">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">MCP Benchmark Leaderboard</h1>
            <p className="text-zinc-400">Performance metrics across all models and MCPs</p>
          </div>
          <button
            onClick={normalizeResults}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Recalculate Scores
          </button>
        </div>

        {/* Overall Leaderboard */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden mb-8">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-xl font-semibold">Overall Rankings</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Model</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      <Award className="w-4 h-4" />
                      Composite
                    </div>
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      <Target className="w-4 h-4" />
                      TCPA
                    </div>
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4" />
                      RTE
                    </div>
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      RP
                    </div>
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Tests</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {leaderboard.map((model, index) => (
                  <tr
                    key={model.modelId}
                    className="hover:bg-zinc-800/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedModel(model)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getRankMedal(index + 1)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium">{model.modelName}</div>
                        <div className="text-xs text-zinc-500">{model.provider}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`text-lg font-bold ${getColorForScore(model.overall.avgComposite)}`}>
                        {(model.overall.avgComposite * 100).toFixed(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={getColorForScore(model.overall.avgTCPA)}>
                        {(model.overall.avgTCPA * 100).toFixed(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={getColorForScore(model.overall.avgRTE)}>
                        {(model.overall.avgRTE * 100).toFixed(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={getColorForScore(model.overall.avgRP)}>
                        {(model.overall.avgRP * 100).toFixed(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-zinc-400">
                      {model.overall.totalTests}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedModel(model);
                        }}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed View */}
        {selectedModel && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{selectedModel.modelName}</h2>
                <p className="text-sm text-zinc-400 mt-1">Performance breakdown by MCP server</p>
              </div>
              <button
                onClick={() => setSelectedModel(null)}
                className="text-zinc-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-zinc-800/50 p-4 rounded-lg">
                  <div className="text-xs text-zinc-400 mb-1">Composite Score</div>
                  <div className={`text-2xl font-bold ${getColorForScore(selectedModel.overall.avgComposite)}`}>
                    {(selectedModel.overall.avgComposite * 100).toFixed(1)}
                  </div>
                </div>
                <div className="bg-zinc-800/50 p-4 rounded-lg">
                  <div className="text-xs text-zinc-400 mb-1">Tool Accuracy</div>
                  <div className={`text-2xl font-bold ${getColorForScore(selectedModel.overall.avgTCPA)}`}>
                    {(selectedModel.overall.avgTCPA * 100).toFixed(1)}
                  </div>
                </div>
                <div className="bg-zinc-800/50 p-4 rounded-lg">
                  <div className="text-xs text-zinc-400 mb-1">Speed Score</div>
                  <div className={`text-2xl font-bold ${getColorForScore(selectedModel.overall.avgRTE)}`}>
                    {(selectedModel.overall.avgRTE * 100).toFixed(1)}
                  </div>
                </div>
                <div className="bg-zinc-800/50 p-4 rounded-lg">
                  <div className="text-xs text-zinc-400 mb-1">Result Quality</div>
                  <div className={`text-2xl font-bold ${getColorForScore(selectedModel.overall.avgRP)}`}>
                    {(selectedModel.overall.avgRP * 100).toFixed(1)}
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-4">Performance by MCP Server</h3>
              <div className="space-y-3">
                {selectedModel.perMcp?.map((mcp) => (
                  <div key={mcp.mcpServerId} className="bg-zinc-800/30 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">{mcp.mcpServerName}</div>
                      <div className="text-sm text-zinc-400">{mcp.testCount} tests</div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-zinc-400">Composite: </span>
                        <span className={getColorForScore(mcp.avgComposite)}>
                          {(mcp.avgComposite * 100).toFixed(1)}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400">TCPA: </span>
                        <span className={getColorForScore(mcp.avgTCPA)}>
                          {(mcp.avgTCPA * 100).toFixed(1)}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400">RTE: </span>
                        <span className={getColorForScore(mcp.avgRTE)}>
                          {(mcp.avgRTE * 100).toFixed(1)}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400">RP: </span>
                        <span className={getColorForScore(mcp.avgRP)}>
                          {(mcp.avgRP * 100).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Metric Explanations */}
        <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Metric Definitions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium mb-1 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                TCPA - Tool Call Process Accuracy
              </div>
              <p className="text-zinc-400">
                Measures whether the model selected the correct tools with valid arguments. 
                Score of 1.0 means perfect tool selection and execution.
              </p>
            </div>
            <div>
              <div className="font-medium mb-1 flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-400" />
                RTE - Response Time Efficiency
              </div>
              <p className="text-zinc-400">
                Normalized speed score. Higher values indicate faster response times 
                relative to other models tested.
              </p>
            </div>
            <div>
              <div className="font-medium mb-1 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                RP - Result Precision
              </div>
              <p className="text-zinc-400">
                Human-annotated quality of the final output. 1.0 is perfect, 
                0.5 is partial correctness, 0 is wrong.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <div className="font-medium mb-1 flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-400" />
              Composite Score
            </div>
            <p className="text-zinc-400 text-sm">
              Weighted average: <span className="font-mono">0.4×TCPA + 0.3×RTE + 0.3×RP</span>
              <br />
              Emphasizes tool accuracy while balancing speed and output quality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}