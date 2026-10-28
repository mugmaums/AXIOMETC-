import React from 'react';
import { BookRecord } from '../../types';
import { motion } from 'framer-motion';

interface MahoganyBookshelfProps {
  books: BookRecord[];
  onBookClick: (book: BookRecord) => void;
}

export const MahoganyBookshelf: React.FC<MahoganyBookshelfProps> = ({ books, onBookClick }) => {
  return (
    <div className="w-full h-full bg-[#121212] overflow-y-auto p-12 scrollbar-hide">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-serif text-amber-100/90 mb-12 text-center">The Axiometic Private Library</h2>
        
        {/* The Shelves */}
        <div className="grid grid-cols-1 gap-24">
          {[0, 1, 2].map((shelfIndex) => (
            <div key={shelfIndex} className="relative">
              {/* Shelf Base */}
              <div 
                className="absolute -bottom-4 left-0 right-0 h-8 bg-[#2d1b12] border-t border-white/10 shadow-2xl z-10"
                style={{
                  backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0)), url("https://www.transparenttextures.com/patterns/dark-wood.png")',
                  backgroundSize: '400px'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
              </div>
              
              {/* Books on this shelf */}
              <div className="flex items-end justify-center gap-1 min-h-[300px] px-8 relative z-20">
                {books.slice(shelfIndex * 15, (shelfIndex + 1) * 15).map((book) => (
                  <BookSpine key={book.id} book={book} onClick={() => onBookClick(book)} />
                ))}
                
                {/* Empty shelf space filler if needed */}
                {books.length === 0 && shelfIndex === 0 && (
                  <div className="flex flex-col items-center justify-center text-white/20 italic pb-12">
                    <p>No manuscripts published yet.</p>
                    <p className="text-sm">Upload a document to see it on the shelf.</p>
                  </div>
                )}
              </div>

              {/* Ambient Spotlight */}
              <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/5 blur-[120px] pointer-events-none rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BookSpine: React.FC<{ book: BookRecord; onClick: () => void }> = ({ book, onClick }) => {
  // Randomize thickness and height slightly for realism
  const thickness = 24 + (book.pageCount / 50) * 1.5;
  const height = 240 + Math.random() * 20;
  
  return (
    <motion.div
      whileHover={{ 
        y: -20, 
        z: 50,
        scale: 1.02,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
      }}
      onClick={onClick}
      className="cursor-pointer relative group"
      style={{ width: `${thickness}px`, height: `${height}px` }}
    >
      {/* The Spine */}
      <div 
        className="w-full h-full rounded-r-sm shadow-xl relative overflow-hidden flex flex-col items-center justify-between py-4 border-l border-white/5"
        style={{ 
          backgroundColor: book.coverDesign.accentColor,
          backgroundImage: book.coverDesign.style === 'leather' 
            ? 'url("https://www.transparenttextures.com/patterns/leather.png")'
            : 'none',
          boxShadow: 'inset -4px 0 10px rgba(0,0,0,0.5), 4px 0 15px rgba(0,0,0,0.3)'
        }}
      >
        {/* Top Ridges (Leather style) */}
        {book.coverDesign.style === 'leather' && (
          <div className="w-full flex flex-col gap-1 opacity-40">
            <div className="h-[2px] bg-black/40 w-full" />
            <div className="h-[2px] bg-black/40 w-full" />
          </div>
        )}

        {/* Title - Rotated */}
        <div className="flex-1 flex items-center justify-center overflow-hidden w-full px-1">
          <p 
            className="text-[10px] font-bold uppercase tracking-widest text-white/80 whitespace-nowrap"
            style={{ 
              writingMode: 'vertical-rl', 
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              fontFamily: book.coverDesign.style === 'classic' ? 'serif' : 'sans-serif'
            }}
          >
            {book.title}
          </p>
        </div>

        {/* Bottom Logo / Author */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center opacity-40">
            <span className="text-[6px]">AX</span>
          </div>
          {book.coverDesign.style === 'leather' && (
             <div className="w-full flex flex-col gap-1 opacity-40">
               <div className="h-[2px] bg-black/40 w-full" />
               <div className="h-[2px] bg-black/40 w-full" />
             </div>
          )}
        </div>
      </div>

      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-black/20 pointer-events-none" />
      
      {/* Hover Preview Tooltip */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
        {book.title} by {book.author}
      </div>
    </motion.div>
  );
};
