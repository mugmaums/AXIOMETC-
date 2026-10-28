import React from 'react';
import { 
  PenLine, 
  ImagePlus, 
  Sparkles, 
  SlidersHorizontal, 
  MessageSquare, 
  ShieldCheck, 
  FolderUp, 
  Lock, 
  Trash2, 
  FileText, 
  Radio,
  Users
} from 'lucide-react';
import type { BlockType } from '../types';

interface DeveloperToolbarProps {
  onOpenCreateModal: (defaultType: BlockType) => void;
  onOpenSettings: () => void;
  onOpenInbox: () => void;
  onOpenFileVault: () => void;
  onOpenBroadcastModal: () => void;
  onLogoutDeveloper: () => void;
  onClearAll: () => void;
  messageCount: number;
  filesCount: number;
  activeUserCount: number;
}

export const DeveloperToolbar: React.FC<DeveloperToolbarProps> = ({
  onOpenCreateModal,
  onOpenSettings,
  onOpenInbox,
  onOpenFileVault,
  onOpenBroadcastModal,
  onLogoutDeveloper,
  onClearAll,
  messageCount,
  filesCount,
  activeUserCount,
}) => {
  return (
    <aside aria-label="Developer actions" className="relative z-30 mb-10 p-5 bg-mahogany-900/90 border border-gold-accent/30 rounded-2xl shadow-2xl backdrop-blur-xl">
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] rounded-2xl" />
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        {/* Status Indicator & Analytics */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gold-accent text-mahogany-950 shadow-lg shadow-gold-accent/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-ivory tracking-[0.2em] uppercase">Architect Mode</span>
                <div className="w-1.5 h-1.5 rounded-full bg-gold-accent animate-pulse" />
              </div>
              <p className="text-[9px] text-gold-accent/60 uppercase font-mono tracking-widest mt-0.5">Secure Studio Session</p>
            </div>
          </div>

          <div className="h-10 w-[1px] bg-gold-accent/20 hidden sm:block" />

          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-ivory/40 uppercase tracking-widest font-mono">Smart Analysis</span>
              <div className="flex items-center gap-2 mt-0.5">
                <Users className="w-3.5 h-3.5 text-gold-accent" />
                <span className="text-xs font-bold text-gold-accent">{activeUserCount} Active Identites</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onOpenCreateModal('text')}
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-black text-ivory bg-black/40 hover:bg-black/60 border border-gold-accent/20 rounded-xl transition-all uppercase tracking-widest hover:border-gold-accent/40 active:scale-95"
          >
            <PenLine className="w-3.5 h-3.5 text-gold-accent" />
            <span>Write</span>
          </button>

          <button
            onClick={() => onOpenCreateModal('picture')}
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-black text-ivory bg-black/40 hover:bg-black/60 border border-gold-accent/20 rounded-xl transition-all uppercase tracking-widest hover:border-gold-accent/40 active:scale-95"
          >
            <ImagePlus className="w-3.5 h-3.5 text-gold-accent" />
            <span>Picture</span>
          </button>

          <button
            onClick={() => onOpenCreateModal('button')}
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-black text-ivory bg-black/40 hover:bg-black/60 border border-gold-accent/20 rounded-xl transition-all uppercase tracking-widest hover:border-gold-accent/40 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-accent" />
            <span>Action</span>
          </button>

          <button
            onClick={onOpenFileVault}
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-black text-ivory bg-black/40 hover:bg-black/60 border border-gold-accent/20 rounded-xl transition-all uppercase tracking-widest hover:border-gold-accent/40 active:scale-95"
          >
            <FolderUp className="w-3.5 h-3.5 text-gold-accent" />
            <span>Vault ({filesCount})</span>
          </button>

          <button
            onClick={onOpenBroadcastModal}
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-black text-mahogany-950 bg-gold-accent hover:bg-gold-accent/90 border border-gold-accent/30 rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-gold-accent/10 active:scale-95"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Broadcast</span>
          </button>

          <div className="h-6 w-[1px] bg-gold-accent/20 mx-2 hidden lg:block" />

          <button
            onClick={onOpenSettings}
            className="p-2.5 text-ivory/40 hover:text-gold-accent bg-black/20 hover:bg-black/40 border border-gold-accent/10 rounded-xl transition-all active:scale-90"
            title="Page Settings"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenInbox}
            className="flex items-center gap-2 p-2.5 text-ivory/40 hover:text-gold-accent bg-black/20 hover:bg-black/40 border border-gold-accent/10 rounded-xl transition-all active:scale-90 relative"
            title="Transmissions"
          >
            <MessageSquare className="w-4 h-4" />
            {messageCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-black bg-red-600 text-white rounded-full flex items-center justify-center border border-mahogany-950">
                {messageCount}
              </span>
            )}
          </button>

          <button
            onClick={onClearAll}
            className="p-2.5 text-red-400/40 hover:text-red-400 bg-red-950/10 hover:bg-red-950/20 border border-red-500/10 rounded-xl transition-all active:scale-90"
            title="Erase Contents"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={onLogoutDeveloper}
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-black text-red-400 bg-red-950/20 hover:bg-red-950/30 border border-red-500/20 rounded-xl transition-all uppercase tracking-widest ml-2 active:scale-95"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
