import React, { useMemo } from 'react';
import { BookRecord } from '../../types';
import { Book3D } from './Book3D';
import { motion, AnimatePresence } from 'motion/react';

interface BookshelfProps {
  books: BookRecord[];
  onSelectBook: (book: BookRecord) => void;
  readHistory: string[];
  searchQuery: string;
  showHistory: boolean;
  onToggleHistory: () => void;
}

export function Bookshelf({ 
  books, 
  onSelectBook, 
  readHistory, 
  searchQuery,
  showHistory,
  onToggleHistory
}: BookshelfProps) {
  const filteredBooks = useMemo(() => {
    return books.filter(b => 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [books, searchQuery]);

  const shelves = useMemo(() => {
    const rows: BookRecord[][] = [];
    for (let i = 0; i < filteredBooks.length; i += 4) {
      rows.push(filteredBooks.slice(i, i + 4));
    }
    if (rows.length < 3) {
      while (rows.length < 3) rows.push([]);
    }
    return rows;
  }, [filteredBooks]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 pb-24 relative">
      {/* Permanent Read History Red Tag (Hanging from the top shelf) */}
      <div className="absolute -top-16 left-10 z-40">
         <div className="w-0.5 h-20 bg-gold-accent/30 mx-auto" />
         <motion.button 
            onClick={onToggleHistory}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#991b1b] px-4 py-2 rounded-sm shadow-2xl border border-gold-accent/40 relative -mt-1 group cursor-pointer"
          >
            <span className="text-white font-black text-xs tracking-[0.2em] flex items-center gap-2">
               READ
            </span>
            {/* Small brass eyelet */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gold-accent/60 rounded-full border border-gold-accent" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#991b1b] rotate-45 border-r border-b border-gold-accent/40" />
         </motion.button>

         <AnimatePresence>
           {showHistory && (
             <motion.div 
               initial={{ opacity: 0, y: -10, scaleY: 0 }}
               animate={{ opacity: 1, y: 0, scaleY: 1 }}
               exit={{ opacity: 0, y: -10, scaleY: 0 }}
               className="absolute top-full left-0 mt-4 w-64 origin-top"
             >
               <div className="bg-mahogany-950/90 border border-gold-accent/30 p-4 rounded-sm shadow-2xl backdrop-blur-md">
                 <h3 className="text-gold-accent text-xs font-bold tracking-widest mb-3 border-b border-gold-accent/20 pb-2">CHRONICLES</h3>
                 <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                   {readHistory.length === 0 ? (
                     <p className="text-ivory/30 italic text-[10px]">Your history is yet to be written.</p>
                   ) : (
                     readHistory.map(id => {
                       const book = books.find(b => b.id === id);
                       if (!book) return null;
                       return (
                         <div key={id} className="group/item">
                           <p className="text-ivory/90 text-xs font-serif italic truncate">{book.title}</p>
                           <div className="flex justify-between items-center mt-1">
                             <div className="flex-1 h-1 bg-mahogany-900 rounded-full overflow-hidden mr-2">
                               <div className="h-full bg-emerald-600" style={{ width: `${(book.progress || 0) * 100}%` }} />
                             </div>
                             <span className="text-[8px] text-gold-accent/60 font-bold">{Math.round((book.progress || 0) * 100)}%</span>
                           </div>
                         </div>
                       );
                     })
                   )}
                 </div>
               </div>
             </motion.div>
           )}
         </AnimatePresence>
      </div>

      {shelves.map((shelfBooks, rowIndex) => (
        <div key={rowIndex} className="relative mb-24">
          {/* 2D Wooden Shelf Base - Skeuomorphic */}
          <div className="absolute -bottom-8 left-0 right-0 h-10 z-0">
            <div className="w-full h-full bg-[#3d1a10] border-t-2 border-gold-accent/40 shadow-[0_15px_30px_rgba(0,0,0,0.8)] relative overflow-hidden">
               <div className="absolute inset-0 wood-grain opacity-20" />
            </div>
            <div className="w-full h-4 bg-[#2d140b] border-t border-black/20 shadow-inner relative overflow-hidden">
               <div className="absolute inset-0 wood-grain opacity-10" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-2 bg-gold-accent/20 border border-gold-accent/30 rounded-[1px]" />
            </div>
          </div>
          
          <div className="absolute inset-x-0 bottom-2 top-0 bg-black/30 blur-xl -z-10" />

          <div className="grid grid-cols-4 gap-8 h-[320px] relative z-10 px-12">
            {shelfBooks.map((book) => (
              <motion.div 
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rowIndex * 0.1 }}
                className="h-full"
              >
                <Book3D 
                  book={book} 
                  isRead={readHistory.includes(book.id)} 
                  onSelect={() => onSelectBook(book)} 
                />
              </motion.div>
            ))}
            
            {[...Array(Math.max(0, 4 - shelfBooks.length))].map((_, i) => (
              <div key={`empty-${i}`} className="h-full" />
            ))}
          </div>

          <div className="absolute -bottom-10 left-8 w-6 h-8 bg-[#1a0f0a] border-r border-gold-accent/10 rounded-br-lg shadow-lg" />
          <div className="absolute -bottom-10 right-8 w-6 h-8 bg-[#1a0f0a] border-l border-gold-accent/10 rounded-bl-lg shadow-lg" />
        </div>
      ))}

      {filteredBooks.length === 0 && (
        <div className="text-center py-24 bg-mahogany-900/30 brass-border rounded-2xl">
          <p className="text-gold-accent/50 italic text-xl font-serif">
            {searchQuery ? "No matches found in the royal archives." : "The shelves await your first manuscript."}
          </p>
        </div>
      )}
    </div>
  );
}
