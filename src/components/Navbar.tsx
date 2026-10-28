import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Home, Library, BookOpen, Globe, FolderDown, Settings, Mail, Terminal } from 'lucide-react';
import type { SiteSettings } from '../types';

interface NavbarProps {
  settings: SiteSettings;
  isDeveloper: boolean;
  onOpenUnlockModal: () => void;
  onLogoutDeveloper: () => void;
  onOpenAddChoiceModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenInboxModal: () => void;
  onOpenFileVaultModal: () => void;
  unreadMessagesCount: number;
  uploadedFilesCount: number;
  isWsConnected: boolean;
  onOpenContactModal: () => void;
  onOpenBroadcastModal: () => void;
  onOpenWRI: () => void;
  onOpenCanvas: () => void;
  onOpenAxio: () => void;
  onOpenXio: () => void;
  onOpenSocio: () => void;
  onOpenApiPortal?: () => void;
  onOpenGameX?: () => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onGoHome: () => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
  currentView: 'canvas' | 'wri' | 'axio' | 'xio' | 'socio' | 'api' | 'gamex';
  broadcastCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  isDeveloper,
  onOpenUnlockModal,
  onLogoutDeveloper,
  onOpenAddChoiceModal,
  onOpenSettingsModal,
  onOpenInboxModal,
  onOpenFileVaultModal,
  unreadMessagesCount,
  uploadedFilesCount,
  isWsConnected,
  onOpenContactModal,
  onOpenBroadcastModal,
  onOpenWRI,
  onOpenCanvas,
  onOpenAxio,
  onOpenXio,
  onOpenSocio,
  onOpenApiPortal,
  onOpenGameX,
  onGoBack,
  onGoForward,
  onGoHome,
  canGoBack = true,
  canGoForward = true,
  currentView,
  broadcastCount = 0,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-mahogany-950/95 backdrop-blur-xl border-b border-gold-accent/30 shadow-xl h-12 flex items-center">
      <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between">
        
        {/* Left: Navigation Controls + Home + Socio/X + API Portal */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onGoBack}
            className="p-1.5 rounded-lg hover:bg-gold-accent/10 text-ivory/80 hover:text-gold-accent disabled:opacity-30 disabled:hover:text-ivory/40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Back (Previous Workspace)"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={onGoForward}
            className="p-1.5 rounded-lg hover:bg-gold-accent/10 text-ivory/80 hover:text-gold-accent disabled:opacity-30 disabled:hover:text-ivory/40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Forward (Next Workspace)"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onGoHome}
            className={`p-1.5 rounded-lg hover:bg-gold-accent/10 transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentView === 'canvas' ? 'text-gold-accent font-bold bg-gold-accent/10' : 'text-ivory/80 hover:text-gold-accent'
            }`}
            title="Home / Living Canvas"
          >
            <Home className="w-4 h-4" />
            <span className="text-xs font-serif font-bold text-gold-accent hidden sm:inline">AXIOMETIC</span>
          </button>
        </div>

        {/* Center/Right: Feature Menu Button "👁️🗨️" hiding AXIO, XIO, and WRI */}
        <div className="flex items-center gap-3 relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(prev => !prev)}
            className={`px-3 py-1 rounded-full border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm opacity-70 hover:opacity-100 ${
              dropdownOpen 
                ? 'bg-gold-accent text-mahogany-950 border-gold-accent font-black shadow-md opacity-100' 
                : 'bg-gold-accent/10 hover:bg-gold-accent/20 border-gold-accent/30 text-gold-accent'
            }`}
            title="Features & Repositories Menu"
          >
            <span className="text-sm">👁️🗨️</span>
            <span className="font-mono tracking-wider text-[11px] hidden sm:inline">MENU</span>
          </button>

          {dropdownOpen && (
            <div 
              className="absolute top-full right-0 w-64 mt-2 bg-mahogany-950/98 border border-gold-accent/30 rounded-xl shadow-2xl z-50 overflow-hidden brass-border p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="px-3 py-2 bg-mahogany-900/80 border-b border-gold-accent/10 mb-1">
                <span className="text-[9px] font-black text-gold-accent uppercase tracking-widest block text-center font-mono">
                  AXIOMETIC & XIO REPOSITORIES
                </span>
              </div>

              {/* Socio/X Social Network */}
              <button
                onClick={() => {
                  onOpenSocio();
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  currentView === 'socio' ? 'bg-gold-accent text-mahogany-950 font-black shadow-md' : 'text-ivory/90 hover:bg-gold-accent/15 hover:text-gold-accent'
                }`}
              >
                <div className="w-5 h-5 rounded bg-gold-accent text-mahogany-950 font-black text-[10px] flex items-center justify-center font-mono shrink-0">
                  SX
                </div>
                <div className="flex flex-col text-left">
                  <span>Socio/X Social Network</span>
                  <span className={`text-[9px] font-normal ${currentView === 'socio' ? 'text-mahogany-900/80 font-medium' : 'text-gray-400'}`}>Facebook Clone (@axiometic ID)</span>
                </div>
              </button>

              {/* XIO Mail Client */}
              <button
                onClick={() => {
                  onOpenXio();
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  currentView === 'xio' ? 'bg-gold-accent text-mahogany-950 font-black shadow-md' : 'text-ivory/90 hover:bg-gold-accent/15 hover:text-gold-accent'
                }`}
              >
                <Mail className={`w-4 h-4 ${currentView === 'xio' ? 'text-mahogany-950' : 'text-blue-400'}`} />
                <div className="flex flex-col text-left">
                  <span>XIO Mail</span>
                  <span className={`text-[9px] font-normal ${currentView === 'xio' ? 'text-mahogany-900/80 font-medium' : 'text-gray-400'}`}>Gmail Clone (@axiometic)</span>
                </div>
              </button>

              {/* AXIO Browser */}
              <button
                onClick={() => {
                  onOpenAxio();
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  currentView === 'axio' ? 'bg-gold-accent text-mahogany-950 font-black shadow-md' : 'text-ivory/90 hover:bg-gold-accent/15 hover:text-gold-accent'
                }`}
              >
                <Globe className={`w-4 h-4 ${currentView === 'axio' ? 'text-mahogany-950' : 'text-blue-400'}`} />
                <div className="flex flex-col text-left">
                  <span>AXIO Browser</span>
                  <span className={`text-[9px] font-normal ${currentView === 'axio' ? 'text-mahogany-900/80 font-medium' : 'text-gray-400'}`}>Full-Screen Chrome AI Clone</span>
                </div>
              </button>

              <button
                onClick={() => {
                  onOpenWRI();
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  currentView === 'wri' ? 'bg-gold-accent text-mahogany-950 font-black' : 'text-ivory/90 hover:bg-gold-accent/10 hover:text-gold-accent'
                }`}
              >
                <BookOpen className="w-4 h-4 text-gold-accent" />
                <div className="flex flex-col text-left">
                  <span>WRI Studio</span>
                  <span className="text-[9px] text-ivory/50 font-normal">3D Bookshelf & Manuscript Reader</span>
                </div>
              </button>

              <button
                onClick={() => {
                  onOpenCanvas();
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  currentView === 'canvas' ? 'bg-gold-accent/20 text-gold-accent' : 'text-ivory/90 hover:bg-gold-accent/10 hover:text-gold-accent'
                }`}
              >
                <Library className="w-4 h-4 text-gold-accent" />
                <div className="flex flex-col text-left">
                  <span>Living Canvas</span>
                  <span className="text-[9px] text-ivory/50 font-normal">Dynamic Publishing Surface</span>
                </div>
              </button>

              <button
                onClick={() => {
                  onOpenFileVaultModal();
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-ivory/90 hover:bg-gold-accent/10 hover:text-gold-accent transition-colors cursor-pointer"
              >
                <FolderDown className="w-4 h-4 text-gold-accent" />
                <div className="flex flex-col text-left">
                  <span>The Vault</span>
                  <span className="text-[9px] text-gold-accent/60 font-mono">
                    {uploadedFilesCount > 0 ? `${uploadedFilesCount} Objects Secured` : 'Document Vault'}
                  </span>
                </div>
              </button>

              {/* API & Developer Portal */}
              {/* API & Developer Portal */}
              <button
                onClick={() => {
                  if (onOpenApiPortal) onOpenApiPortal();
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  currentView === 'api' ? 'bg-gold-accent text-mahogany-950 font-black shadow-md' : 'text-ivory/90 hover:bg-gold-accent/15 hover:text-gold-accent'
                }`}
              >
                <Terminal className={`w-4 h-4 ${currentView === 'api' ? 'text-mahogany-950' : 'text-emerald-400'}`} />
                <div className="flex flex-col text-left">
                  <span>API & Developer Portal</span>
                  <span className={`text-[9px] font-normal ${currentView === 'api' ? 'text-mahogany-900/80 font-medium' : 'text-gray-400'}`}>REST v1 Keys & Custom Integration</span>
                </div>
              </button>

              {/* GameX Arcade & Canvas */}
              <button
                onClick={() => {
                  if (onOpenGameX) onOpenGameX();
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  currentView === 'gamex' ? 'bg-gold-accent text-mahogany-950 font-black shadow-md' : 'text-ivory/90 hover:bg-gold-accent/15 hover:text-gold-accent'
                }`}
              >
                <div className="w-5 h-5 rounded bg-gradient-to-br from-amber-500 to-amber-700 text-mahogany-950 font-black text-[10px] flex items-center justify-center font-mono shrink-0">
                  🎮
                </div>
                <div className="flex flex-col text-left">
                  <span>GameX Arcade & Canvas</span>
                  <span className={`text-[9px] font-normal ${currentView === 'gamex' ? 'text-mahogany-900/80 font-medium' : 'text-gray-400'}`}>Search, Play & Dedicated Canvas</span>
                </div>
              </button>



              {isDeveloper && (
                <button
                  onClick={() => {
                    onOpenSettingsModal();
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-ivory/90 hover:bg-gold-accent/10 hover:text-gold-accent transition-colors border-t border-gold-accent/10 mt-1 cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-gold-accent" />
                  <span>Site Settings</span>
                </button>
              )}
            </div>
          )}

          {/* Dev Access / Lock Button */}
          {isDeveloper ? (
            <button
              onClick={onLogoutDeveloper}
              className="px-2.5 py-1 rounded-md bg-mahogany-900 text-[10px] font-black text-gold-accent border border-gold-accent/30 cursor-pointer"
            >
              LOCK
            </button>
          ) : (
            <button
              onClick={onOpenUnlockModal}
              className="px-2.5 py-1 rounded-md bg-mahogany-900 text-[10px] font-black text-gold-accent border border-gold-accent/30 cursor-pointer"
            >
              DEV
            </button>
          )}

          {/* Subtle Secret Header AXIOMETIC Icon in Top Corner */}
          <button
            onClick={onOpenUnlockModal}
            className="text-xs opacity-25 hover:opacity-100 hover:scale-125 transition-all text-gold-accent p-1 cursor-pointer"
            title="AXIOMETIC Developer Gate"
          >
            🗝️
          </button>
        </div>

      </div>
    </header>
  );
};
