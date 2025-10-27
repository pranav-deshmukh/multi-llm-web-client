import { useState } from "react";
import { ChevronDown, FileText, Settings, Globe, Zap, Search } from 'lucide-react';

export interface Model {
    id: string,
    name: string,
    provider: string,
    capabilities: string[],
    speed: string,
    description: string,
  }

export const ModelSelector = ({ selectedModel, onModelChange, models }:{
  selectedModel: Model,
  models: Model[],
  onModelChange: any,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-colors"
      >
        <span className="text-white">{selectedModel.name}</span>
        <ChevronDown className="w-4 h-4 text-zinc-400" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 w-80 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50">
          <div className="p-3 border-b border-zinc-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search models..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {models.map((model) => (
              <button
                key={model.name}
                onClick={() => {
                  onModelChange(model);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-zinc-800 border-b border-zinc-800 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {model.provider.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium">{model.name}</span>
                      {model.capabilities.includes('vision') && (
                        <FileText className="w-4 h-4 text-blue-400" />
                      )}
                      {model.capabilities.includes('tools') && (
                        <Settings className="w-4 h-4 text-green-400"  />
                      )}
                      {model.capabilities.includes('web') && (
                        <Globe className="w-4 h-4 text-purple-400"  />
                      )}
                      {model.speed === 'fast' && (
                        <Zap className="w-4 h-4 text-yellow-400"  />
                      )}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {model.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};