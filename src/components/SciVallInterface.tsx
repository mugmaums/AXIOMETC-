import React, { useState } from 'react';
import { FlaskConical, Play, Save, Database, BarChart3, Activity } from 'lucide-react';

export const SciVallInterface: React.FC = () => {
  const [modelType, setModelType] = useState('Quantum particle equations');
  const [simulationParams, setSimulationParams] = useState('dt: 0.001, iterations: 10000');
  const [results, setResults] = useState<string[]>([]);

  const runSimulation = () => {
    setResults(prev => [`[${new Date().toLocaleTimeString()}] Running ${modelType} simulation...`, ...prev]);
    setTimeout(() => {
      setResults(prev => [`[${new Date().toLocaleTimeString()}] Simulation complete. Confidence: 99.98%`, ...prev]);
    }, 1500);
  };

  return (
    <div className="bg-neutral-900/90 border border-blue-900/40 rounded-2xl p-6 shadow-2xl space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-white">Sci-Vall Scientific Analyzer</h3>
        </div>
        <button onClick={runSimulation} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2">
          <Play className="w-3.5 h-3.5" />
          <span>Run Simulation</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="block text-xs font-mono text-neutral-400">Data Model Format</label>
          <select value={modelType} onChange={(e) => setModelType(e.target.value)} className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-emerald-500">
            <option>Quantum particle equations</option>
            <option>Astrophysics orbital mechanics</option>
            <option>Chemical compound analysis</option>
            <option>Genomic sequencing models</option>
          </select>
          
          <label className="block text-xs font-mono text-neutral-400">Simulation Parameters</label>
          <input type="text" value={simulationParams} onChange={(e) => setSimulationParams(e.target.value)} className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-emerald-500" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <BarChart3 className="w-4 h-4" />
            <span>Hypothesis Testing Visualizer</span>
          </div>
          <div className="h-40 bg-black/60 border border-neutral-800 rounded-xl flex items-center justify-center text-neutral-600 font-mono text-xs">
            [Visualizer: Real-time Graphs]
          </div>
        </div>
      </div>

      <div className="p-5 bg-black/60 border border-neutral-800 rounded-xl font-mono text-xs text-emerald-300 space-y-2 h-40 overflow-y-auto">
        <p className="text-neutral-500">// Simulation Output Logs:</p>
        {results.map((log, i) => <p key={i}>{log}</p>)}
      </div>
    </div>
  );
};
