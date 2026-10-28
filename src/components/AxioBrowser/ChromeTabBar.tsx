import React from 'react';
import { X, Plus, Globe } from 'lucide-react';
import type { AxioTab } from './types';

interface ChromeTabBarProps {
  tabs: AxioTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: (incognito?: boolean) => void;
  isIncognito?: boolean;
}

export const ChromeTabBar: React.FC<ChromeTabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  isIncognito = false,
}) => {
  return (
    <div className={`flex items-center h-10 px-2 select-none overflow-x-auto scrollbar-none border-b transition-colors ${
      isIncognito 
        ? 'bg-[#150d09] border-[#3c2518]' 
        : 'bg-gradient-to-r from-mahogany-950 via-mahogany-900 to-mahogany-950 border-gold-accent/25 shadow-inner'
    }`}>
      {/* Tabs Strip */}
      <div className="flex items-center gap-1.5 flex-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group relative flex items-center h-8 px-3.5 rounded-t-xl transition-all max-w-[210px] min-w-[130px] cursor-pointer text-xs font-serif ${
                isActive
                  ? isIncognito 
                    ? 'bg-[#2a170f] text-gold-accent shadow-md border-t-2 border-purple-400 border-x border-[#3c2518] z-10' 
                    : 'bg-gradient-to-b from-mahogany-800 to-mahogany-900 text-gold-accent shadow-lg border-t-2 border-gold-accent border-x border-gold-accent/30 z-10 font-bold'
                  : isIncognito
                    ? 'text-ivory/60 hover:bg-[#1f120c] hover:text-gold-accent'
                    : 'text-ivory/60 hover:bg-mahogany-800/50 hover:text-gold-accent/90'
              }`}
            >
              {/* Tab Favicon or Icon */}
              <div className="w-4 h-4 mr-2 shrink-0 flex items-center justify-center">
                {tab.isIncognito ? (
                  <span className="text-xs">🕶️</span>
                ) : tab.favicon ? (
                  <img 
                    src={tab.favicon} 
                    alt="" 
                    className="w-3.5 h-3.5 rounded-sm object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }} 
                  />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-gold-accent/70" />
                )}
              </div>

              {/* Tab Title */}
              <span className="truncate flex-1 tracking-tight text-[11px] font-medium drop-shadow-sm">
                {tab.title || 'New Tab'}
              </span>

              {/* Close Tab Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                className={`ml-1.5 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                  isActive ? 'hover:bg-gold-accent/20 text-gold-accent' : 'hover:bg-gold-accent/10 text-ivory/60'
                }`}
                title="Close tab"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {/* New Tab Button (+) */}
        <button
          onClick={() => onNewTab(false)}
          className="p-1.5 rounded-full hover:bg-gold-accent/15 text-gold-accent/70 hover:text-gold-accent transition-colors ml-1 shrink-0 border border-gold-accent/20 cursor-pointer shadow-sm"
          title="New Tab (Ctrl+T)"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {/* New Incognito Tab Button */}
        <button
          onClick={() => onNewTab(true)}
          className="p-1.5 rounded-full hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 transition-colors ml-1 shrink-0 border border-purple-500/30 cursor-pointer shadow-sm flex items-center gap-1 px-2.5"
          title="New Incognito Tab (Ctrl+Shift+N)"
        >
          <span className="text-xs">🕶️</span>
          <span className="text-[10px] font-bold font-mono uppercase hidden sm:inline">Incognito</span>
        </button>
      </div>

      {/* Right side window control indicator with brass badge */}
      <div className="flex items-center gap-1.5 px-2 shrink-0">
        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-mahogany-950/80 text-gold-accent border border-gold-accent/30 tracking-widest shadow-inner">
          {isIncognito ? '🕶️ INCOGNITO' : 'AXIO CHROME // WOOD EDITION'}
        </span>
      </div>
    </div>
  );
};
