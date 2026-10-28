import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Video,
  FileCode,
  ExternalLink,
  Download,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';
import type { Block, PictureBlock, VideoBlock, FileBlock, ActiveButtonBlock, TextBlock, ToolBlock } from '../types';

interface CreationPreviewCardProps {
  block: Block;
  onPublish: (block: Block) => Promise<boolean>;
  isPublished?: boolean;
}

export const CreationPreviewCard: React.FC<CreationPreviewCardProps> = ({
  block,
  onPublish,
  isPublished: initialPublished = false,
}) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(initialPublished);
  const [buttonCount, setButtonCount] = useState(block.type === 'button' ? (block as ActiveButtonBlock).count || 0 : 0);

  const handlePublishClick = async () => {
    if (published || isPublishing) return;
    setIsPublishing(true);
    try {
      const ok = await onPublish(block);
      if (ok) {
        setPublished(true);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="mt-3 rounded-2xl bg-[#090e1c] border border-sky-400/30 overflow-hidden shadow-xl shadow-sky-950/60 font-sans">
      {/* Creation Header Badge */}
      <div className="px-3.5 py-2 bg-gradient-to-r from-sky-950/80 via-indigo-950/40 to-slate-900 border-b border-sky-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-[10px] font-mono tracking-wider font-bold text-cyan-300">
            {published ? 'PUBLISHED TO CANVAS' : 'CREATION PREVIEW'}
          </span>
          <span className="text-[10px] text-slate-500">·</span>
          <span className="text-[10px] font-mono text-slate-400 uppercase">{block.type}</span>
        </div>

        {published ? (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Live on Canvas</span>
          </div>
        ) : (
          <span className="text-[10px] text-amber-400/90 font-mono">Unpublished</span>
        )}
      </div>

      {/* Media & Content Body */}
      <div className="p-3.5 space-y-3">
        {/* Title */}
        <h5 className="font-bold text-sm text-white tracking-tight">{block.title}</h5>

        {/* Picture Block Rendering */}
        {block.type === 'picture' && (
          <div className="rounded-xl overflow-hidden bg-black/60 border border-slate-800">
            <img
              src={(block as PictureBlock).imageUrl}
              alt={block.title}
              className="w-full max-h-56 object-cover hover:scale-[1.01] transition-transform"
            />
            {(block as PictureBlock).caption && (
              <p className="p-2.5 text-[11px] text-slate-300 italic bg-slate-950/90 border-t border-slate-800">
                {(block as PictureBlock).caption}
              </p>
            )}
          </div>
        )}

        {/* Video Block Rendering */}
        {block.type === 'video' && (
          <div className="rounded-xl overflow-hidden bg-black border border-slate-800">
            <video
              src={(block as VideoBlock).videoUrl}
              controls
              playsInline
              preload="metadata"
              className="w-full max-h-60 aspect-video bg-black"
            />
            {(block as VideoBlock).caption && (
              <p className="p-2.5 text-[11px] text-slate-300 italic bg-slate-950/90 border-t border-slate-800">
                {(block as VideoBlock).caption}
              </p>
            )}
          </div>
        )}

        {/* File Block Rendering */}
        {block.type === 'file' && (
          <div className="flex items-center justify-between p-3 bg-neutral-900/90 border border-neutral-800 rounded-xl">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-lg bg-sky-950 text-cyan-400 shrink-0">
                <FileCode className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {(block as FileBlock).fileName || block.title}
                </p>
                <span className="text-[10px] text-slate-400 font-mono">
                  {(block as FileBlock).fileSizeFormatted || 'Ready for download'}
                </span>
              </div>
            </div>
            {(block as FileBlock).fileUrl && (
              <a
                href={(block as FileBlock).fileUrl}
                download={(block as FileBlock).fileName || 'download'}
                className="p-2 text-slate-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                title="Download file"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
          </div>
        )}

        {/* Text / Essay Block Rendering */}
        {block.type === 'text' && (
          <div className="p-3 bg-neutral-900/60 border border-neutral-800/80 rounded-xl space-y-1.5">
            <div className="text-[10px] font-mono text-cyan-400">{(block as TextBlock).category || 'Essay'}</div>
            <p className="text-xs text-slate-200 line-clamp-4 leading-relaxed">
              {(block as TextBlock).content}
            </p>
          </div>
        )}

        {/* Interactive Button Rendering */}
        {block.type === 'button' && (
          <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-2">
            {(block as ActiveButtonBlock).description && (
              <p className="text-xs text-slate-300">{(block as ActiveButtonBlock).description}</p>
            )}
            <button
              type="button"
              onClick={() => {
                if ((block as ActiveButtonBlock).buttonType === 'counter') {
                  setButtonCount((c) => c + 1);
                } else if ((block as ActiveButtonBlock).buttonType === 'trigger_alert') {
                  alert(`[Preview Action] ${(block as ActiveButtonBlock).alertConfig?.message || 'Button triggered'}`);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-sky-500 rounded-lg shadow-md active:scale-95"
            >
              <span>{(block as ActiveButtonBlock).buttonText}</span>
              {(block as ActiveButtonBlock).buttonType === 'counter' && (
                <span className="px-1.5 py-0.2 rounded bg-black/40 font-mono">{buttonCount}</span>
              )}
            </button>
          </div>
        )}

        {/* Tool Rendering */}
        {block.type === 'tool' && (
          <div className="p-3 bg-neutral-900/80 border border-cyan-500/20 rounded-xl space-y-1">
            <div className="text-[10px] font-mono text-cyan-300">Interactive Tool: {(block as ToolBlock).toolType}</div>
            <p className="text-xs text-slate-300">{(block as ToolBlock).description || 'Ready for parameter computation.'}</p>
          </div>
        )}
      </div>

      {/* Action Publish Bar */}
      <div className="px-3.5 py-2.5 bg-[#050812] border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">
          {published ? 'Visible to all visitors on canvas' : 'Review in chat before publishing'}
        </span>

        {!published ? (
          <button
            type="button"
            onClick={handlePublishClick}
            disabled={isPublishing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 rounded-lg transition-all shadow-md shadow-sky-600/30 active:scale-95 disabled:opacity-50"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>Publish to Canvas</span>
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Published</span>
          </div>
        )}
      </div>
    </div>
  );
};
