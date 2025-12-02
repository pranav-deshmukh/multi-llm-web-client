// @ts-nocheck

'use client';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Save } from 'lucide-react';

export default function AnnotationInterface() {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [annotations, setAnnotations] = useState({
    toolSelectionCorrect: null,
    argumentsCorrect: null,
    resultQuality: 0.5,
    notes: ''
  });

  useEffect(() => {
    loadQueue();
  }, []);

  useEffect(() => {
    if (queue.length > 0) {
      setCurrent(queue[currentIndex]);
      resetAnnotations();
    }
  }, [currentIndex, queue]);

  const loadQueue = async () => {
    try {
      const response = await fetch('/api/evaluate/queue');
      const data = await response.json();
      setQueue(data.evaluations || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load queue:', error);
      setLoading(false);
    }
  };

  const resetAnnotations = () => {
    if (current?.manual) {
      setAnnotations({
        toolSelectionCorrect: current.manual.toolSelectionCorrect,
        argumentsCorrect: current.manual.argumentsCorrect,
        resultQuality: current.manual.resultQuality || 0.5,
        notes: current.manual.notes || ''
      });
    } else {
      setAnnotations({
        toolSelectionCorrect: null,
        argumentsCorrect: null,
        resultQuality: 0.5,
        notes: ''
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/evaluate/annotate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluationId: current._id,
          manual: {
            ...annotations,
            annotatorId: 'annotator_1',
            annotatedAt: new Date().toISOString()
          }
        })
      });

      if (response.ok) {
        if (currentIndex < queue.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          alert('All annotations completed!');
        }
      }
    } catch (error) {
      console.error('Failed to submit annotation:', error);
      alert('Failed to save annotation');
    }
  };

  const goNext = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-8 flex items-center justify-center">
        <div className="animate-pulse">Loading annotations...</div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h1 className="text-2xl font-bold">All Caught Up!</h1>
          <p className="text-zinc-400 mt-2">No evaluations pending annotation.</p>
        </div>
      </div>
    );
  }

  const getQualityLabel = (value) => {
    if (value === 0) return 'Wrong (0)';
    if (value === 0.25) return 'Poor (0.25)';
    if (value === 0.5) return 'Partial (0.5)';
    if (value === 0.75) return 'Good (0.75)';
    if (value === 1) return 'Perfect (1.0)';
    return `${value}`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Annotation Interface</h1>
          <div className="text-zinc-400">
            {currentIndex + 1} / {queue.length}
          </div>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-2 mt-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / queue.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Test Case Info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-zinc-400">Test ID:</span>
              <span className="ml-2 font-mono">{current.testCaseId}</span>
            </div>
            <div>
              <span className="text-zinc-400">Model:</span>
              <span className="ml-2">{current.modelName}</span>
            </div>
            <div>
              <span className="text-zinc-400">MCP:</span>
              <span className="ml-2">{current.mcpServerName}</span>
            </div>
            <div>
              <span className="text-zinc-400">Difficulty:</span>
              <span className="ml-2 capitalize">{current.difficulty}</span>
            </div>
          </div>
        </div>

        {/* Prompt */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">Prompt</h3>
          <p className="text-zinc-300">{current.prompt}</p>
        </div>

        {/* Expected vs Actual */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-green-400">Expected</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-zinc-400">Tools:</span>
                <pre className="mt-1 text-xs bg-zinc-950 p-2 rounded">
                  {JSON.stringify(current.expectedTools, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-blue-400">Actual</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-zinc-400">Tools Used:</span>
                <pre className="mt-1 text-xs bg-zinc-950 p-2 rounded">
                  {JSON.stringify(current.automated?.toolCallSequence || [], null, 2)}
                </pre>
              </div>
              <div>
                <span className="text-zinc-400">Success:</span>
                <span className={`ml-2 ${current.automated?.toolCallSuccess ? 'text-green-400' : 'text-red-400'}`}>
                  {current.automated?.toolCallSuccess ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="text-zinc-400">Response Time:</span>
                <span className="ml-2">{current.automated?.responseTimeMs}ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Model Response */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">Model Response</h3>
          <div className="bg-zinc-950 p-4 rounded text-sm max-h-64 overflow-y-auto">
            {current.messages?.map((msg, idx) => (
              <div key={idx} className="mb-2">
                <span className="text-zinc-500 text-xs">{msg.role}:</span>
                <p className="text-zinc-300">{msg.content || '[Tool invocation]'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Annotation Form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Your Annotation</h3>
          
          <div className="space-y-6">
            {/* Tool Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Were the correct tools selected?
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setAnnotations({...annotations, toolSelectionCorrect: true})}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                    annotations.toolSelectionCorrect === true
                      ? 'border-green-500 bg-green-500/20 text-green-400'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <CheckCircle className="w-5 h-5 mx-auto mb-1" />
                  Yes
                </button>
                <button
                  onClick={() => setAnnotations({...annotations, toolSelectionCorrect: false})}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                    annotations.toolSelectionCorrect === false
                      ? 'border-red-500 bg-red-500/20 text-red-400'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <XCircle className="w-5 h-5 mx-auto mb-1" />
                  No
                </button>
              </div>
            </div>

            {/* Arguments Correct */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Were the arguments/parameters correct?
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setAnnotations({...annotations, argumentsCorrect: true})}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                    annotations.argumentsCorrect === true
                      ? 'border-green-500 bg-green-500/20 text-green-400'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <CheckCircle className="w-5 h-5 mx-auto mb-1" />
                  Yes
                </button>
                <button
                  onClick={() => setAnnotations({...annotations, argumentsCorrect: false})}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                    annotations.argumentsCorrect === false
                      ? 'border-red-500 bg-red-500/20 text-red-400'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <XCircle className="w-5 h-5 mx-auto mb-1" />
                  No
                </button>
              </div>
            </div>

            {/* Result Quality */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Result Quality: {getQualityLabel(annotations.resultQuality)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.25"
                value={annotations.resultQuality}
                onChange={(e) => setAnnotations({...annotations, resultQuality: parseFloat(e.target.value)})}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-zinc-500 mt-1">
                <span>Wrong</span>
                <span>Poor</span>
                <span>Partial</span>
                <span>Good</span>
                <span>Perfect</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Notes (optional)
              </label>
              <textarea
                value={annotations.notes}
                onChange={(e) => setAnnotations({...annotations, notes: e.target.value})}
                placeholder="Any additional observations..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-sm focus:outline-none focus:border-zinc-500 min-h-[80px]"
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={goPrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <button
            onClick={handleSubmit}
            disabled={annotations.toolSelectionCorrect === null || annotations.argumentsCorrect === null}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
          >
            <Save className="w-4 h-4" />
            Save & Next
          </button>

          <button
            onClick={goNext}
            disabled={currentIndex === queue.length - 1}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}