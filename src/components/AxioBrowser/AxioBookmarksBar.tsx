import React from 'react';
import { Folder, Globe } from 'lucide-react';
import type { Bookmark } from './types';

interface AxioBookmarksBarProps {
  bookmarks: Bookmark[];
  onNavigateUrl: (url: string) => void;
  isIncognito?: boolean;
}

export const AxioBookmarksBar: React.FC<AxioBookmarksBarProps> = ({
  bookmarks,
  onNavigateUrl,
  isIncognito = false,
}) => {
  return (
    <div className={`flex items-center h-8 px-3 gap-2 select-none border-b text-xs overflow-x-auto scrollbar-none font-serif ${
      isIncognito 
        ? 'bg-[#180f0a] border-[#3c2518] text-ivory/80' 
        : 'bg-gradient-to-r from-mahogany-950 via-mahogany-900 to-mahogany-950 border-gold-accent/20 text-ivory/90 shadow-sm'
    }`}>
      {/* Default Bookmarks Folder */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-gold-accent/15 cursor-pointer text-[11px] shrink-0 font-medium text-gold-accent transition-colors">
        <Folder className="w-3.5 h-3.5 text-gold-accent fill-gold-accent/20" />
        <span className="font-bold tracking-tight">Library Shelf</span>
      </div>

      <div className="w-[1px] h-4 bg-gold-accent/20 shrink-0" />

      {/* Bookmarks List */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {bookmarks.map((bm) => (
          <button
            key={bm.id}
            onClick={() => onNavigateUrl(bm.url)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-gold-accent/15 transition-colors shrink-0 text-[11px] text-ivory/80 hover:text-gold-accent cursor-pointer group border border-transparent hover:border-gold-accent/25"
          >
            {bm.favicon ? (
              <img 
                src={bm.favicon} 
                alt="" 
                className="w-3 h-3 rounded-sm object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Globe className="w-3 h-3 text-gold-accent/70" />
            )}
            <span className="truncate max-w-[130px] font-sans font-medium">{bm.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
