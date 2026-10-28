import React, { useState, useRef, useEffect } from 'react';
import { BookRecord, Chapter } from '../../types';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { ChevronLeft, ChevronRight, List, Settings, Maximize2, Type } from 'lucide-react';

interface RealisticBookReaderProps {
  book: BookRecord;
}

export const RealisticBookReader: React.FC<RealisticBookReaderProps> = ({ book }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // Index of the left page in the pair (0, 2, 4...)
  const [showTOC, setShowTOC] = useState(false);
  const [direction, setDirection] = useState(0); // 1 for next, -1 for prev
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<'parchment' | 'white' | 'sepia'>('parchment');

  const controls = useAnimation();
  const lastTapTime = useRef<number>(0);

  const totalPages = book.chapters.length;

  const handleNext = () => {
    if (currentPageIndex < totalPages - 1) {
      setDirection(1);
      setCurrentPageIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPageIndex > 0) {
      setDirection(-1);
      setCurrentPageIndex(prev => prev - 1);
    }
  };

  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime.current;
    
    if (timeSinceLastTap < 300) {
      // Double tap detected
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = 'clientX' in e ? e.clientX : (e as any).touches[0].clientX;
      const isRightSide = x > rect.left + rect.width / 2;
      
      if (isRightSide) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    lastTapTime.current = now;
  };

  const themes = {
    parchment: 'bg-[#f4e4bc] text-[#3d2b1f] border-[#d4c5a0]',
    white: 'bg-white text-gray-900 border-gray-200',
    sepia: 'bg-[#704214]/10 text-[#3d2b1f] border-[#704214]/20'
  };

  const currentChapter = book.chapters[currentPageIndex];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 lg:p-12 font-serif overflow-hidden">
      
      {/* Reader Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 z-[110]">
        <button onClick={() => setShowTOC(!showTOC)} className="p-2 hover:text-amber-500 transition-colors"><List /></button>
        <div className="h-4 w-[1px] bg-white/10" />
        <button onClick={handlePrev} disabled={currentPageIndex === 0} className="p-2 hover:text-amber-500 disabled:opacity-30"><ChevronLeft /></button>
        <span className="text-sm font-sans min-w-[60px] text-center">
          {currentPageIndex + 1} / {totalPages}
        </span>
        <button onClick={handleNext} disabled={currentPageIndex >= totalPages - 1} className="p-2 hover:text-amber-500 disabled:opacity-30"><ChevronRight /></button>
        <div className="h-4 w-[1px] bg-white/10" />
        <button onClick={() => setFontSize(prev => Math.min(32, prev + 2))} className="p-2 hover:text-amber-500"><Type className="w-4 h-4" /></button>
        <button onClick={() => setFontSize(prev => Math.max(12, prev - 2))} className="p-2 hover:text-amber-500"><Type className="w-3 h-3" /></button>
      </div>

      {/* The Book Container */}
      <div 
        className="relative w-full max-w-5xl aspect-[4/3] max-h-[85vh] flex justify-center perspective-[2000px]"
        onMouseDown={handleDoubleTap}
        onTouchStart={handleDoubleTap}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPageIndex}
            custom={direction}
            initial={{ rotateY: direction > 0 ? -10 : 10, opacity: 0.8 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ 
              rotateY: direction > 0 ? 90 : -90, 
              opacity: 0,
              transition: { duration: 0.5, ease: "easeInOut" } 
            }}
            className="w-full h-full flex shadow-2xl relative"
          >
            {/* Left Page */}
            <div className={`flex-1 h-full rounded-l-lg border-r border-black/10 p-12 overflow-y-auto ${themes[theme]}`}
                 style={{ boxShadow: 'inset -20px 0 30px rgba(0,0,0,0.05)' }}>
               {currentPageIndex === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center">
                    <h1 className="text-4xl font-bold mb-4">{book.title}</h1>
                    <div className="w-20 h-1 bg-current/20 mb-8" />
                    <p className="text-xl italic opacity-60">by {book.author}</p>
                 </div>
               ) : (
                 <div className="space-y-6">
                    <h2 className="text-2xl font-bold border-b border-current/10 pb-4">{book.chapters[currentPageIndex-1]?.title}</h2>
                    <div 
                      className="leading-relaxed prose prose-stone lg:prose-xl"
                      style={{ fontSize: `${fontSize}px` }}
                      dangerouslySetInnerHTML={{ __html: book.chapters[currentPageIndex-1]?.content || '' }}
                    />
                 </div>
               )}
            </div>

            {/* Right Page */}
            <div className={`flex-1 h-full rounded-r-lg p-12 overflow-y-auto ${themes[theme]}`}
                 style={{ boxShadow: 'inset 20px 0 30px rgba(0,0,0,0.05)' }}>
              <div className="space-y-6">
                 <h2 className="text-2xl font-bold border-b border-current/10 pb-4">{currentChapter?.title}</h2>
                 <div 
                   className="leading-relaxed prose prose-stone lg:prose-xl"
                   style={{ fontSize: `${fontSize}px` }}
                   dangerouslySetInnerHTML={{ __html: currentChapter?.content || '' }}
                 />
              </div>
            </div>

            {/* Middle Gutter */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-black/10 z-10" />
            <div className="absolute left-1/2 top-0 bottom-0 w-[40px] -translate-x-1/2 bg-gradient-to-r from-black/10 via-transparent to-black/10 pointer-events-none" />
          </motion.div>
        </AnimatePresence>

        {/* Page Curl Effect during exit could be added here for higher fidelity */}
      </div>

      {/* TOC Drawer */}
      <AnimatePresence>
        {showTOC && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="absolute top-0 left-0 bottom-0 w-80 bg-[#121212] border-r border-white/10 z-[120] p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-amber-500">Chapters</h3>
              <button onClick={() => setShowTOC(false)} className="p-1 hover:bg-white/5 rounded-full"><ChevronLeft /></button>
            </div>
            <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-160px)]">
              {book.chapters.map((chapter, idx) => (
                <button 
                  key={chapter.id}
                  onClick={() => {
                    setCurrentPageIndex(idx);
                    setShowTOC(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${currentPageIndex === idx ? 'bg-amber-500/10 text-amber-500' : 'hover:bg-white/5 text-white/60'}`}
                >
                  <p className="text-xs opacity-40 mb-1">Chapter {idx + 1}</p>
                  <p className="font-medium truncate">{chapter.title}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
