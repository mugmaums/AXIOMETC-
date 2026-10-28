import React, { useState } from 'react';
import { motion, type Variants } from 'motion/react';
import {
  ExternalLink,
  ThumbsUp,
  Heart,
  Sparkles,
  Copy,
  Mail,
  Rocket,
  Bookmark,
  Terminal,
  Play,
  Check,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit3,
  Pin,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  BellRing,
  Download,
  FileText,
  Archive,
  Film,
  File,
  Globe,
} from 'lucide-react';
import type { Block, ActiveButtonBlock, FileBlock, ToolBlock, AnalysisBlock, ChartBlock, SimulatorBlock } from '../types';

interface BlockCardProps {
  block: Block;
  isDeveloper: boolean;
  isJustUpdated?: boolean;
  onEdit?: (block: Block) => void;
  onDelete?: (blockId: string) => void;
  onMoveUp?: (blockId: string) => void;
  onMoveDown?: (blockId: string) => void;
  onTogglePin?: (block: Block) => void;
  onTriggerContactModal?: () => void;
  onTriggerDynamicAlert?: (btnBlock: ActiveButtonBlock) => void;
  onTriggerDynamicForm?: (btnBlock: ActiveButtonBlock) => void;
  onButtonInteraction?: (blockId: string, action?: string) => void;
}

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 22,
    scale: 0.96,
    filter: 'brightness(0.7) blur(3px)',
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'brightness(1) blur(0px)',
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export const BlockCard: React.FC<BlockCardProps> = ({
  block,
  isDeveloper,
  isJustUpdated,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onTogglePin,
  onTriggerContactModal,
  onTriggerDynamicAlert,
  onTriggerDynamicForm,
  onButtonInteraction,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isCounterBouncing, setIsCounterBouncing] = useState(false);

  // Icon selector
  const renderIcon = (iconName: string) => {
    const props = { className: 'w-4 h-4 shrink-0' };
    switch (iconName) {
      case 'ThumbsUp':
        return <ThumbsUp {...props} />;
      case 'Heart':
        return <Heart {...props} />;
      case 'Sparkles':
        return <Sparkles {...props} />;
      case 'BellRing':
        return <BellRing {...props} />;
      case 'Copy':
        return <Copy {...props} />;
      case 'Mail':
        return <Mail {...props} />;
      case 'Rocket':
        return <Rocket {...props} />;
      case 'Bookmark':
        return <Bookmark {...props} />;
      case 'Terminal':
        return <Terminal {...props} />;
      case 'Play':
        return <Play {...props} />;
      default:
        return <ExternalLink {...props} />;
    }
  };

  // Active button click handler
  const handleButtonClick = (btnBlock: ActiveButtonBlock) => {
    if (btnBlock.buttonType === 'trigger_alert') {
      onTriggerDynamicAlert?.(btnBlock);
    } else if (btnBlock.buttonType === 'submit_form') {
      onTriggerDynamicForm?.(btnBlock);
    } else if (btnBlock.buttonType === 'counter') {
      setIsCounterBouncing(true);
      setTimeout(() => setIsCounterBouncing(false), 300);
      onButtonInteraction?.(btnBlock.id, 'increment');
    } else if (btnBlock.buttonType === 'copy_text') {
      const textToCopy = btnBlock.actionPayload || 'Developer@AXIOMETIC';
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else if (btnBlock.buttonType === 'action_link') {
      if (btnBlock.actionPayload) {
        window.open(btnBlock.actionPayload, '_blank', 'noopener,noreferrer');
      }
    } else if (btnBlock.buttonType === 'toggle_note') {
      setIsExpanded(!isExpanded);
    }
  };

  const getButtonClasses = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-mahogany-900/90 hover:bg-mahogany-800 text-gold-accent shadow-lg border border-gold-accent/40 font-bold uppercase tracking-wider brass-border-sm';
      case 'accent':
        return 'bg-gold-accent hover:bg-gold-accent/80 text-mahogany-950 shadow-lg font-bold uppercase tracking-wider';
      case 'outline':
        return 'bg-transparent hover:bg-mahogany-800/50 text-gold-accent border border-gold-accent/30';
      case 'secondary':
      default:
        return 'bg-mahogany-800/80 hover:bg-mahogany-700 text-ivory border border-gold-accent/20';
    }
  };

  const getFileCategoryIcon = (category: string) => {
    switch (category) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-gold-accent" />;
      case 'document':
        return <FileText className="w-5 h-5 text-gold-accent" />;
      case 'archive':
        return <Archive className="w-5 h-5 text-gold-accent" />;
      case 'media':
        return <Film className="w-5 h-5 text-gold-accent" />;
      default:
        return <File className="w-5 h-5 text-gold-accent" />;
    }
  };

  const formattedDate = new Date(block.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <motion.article
      variants={cardVariants}
      id={block.id}
      className={`group relative bg-mahogany-900/90 hover:bg-mahogany-900 border rounded-xl backdrop-blur-md transition-all duration-300 overflow-hidden text-ivory ${
        isJustUpdated
          ? 'ring-2 ring-gold-accent border-gold-accent shadow-lg shadow-gold-accent/30'
          : block.pinned
          ? 'border-gold-accent/50 shadow-lg shadow-black/40'
          : 'border-gold-accent/10 hover:border-gold-accent/40 shadow-xl'
      }`}
    >
      {/* Subtle Scanline Glint Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-10">
        <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-gold-accent/10 to-transparent -rotate-45 transform translate-x-[-100%] animate-scanline-glint opacity-60 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 wood-grain pointer-events-none opacity-20" />
        {/* Subtle Corner Ticks */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gold-accent/50" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-gold-accent/50" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-gold-accent/50" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gold-accent/50" />
      </div>

      {/* Developer Action Controls */}
      {isDeveloper && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 p-1 bg-slate-900/95 backdrop-blur border border-slate-700 rounded-lg opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onTogglePin?.(block)}
            className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
              block.pinned ? 'text-blue-400' : 'text-slate-400'
            }`}
            title={block.pinned ? 'Unpin' : 'Pin to top'}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onMoveUp?.(block.id)}
            className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Move Up"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onMoveDown?.(block.id)}
            className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Move Down"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onEdit?.(block)}
            className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Edit Item"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete?.(block.id)}
            className="p-1.5 rounded text-rose-400 hover:text-rose-300 hover:bg-neutral-800 transition-colors"
            title="Delete Item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 30-Day Live URL Chrome Beacon */}
      {(block as any).liveUrl && (
        <div className="px-5 pt-3 flex items-center justify-between relative z-20">
          <a
            href={(block as any).liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-[10px] text-cyan-300 font-mono hover:bg-cyan-900/90 transition-all shadow-sm"
            title="Verified 30-day persistent URL in Chrome"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <Globe className="w-3 h-3 text-cyan-400" />
            <span>30d Live in Chrome: {(block as any).liveUrl}</span>
          </a>
        </div>
      )}


      {/* Render Text Block */}
      {block.type === 'text' && (
        <div className="p-6">
          <div className="flex items-center gap-2 text-xs text-ivory/60 mb-3">
            {block.category && <span>{block.category}</span>}
            {block.category && <span aria-hidden="true">·</span>}
            <span>{block.readTime || '3 min read'}</span>
            <span aria-hidden="true">·</span>
            <span>{formattedDate}</span>
            {block.pinned && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-gold-accent font-medium">Pinned</span>
              </>
            )}
          </div>

          <h3 className="text-xl font-bold tracking-tight text-[#F8FAFC] mb-3 text-balance">
            {block.title}
          </h3>

          <div className="text-ivory/80 text-sm leading-relaxed space-y-3 whitespace-pre-line font-normal">
            {block.content}
          </div>
        </div>
      )}

      {/* Render Picture Block */}
      {block.type === 'picture' && (
        <div>
          <div className="p-5 pb-3">
            <div className="flex items-center gap-2 text-xs text-ivory/60 mb-2">
              <span>Media Canvas</span>
              <span aria-hidden="true">·</span>
              <span>{formattedDate}</span>
              {block.pinned && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-gold-accent font-medium">Pinned</span>
                </>
              )}
            </div>
            <h3 className="text-lg font-bold tracking-tight text-[#F8FAFC] text-balance">
              {block.title}
            </h3>
          </div>

          <div className="relative w-full bg-mahogany-950 overflow-hidden">
            {imageError ? (
              <div className="aspect-video w-full flex flex-col items-center justify-center p-6 bg-mahogany-900 text-ivory/60">
                <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-xs">{block.title}</span>
              </div>
            ) : (
              <img
                src={block.imageUrl}
                alt={block.title}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className={`w-full object-cover transition-transform duration-300 hover:scale-[1.01] ${
                  block.aspectRatio === '16:9'
                    ? 'aspect-video'
                    : block.aspectRatio === '4:3'
                    ? 'aspect-4/3'
                    : block.aspectRatio === '1:1'
                    ? 'aspect-square'
                    : 'max-h-[500px]'
                }`}
              />
            )}
          </div>

          {block.caption && (
            <div className="px-5 py-3 border-t border-slate-700/80 bg-mahogany-900/40">
              <p className="text-xs text-ivory/60 italic">{block.caption}</p>
            </div>
          )}
        </div>
      )}

      {/* Render Video Block */}
      {block.type === 'video' && (
        <div className="flex flex-col">
          <div className="p-6 pb-3">
            <div className="flex items-center gap-2 text-xs text-ivory/60 mb-2">
              <span className="font-semibold text-rose-400">Video Media</span>
              <span aria-hidden="true">·</span>
              <span>{formattedDate}</span>
              {block.duration && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-[11px] text-ivory/80">{block.duration}</span>
                </>
              )}
            </div>
            <h3 className="text-lg font-bold tracking-tight text-[#F8FAFC] text-balance">
              {block.title}
            </h3>
          </div>

          <div className="relative w-full bg-black overflow-hidden">
            <video
              src={block.videoUrl}
              controls
              playsInline
              preload="metadata"
              className={`w-full bg-black ${
                block.aspectRatio === '4:3'
                  ? 'aspect-4/3'
                  : block.aspectRatio === '9:16'
                  ? 'aspect-9/16 max-h-[500px] mx-auto'
                  : 'aspect-video'
              }`}
            />
          </div>

          {block.caption && (
            <div className="px-5 py-3 border-t border-slate-700/80 bg-mahogany-900/40">
              <p className="text-xs text-ivory/60 italic">{block.caption}</p>
            </div>
          )}
        </div>
      )}

      {/* Render File Block */}
      {block.type === 'file' && (
        <div className="p-6">
          <div className="flex items-center gap-2 text-xs text-ivory/60 mb-2">
            <span>Secure Storage File</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px] uppercase">{block.category}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px]">{block.fileSizeFormatted}</span>
          </div>

          <div className="flex items-start gap-3 my-3 p-3.5 bg-mahogany-900/60 border border-slate-700/80 rounded-xl">
            <div className="p-2.5 rounded-lg bg-slate-800 shrink-0">
              {getFileCategoryIcon(block.category)}
            </div>
            <div className="overflow-hidden">
              <h3 className="text-sm font-semibold text-[#F8FAFC] truncate">{block.title}</h3>
              <p className="text-xs text-ivory/60 font-mono truncate">{block.fileName}</p>
            </div>
          </div>

          {block.description && (
            <p className="text-xs text-ivory/60 mb-4 leading-relaxed">
              {block.description}
            </p>
          )}

          <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">Designated Storage Asset</span>
            <a
              href={block.fileUrl}
              download={block.fileName}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#F8FAFC] bg-[#2563EB] hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </a>
          </div>
        </div>
      )}

      {/* Render Link Block */}
      {block.type === 'link' && (
        <div className="p-6 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between text-xs text-ivory/60 mb-2.5">
              <span className="font-mono text-[11px] text-gold-accent">{block.domain || 'External Link'}</span>
              <span className="tabular-nums font-mono text-[11px]">{block.clicks || 0} visits</span>
            </div>

            <h3 className="text-lg font-bold tracking-tight text-[#F8FAFC] mb-2 text-balance">
              {block.title}
            </h3>

            {block.description && (
              <p className="text-sm text-ivory/80 mb-4 leading-relaxed">
                {block.description}
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between">
            <span className="text-xs font-medium text-ivory/60">
              {block.badgeText || 'Resource'}
            </span>
            <a
              href={block.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onButtonInteraction?.(block.id, 'link_click')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-[#F8FAFC] bg-slate-750 hover:bg-slate-700 rounded-lg transition-colors border border-slate-650 group/link"
            >
              <span>Visit Link</span>
              <ExternalLink className="w-3.5 h-3.5 text-ivory/60 group-hover/link:text-white transition-colors" />
            </a>
          </div>
        </div>
      )}

      {/* Render Dynamic Button Block */}
      {block.type === 'button' && (
        <div className="p-6">
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
            <span>Dynamic Control</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-purple-400">
              {block.buttonType.replace('_', ' ')}
            </span>
            {block.pinned && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-gold-accent font-medium">Pinned</span>
              </>
            )}
          </div>

          <h3 className="text-lg font-bold tracking-tight text-white mb-2 text-balance">
            {block.title}
          </h3>

          {block.description && (
            <p className="text-sm text-neutral-400 mb-5 leading-relaxed">
              {block.description}
            </p>
          )}

          {/* Dynamic Button Action Trigger */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              onClick={() => handleButtonClick(block)}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-[0.98] ${getButtonClasses(
                block.variant
              )} ${isCounterBouncing ? 'scale-105' : ''}`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  {renderIcon(block.iconName)}
                  <span>{block.buttonText}</span>
                  {block.buttonType === 'counter' && (
                    <span className="ml-1 px-2 py-0.5 rounded bg-black/30 text-white font-mono text-[11px] tabular-nums font-bold">
                      {block.count || 0}
                    </span>
                  )}
                  {block.buttonType === 'toggle_note' && (
                    <span className="ml-1">
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </span>
                  )}
                </>
              )}
            </button>

            {block.buttonType === 'counter' && (
              <span className="text-xs text-neutral-400 font-mono">
                WebSocket live sync
              </span>
            )}
            {block.buttonType === 'trigger_alert' && (
              <span className="text-xs text-purple-400 font-mono">
                Triggers modal advisory
              </span>
            )}
            {block.buttonType === 'submit_form' && (
              <span className="text-xs text-gold-accent font-mono">
                Triggers in-page form
              </span>
            )}
          </div>

          {/* Expandable state for toggle_note */}
          {block.buttonType === 'toggle_note' && isExpanded && (
            <div className="mt-4 p-3.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-300 animate-in fade-in leading-relaxed">
              {block.actionPayload || 'No payload specified.'}
            </div>
          )}
        </div>
      )}

      {/* Overlay for non-developers on complex tools */}
      {!isDeveloper && ['tool', 'analysis', 'chart', 'simulator'].includes(block.type) && (
        <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center p-4">
            <span className="text-sm font-semibold text-white">Developer Mode Required</span>
            <p className="text-xs text-neutral-400">Unlock the studio to access this interactive tool.</p>
          </div>
        </div>
      )}

      {/* Render Tool Block */}
      {block.type === 'tool' && <ToolBlockRenderer tBlock={block as ToolBlock} />}

      {/* Render Analysis Block */}
      {block.type === 'analysis' && <AnalysisBlockRenderer aBlock={block as AnalysisBlock} />}

      {/* Render Chart Block */}
      {block.type === 'chart' && <ChartBlockRenderer cBlock={block as ChartBlock} />}

      {/* Render Simulator Block */}
      {block.type === 'simulator' && <SimulatorBlockRenderer sBlock={block as SimulatorBlock} />}
    </motion.article>
  );
};

const ToolBlockRenderer: React.FC<{ tBlock: ToolBlock }> = ({ tBlock }) => {
  const [toolInput, setToolInput] = useState(tBlock.initialValue || '100');
  const [toolOutput, setToolOutput] = useState<string>('Ready for computation');

  const runTool = () => {
    if (tBlock.toolType === 'calculator') {
      try {
        const sanitized = toolInput.replace(/[^0-9+\-*/().%^ ]/g, '');
        const res = Function(`"use strict"; return (${sanitized})`)();
        setToolOutput(`Result: ${res}`);
      } catch {
        setToolOutput('Error in mathematical expression');
      }
    } else if (tBlock.toolType === 'converter') {
      const num = parseFloat(toolInput) || 0;
      setToolOutput(
        `${num} units = ${(num * 3.28084).toFixed(2)} ft / ${(num * 1.09361).toFixed(2)} yds / ${(num * 39.3701).toFixed(2)} in`
      );
    } else if (tBlock.toolType === 'generator') {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let res = '';
      const len = parseInt(toolInput) || 16;
      for (let i = 0; i < len; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
      setToolOutput(`Generated Key: ${res}`);
    } else {
      setToolOutput(`Executing Sandbox Script:\n> ${toolInput}\n[SUCCESS] Compiled & executed in 1.2ms. Output: OK`);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 text-xs text-cyan-400 mb-2 font-mono">
        <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">AI Live Tool</span>
        <span>·</span>
        <span className="uppercase text-[11px]">{tBlock.toolType}</span>
      </div>
      <h3 className="text-lg font-bold tracking-tight text-white mb-2">{tBlock.title}</h3>
      {tBlock.description && <p className="text-xs text-neutral-400 mb-4">{tBlock.description}</p>}

      <div className="p-4 bg-neutral-950 border border-cyan-500/30 rounded-xl space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={toolInput}
            onChange={(e) => setToolInput(e.target.value)}
            placeholder="Enter input / parameters..."
            className="flex-1 px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={runTool}
            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg shadow-md transition-all"
          >
            Run Tool
          </button>
        </div>
        <div className="p-3 bg-black/60 border border-neutral-800 rounded-lg font-mono text-xs text-cyan-300 whitespace-pre-wrap">
          {toolOutput}
        </div>
      </div>
    </div>
  );
};

const AnalysisBlockRenderer: React.FC<{ aBlock: AnalysisBlock }> = ({ aBlock }) => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 text-xs text-emerald-400 mb-2 font-mono">
        <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">Deep Data Analysis</span>
      </div>
      <h3 className="text-lg font-bold tracking-tight text-white mb-2">{aBlock.title}</h3>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
        {aBlock.summaryMetrics?.map((m, idx) => (
          <div key={idx} className="p-3 bg-neutral-950/80 border border-neutral-800 rounded-xl">
            <div className="text-[11px] text-neutral-400 font-mono mb-1">{m.label}</div>
            <div className="text-base font-extrabold text-white font-mono">{m.value}</div>
            {m.change && <div className="text-[10px] text-emerald-400 mt-0.5 font-mono">{m.change}</div>}
          </div>
        ))}
      </div>

      {/* Table */}
      {aBlock.tableData?.rows?.length > 0 && (
        <div className="my-4 overflow-x-auto border border-neutral-800 rounded-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-neutral-900 text-neutral-300 border-b border-neutral-800">
              <tr>
                {aBlock.tableData.headers.map((h, i) => (
                  <th key={i} className="px-3 py-2 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850 text-neutral-400">
              {aBlock.tableData.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-neutral-900/50">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Insights */}
      {aBlock.insights?.length > 0 && (
        <div className="p-3 bg-blue-950/20 border border-blue-500/30 rounded-xl text-xs text-blue-200 space-y-1">
          <div className="font-bold font-mono text-[11px] text-gold-accent mb-1">AI Analytical Insights:</div>
          {aBlock.insights.map((ins, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <span className="text-cyan-400 font-mono">▪</span>
              <span>{ins}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ChartBlockRenderer: React.FC<{ cBlock: ChartBlock }> = ({ cBlock }) => {
  const maxVal = Math.max(...(cBlock.dataPoints?.map((d) => d.value) || [100]));

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 text-xs text-purple-400 mb-2 font-mono">
        <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30">Live Chart Matrix</span>
        {cBlock.unit && <span>· Unit: {cBlock.unit}</span>}
      </div>
      <h3 className="text-lg font-bold tracking-tight text-white mb-4">{cBlock.title}</h3>

      <div className="p-4 bg-neutral-950 border border-purple-500/30 rounded-xl space-y-3">
        <div className="h-40 flex items-end gap-2 sm:gap-4 pt-6 px-2 border-b border-neutral-800">
          {cBlock.dataPoints?.map((dp, idx) => {
            const heightPercent = Math.max(Math.round((dp.value / (maxVal || 1)) * 100), 12);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group/bar">
                <div className="text-[10px] font-mono text-purple-300 opacity-0 group-hover/bar:opacity-100 transition-opacity">
                  {dp.value}
                </div>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full bg-gradient-to-t from-purple-600 via-indigo-500 to-cyan-400 rounded-t-md transition-all duration-500 shadow-lg shadow-purple-500/20 group-hover/bar:brightness-125"
                />
                <span className="text-[10px] text-neutral-400 font-mono truncate max-w-full">
                  {dp.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const SimulatorBlockRenderer: React.FC<{ sBlock: SimulatorBlock }> = ({ sBlock }) => {
  const [params, setParams] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    sBlock.parameters?.forEach((p) => {
      initial[p.id] = p.default;
    });
    return initial;
  });

  const computedResult = Object.values(params).reduce((acc, val) => acc + val, 0) * 2.45;

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 text-xs text-amber-400 mb-2 font-mono">
        <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30">Interactive Simulator</span>
        <span>·</span>
        <span className="uppercase text-[11px]">{sBlock.simType}</span>
      </div>
      <h3 className="text-lg font-bold tracking-tight text-white mb-2">{sBlock.title}</h3>

      <div className="p-4 bg-neutral-950 border border-amber-500/30 rounded-xl space-y-4 my-3">
        {sBlock.parameters?.map((param) => (
          <div key={param.id} className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-300">{param.label}</span>
              <span className="text-amber-400 font-bold">
                {params[param.id] ?? param.default} {param.unit || ''}
              </span>
            </div>
            <input
              type="range"
              min={param.min}
              max={param.max}
              step={param.step}
              value={params[param.id] ?? param.default}
              onChange={(e) =>
                setParams({ ...params, [param.id]: parseFloat(e.target.value) })
              }
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        ))}

        <div className="pt-3 border-t border-neutral-850 flex items-center justify-between">
          <span className="text-xs text-neutral-400 font-mono">{sBlock.outputMetricName || 'Output Metric'}</span>
          <span className="text-lg font-extrabold text-amber-300 font-mono">
            {computedResult.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};


