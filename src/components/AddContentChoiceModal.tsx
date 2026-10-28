import React, { useState } from 'react';
import {
  X,
  Plus,
  Sparkles,
  PenLine,
  ImagePlus,
  Link2,
  FolderUp,
  Loader2,
  Zap,
} from 'lucide-react';
import type { BlockType } from '../types';
import { AxiometicBubbleGraphic, AxiometicLogo } from './AxiometicBubbleGraphic';

interface AddContentChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectManual: (type: BlockType) => void;
  onSelectAi: (prompt: string) => Promise<any>;
  isAiGenerating: boolean;
}

export const AddContentChoiceModal: React.FC<AddContentChoiceModalProps> = ({
  isOpen,
  onClose,
  onSelectManual,
  onSelectAi,
  isAiGenerating,
}) => {
  const [activeTab, setActiveTab] = useState<'choice' | 'ai'>('choice');
  const [aiPrompt, setAiPrompt] = useState('');

  if (!isOpen) return null;

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || isAiGenerating) return;
    await onSelectAi(aiPrompt.trim());
    setAiPrompt('');
  };

  const handleQuickPrompt = (promptText: string) => {
    setAiPrompt(promptText);
    setActiveTab('ai');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 text-[#F8FAFC]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-[#F8FAFC] rounded-lg hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#F8FAFC] tracking-tight">Add Content to Canvas</h3>
            <p className="text-xs text-slate-400">Choose between manual creation or instant AI generation with Vaelourix</p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 mb-5 p-1 bg-slate-900 border border-slate-700/80 rounded-lg">
          <button
            onClick={() => setActiveTab('choice')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'choice' ? 'bg-[#2563EB] text-[#F8FAFC] shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Manual Creation
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'ai'
                ? 'bg-[#2563EB] text-[#F8FAFC] shadow-sm'
                : 'text-slate-400 hover:text-blue-300'
            }`}
          >
            <AxiometicLogo size={14} />
            <span>AI Generation (Vaelourix)</span>
          </button>
        </div>

        {activeTab === 'choice' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onSelectManual('text');
                  onClose();
                }}
                className="flex items-start gap-3 p-4 bg-slate-900/60 hover:bg-slate-700/60 border border-slate-700/80 hover:border-blue-500/50 rounded-xl transition-all text-left group"
              >
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                  <PenLine className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Write Article / Text</h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Essays, research notes, technical manifestos with clean typography.
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  onSelectManual('button');
                  onClose();
                }}
                className="flex items-start gap-3 p-4 bg-[#0a0d14] hover:bg-neutral-900/80 border border-neutral-800 hover:border-purple-500/50 rounded-xl transition-all text-left group"
              >
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Dynamic Active Button</h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Alert triggers, interactive form submissions, or live counters.
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  onSelectManual('picture');
                  onClose();
                }}
                className="flex items-start gap-3 p-4 bg-[#0a0d14] hover:bg-neutral-900/80 border border-neutral-800 hover:border-emerald-500/50 rounded-xl transition-all text-left group"
              >
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                  <ImagePlus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Upload Picture</h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Select device image, choose aspect ratios, and add captions.
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  onSelectManual('link');
                  onClose();
                }}
                className="flex items-start gap-3 p-4 bg-[#0a0d14] hover:bg-neutral-900/80 border border-neutral-800 hover:border-amber-500/50 rounded-xl transition-all text-left group"
              >
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Link2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Upload Link</h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Interactive resource cards with domain resolution and click tracking.
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  onSelectManual('file');
                  onClose();
                }}
                className="flex items-start gap-3 p-4 bg-[#0a0d14] hover:bg-neutral-900/80 border border-neutral-800 hover:border-cyan-500/50 rounded-xl transition-all text-left group sm:col-span-2"
              >
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
                  <FolderUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Secure File Storage Asset</h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    PDF, documents, ZIP archives stored securely in designated storage.
                  </p>
                </div>
              </button>
            </div>

            <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
              <span>Prefer AI?</span>
              <button
                onClick={() => setActiveTab('ai')}
                className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1.5"
              >
                <AxiometicLogo size={14} />
                <span>Switch to Vaelourix AI generation</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAiSubmit} className="space-y-4">
            {/* AXIOMETIC Circular Fading Bubble Showcase */}
            <div className="p-4 bg-gradient-to-r from-blue-950/30 via-purple-950/20 to-neutral-900 border border-blue-500/30 rounded-xl flex items-center gap-4">
            <AxiometicBubbleGraphic size="md" isAnimated={true} showHalo={true} />
              <div className="text-xs text-neutral-200">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-white text-sm">vaelourix</p>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-900/60 border border-blue-400/30 text-cyan-300">
                    AXIOMETIC AI
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                  Instruct Vaelourix in natural language to generate any content block, active dynamic button, or publication. It executes and publishes directly to the canvas in real-time.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                What would you like Vaelourix to generate?
              </label>
              <textarea
                rows={4}
                required
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Write a technical article about real-time distributed systems, OR create a dynamic alert button for a server maintenance advisory, OR add a community upvote button..."
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-[#F8FAFC] placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] leading-relaxed font-sans"
              />
            </div>

            {/* Quick Inspiration Options */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 font-medium">Quick suggestions:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickPrompt('Write a manifesto on the future of autonomous agent architecture')}
                  className="px-2.5 py-1 text-[11px] bg-slate-700/80 hover:bg-slate-700 border border-slate-600 rounded-md text-slate-200 transition-colors"
                >
                  Write Architecture Manifesto
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPrompt('Create an active counter button called "Support Open Research"')}
                  className="px-2.5 py-1 text-[11px] bg-slate-700/80 hover:bg-slate-700 border border-slate-600 rounded-md text-slate-200 transition-colors"
                >
                  Add Consensus Counter
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPrompt('Create a dynamic newsletter form button for technical dispatch updates')}
                  className="px-2.5 py-1 text-[11px] bg-slate-700/80 hover:bg-slate-700 border border-slate-600 rounded-md text-slate-200 transition-colors"
                >
                  Create Newsletter Form Button
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPrompt('Create an interactive system alert button for a zero-downtime deployment')}
                  className="px-2.5 py-1 text-[11px] bg-slate-700/80 hover:bg-slate-700 border border-slate-600 rounded-md text-slate-200 transition-colors"
                >
                  Create System Alert Button
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('choice')}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-[#F8FAFC] rounded-lg hover:bg-slate-700 transition-colors"
              >
                Back to Manual
              </button>
              <button
                type="submit"
                disabled={isAiGenerating || !aiPrompt.trim()}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-[#F8FAFC] bg-[#2563EB] hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-all shadow-sm shadow-blue-500/25"
              >
                {isAiGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Vaelourix Generating...</span>
                  </>
                ) : (
                  <>
                    <AxiometicLogo size={14} />
                    <span>Generate & Publish</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
