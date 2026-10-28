import React, { useState, useRef, useEffect } from 'react';
import { 
  Lock, 
  Search, 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Home, 
  Star, 
  Sparkles, 
  BookOpen, 
  Puzzle, 
  ShieldCheck, 
  X
} from 'lucide-react';
import type { AxioExtension } from './types';

interface ChromeOmniboxProps {
  url: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  isBookmarked: boolean;
  isReaderMode: boolean;
  isIncognito: boolean;
  extensions: AxioExtension[];
  onNavigate: (target: string) => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onReload: () => void;
  onGoHome: () => void;
  onToggleBookmark: () => void;
  onToggleReaderMode: () => void;
  onToggleCopilot: () => void;
  isCopilotOpen: boolean;
  onToggleExtension: (id: string) => void;
}

export const ChromeOmnibox: React.FC<ChromeOmniboxProps> = ({
  url,
  isLoading,
  canGoBack,
  canGoForward,
  isBookmarked,
  isReaderMode,
  isIncognito,
  extensions,
  onNavigate,
  onGoBack,
  onGoForward,
  onReload,
  onGoHome,
  onToggleBookmark,
  onToggleReaderMode,
  onToggleCopilot,
  isCopilotOpen,
  onToggleExtension,
}) => {
  const [inputValue, setInputValue] = useState(url);
  const [isFocused, setIsFocused] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showExtensionsMenu, setShowExtensionsMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(url);
  }, [url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onNavigate(inputValue.trim());
      inputRef.current?.blur();
      setIsFocused(false);
    }
  };

  const getDisplayUrl = () => {
    if (isFocused) return inputValue;
    if (url.startsWith('axio://newtab')) return '';
    return url;
  };

  const isSecure = !url.startsWith('http://');

  return (
    <div className={`px-3 py-2 flex items-center gap-2 select-none border-b transition-colors relative z-30 ${
      isIncognito 
        ? 'bg-[#1c120c] border-[#3c2518] text-ivory/90' 
        : 'bg-gradient-to-r from-mahogany-900 via-mahogany-800 to-mahogany-900 border-gold-accent/30 text-ivory shadow-md'
    }`}>
      {/* Navigation History Controls in Warm Brass */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onGoBack}
          disabled={!canGoBack}
          className={`p-1.5 rounded-lg transition-colors border ${
            canGoBack 
              ? 'bg-mahogany-950/60 border-gold-accent/30 hover:bg-gold-accent/20 hover:border-gold-accent text-gold-accent cursor-pointer shadow-sm' 
              : 'border-transparent text-gold-accent/20 cursor-not-allowed'
          }`}
          title="Click to go back"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onGoForward}
          disabled={!canGoForward}
          className={`p-1.5 rounded-lg transition-colors border ${
            canGoForward 
              ? 'bg-mahogany-950/60 border-gold-accent/30 hover:bg-gold-accent/20 hover:border-gold-accent text-gold-accent cursor-pointer shadow-sm' 
              : 'border-transparent text-gold-accent/20 cursor-not-allowed'
          }`}
          title="Click to go forward"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onReload}
          className="p-1.5 rounded-lg bg-mahogany-950/60 border border-gold-accent/30 hover:bg-gold-accent/20 hover:border-gold-accent text-gold-accent transition-colors cursor-pointer shadow-sm"
          title={isLoading ? 'Stop loading' : 'Reload this page'}
        >
          <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-gold-accent' : ''}`} />
        </button>

        <button
          onClick={onGoHome}
          className="p-1.5 rounded-lg bg-mahogany-950/60 border border-gold-accent/30 hover:bg-gold-accent/20 hover:border-gold-accent text-gold-accent transition-colors cursor-pointer shadow-sm"
          title="Open the home page"
        >
          <Home className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Omnibox Inset Wood Slot */}
      <form 
        onSubmit={handleSubmit}
        className={`flex-1 flex items-center h-8.5 rounded-xl px-3 transition-all relative ${
          isIncognito
            ? isFocused
              ? 'bg-black/80 ring-1 ring-purple-400 border border-purple-400/50 shadow-inner'
              : 'bg-black/60 border border-[#3c2518]'
            : isFocused 
              ? 'bg-mahogany-950 ring-1 ring-gold-accent border border-gold-accent shadow-inner' 
              : 'bg-mahogany-950/80 hover:bg-mahogany-950 border border-gold-accent/30 shadow-inner'
        }`}
      >
        {/* Security / Search Icon */}
        <button
          type="button"
          onClick={() => setShowSecurityModal(prev => !prev)}
          className="mr-2.5 text-gold-accent/70 hover:text-gold-accent transition-colors cursor-pointer shrink-0"
          title="View site security certificate"
        >
          {url.startsWith('axio://') ? (
            <Search className="w-3.5 h-3.5 text-gold-accent" />
          ) : isSecure ? (
            <Lock className="w-3.5 h-3.5 text-gold-accent" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          )}
        </button>

        {/* URL Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={getDisplayUrl()}
          placeholder={isIncognito ? "Search privately or type a URL" : "Search or type a URL"}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (url.startsWith('axio://newtab')) {
              setInputValue('');
            }
          }}
          onBlur={() => {
            setTimeout(() => setIsFocused(false), 200);
          }}
          className="w-full bg-transparent text-xs font-mono text-ivory placeholder-ivory/30 focus:outline-none"
        />

        {/* Clear Button if Typing */}
        {isFocused && inputValue && (
          <button
            type="button"
            onClick={() => setInputValue('')}
            className="p-1 hover:bg-gold-accent/20 rounded-full text-gold-accent/60 hover:text-gold-accent"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        {/* Right Action Icons inside Omnibox */}
        <div className="flex items-center gap-1.5 ml-1 shrink-0">
          <button
            type="button"
            onClick={onToggleReaderMode}
            className={`p-1 rounded-md transition-colors ${
              isReaderMode 
                ? 'text-gold-accent bg-gold-accent/20 border border-gold-accent/40' 
                : 'text-gold-accent/50 hover:text-gold-accent hover:bg-gold-accent/10'
            }`}
            title="Toggle Parchment Reader Mode"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onToggleBookmark}
            className={`p-1 rounded-md transition-colors ${
              isBookmarked 
                ? 'text-gold-accent fill-gold-accent' 
                : 'text-gold-accent/50 hover:text-gold-accent hover:bg-gold-accent/10'
            }`}
            title={isBookmarked ? 'Bookmark saved in library' : 'Bookmark this tab'}
          >
            <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </form>

      {/* Security Info Popup */}
      {showSecurityModal && (
        <div className="absolute top-12 left-28 w-72 bg-mahogany-950 border border-gold-accent/40 rounded-xl shadow-2xl p-4 text-xs text-ivory z-50 animate-in fade-in zoom-in-95 brass-border">
          <div className="flex items-center justify-between pb-2 border-b border-gold-accent/20">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-gold-accent" />
              <span className="font-bold text-gold-accent font-serif">Encrypted Connection</span>
            </div>
            <button 
              onClick={() => setShowSecurityModal(false)}
              className="text-gold-accent/60 hover:text-gold-accent"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="py-3 space-y-2 text-[11px] text-ivory/80 font-serif">
            <p>Your browsing session is cryptographically secured via TLS 1.3 and verified by AXIOMETIC neural architecture.</p>
            <div className="p-2 rounded bg-mahogany-900 border border-gold-accent/20 space-y-1 font-mono text-[10px]">
              <div className="flex justify-between">
                <span className="text-ivory/50">Certificate:</span>
                <span className="text-gold-accent">Valid ECC 256-bit</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ivory/50">Shield:</span>
                <span className="text-gold-accent">AXIO Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right Controls: AI Copilot, Extensions, Profile */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleCopilot}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
            isCopilotOpen
              ? 'bg-gold-accent text-mahogany-950 shadow-gold-accent/20 font-black'
              : 'bg-mahogany-950/80 hover:bg-gold-accent/15 text-gold-accent border border-gold-accent/40'
          }`}
          title="Open AXIO AI Copilot Side Panel"
        >
          <Sparkles className="w-3.5 h-3.5 text-gold-accent animate-pulse" />
          <span className="hidden sm:inline text-[11px] font-serif">AXIO AI</span>
        </button>

        {/* Extensions Icon */}
        <div className="relative">
          <button
            onClick={() => setShowExtensionsMenu(prev => !prev)}
            className="p-1.5 rounded-lg bg-mahogany-950/60 border border-gold-accent/30 hover:bg-gold-accent/20 text-gold-accent transition-colors cursor-pointer"
            title="Extensions"
          >
            <Puzzle className="w-3.5 h-3.5" />
          </button>

          {showExtensionsMenu && (
            <div className="absolute right-0 top-11 w-64 bg-mahogany-950 border border-gold-accent/40 rounded-xl shadow-2xl p-3 z-50 text-xs brass-border">
              <div className="flex items-center justify-between pb-2 border-b border-gold-accent/20 mb-2">
                <span className="font-bold text-gold-accent text-[11px] font-serif uppercase tracking-wider">AXIO Extensions</span>
                <span className="text-[10px] text-ivory/50 font-mono">Archive Store</span>
              </div>
              <div className="space-y-1.5">
                {extensions.map(ext => (
                  <div key={ext.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gold-accent/10 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{ext.icon}</span>
                      <div>
                        <div className="text-ivory font-serif font-bold text-[11px]">{ext.name}</div>
                        <div className="text-ivory/50 text-[9px]">{ext.description}</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={ext.enabled}
                      onChange={() => onToggleExtension(ext.id)}
                      className="rounded accent-[#d4af37] w-3.5 h-3.5 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chrome User Profile Badge in Brass */}
        <div 
          className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-accent to-amber-700 flex items-center justify-center text-[10px] font-black text-mahogany-950 border border-gold-accent/60 shadow-inner cursor-pointer hover:scale-105 transition-transform"
          title="Google Chrome Profile: mugmaums@gmail.com"
        >
          {isIncognito ? '🕶️' : 'A'}
        </div>
      </div>
    </div>
  );
};
