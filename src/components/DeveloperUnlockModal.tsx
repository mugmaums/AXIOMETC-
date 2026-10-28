import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, X, ShieldCheck } from 'lucide-react';

interface PatternLockProps {
  onSuccess: (pattern: number[]) => void;
  correctPattern: number[];
  showGuide?: boolean;
}

export const PatternLock: React.FC<PatternLockProps> = ({ onSuccess, correctPattern, showGuide = true }) => {
  const [activeNodes, setActiveNodes] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const nodes = Array.from({ length: 9 }, (_, i) => i);

  const getCoord = (idx: number) => ({
    x: (idx % 3) * 33.33 + 16.66,
    y: Math.floor(idx / 3) * 33.33 + 16.66
  });

  const getIndexFromPoint = (x: number, y: number) => {
    if (!containerRef.current) return -1;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = x - rect.left;
    const ny = y - rect.top;
    
    // Each cell in 3x3 grid
    const cellWidth = rect.width / 3;
    const cellHeight = rect.height / 3;
    
    const col = Math.floor(nx / cellWidth);
    const row = Math.floor(ny / cellHeight);
    
    if (col < 0 || col > 2 || row < 0 || row > 2) return -1;
    
    // Node center in local coordinates
    const centerX = col * cellWidth + cellWidth / 2;
    const centerY = row * cellHeight + cellHeight / 2;
    const dist = Math.sqrt((nx - centerX) ** 2 + (ny - centerY) ** 2);
    
    // Sensitivity radius: 48% of cell width for generous, reliable touch & mouse tracking
    if (dist < cellWidth * 0.48) return row * 3 + col;
    return -1;
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    setError(false);
    setActiveNodes([]);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const index = getIndexFromPoint(clientX, clientY);
    if (index !== -1) setActiveNodes([index]);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const index = getIndexFromPoint(clientX, clientY);
    
    if (index !== -1 && !activeNodes.includes(index)) {
      setActiveNodes(prev => [...prev, index]);
    }
  };

  const handleEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (JSON.stringify(activeNodes) === JSON.stringify(correctPattern)) {
      onSuccess(activeNodes);
    } else if (activeNodes.length > 0) {
      setError(true);
      setTimeout(() => {
        setActiveNodes([]);
        setError(false);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={containerRef}
        className="relative w-64 h-64 grid grid-cols-3 p-4 touch-none cursor-crosshair bg-black/30 rounded-xl border border-gold-accent/20 select-none shadow-inner"
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        {/* Visual Guide Lines */}
        <svg className="absolute inset-0 pointer-events-none w-full h-full p-4" viewBox="0 0 100 100">
          {showGuide && (
            <g stroke="#d4af37" strokeWidth="2" strokeDasharray="3 3" opacity={0.35}>
              {correctPattern.map((node, i) => {
                if (i === 0) return null;
                const prev = getCoord(correctPattern[i - 1]);
                const curr = getCoord(node);
                return (
                  <line 
                    key={`guide-${i}`} 
                    x1={prev.x} 
                    y1={prev.y} 
                    x2={curr.x} 
                    y2={curr.y} 
                  />
                );
              })}
            </g>
          )}

          {/* User Drawn Pattern Lines */}
          <g transform="translate(0, 0)">
            {activeNodes.map((node, i) => {
              if (i === 0) return null;
              const prevNode = activeNodes[i - 1];
              const start = getCoord(prevNode);
              const end = getCoord(node);
              
              return (
                <motion.line 
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.9 }}
                  key={`${prevNode}-${node}`}
                  x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                  stroke={error ? '#ef4444' : '#d4af37'}
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              );
            })}
          </g>
        </svg>

        {nodes.map(node => {
          const isActive = activeNodes.includes(node);
          const isGuideNode = showGuide && correctPattern.includes(node);
          return (
            <div key={node} className="relative flex items-center justify-center pointer-events-none">
              <div className={`w-4 h-4 rounded-full transition-all duration-200 ${
                isActive 
                  ? (error ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] scale-125' : 'bg-gold-accent shadow-[0_0_18px_rgba(212,175,55,0.9)] scale-150 ring-2 ring-gold-accent/40') 
                  : isGuideNode
                    ? 'bg-gold-accent/30 border border-gold-accent/50'
                    : 'bg-gold-accent/10 border border-gold-accent/20'
              }`} />
            </div>
          );
        })}
      </div>
      <p className={`text-[10px] uppercase tracking-[0.3em] font-mono mt-4 ${error ? 'text-red-400 animate-pulse' : 'text-gold-accent/60'}`}>
        {error ? 'Trace Signature Rejected' : 'Trace Z-Signature (0→1→2→4→6→7→8)'}
      </p>
    </div>
  );
};

interface DeveloperUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (password: string) => void;
}

export const DeveloperUnlockModal: React.FC<DeveloperUnlockModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  // Correct pattern: Z shape (0 -> 1 -> 2 -> 4 -> 6 -> 7 -> 8)
  const CORRECT_PATTERN = [0, 1, 2, 4, 6, 7, 8];
  const [unlockMode, setUnlockMode] = useState<'pattern' | 'pin'>('pattern');
  const [showGuide, setShowGuide] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  if (!isOpen) return null;

  const handlePatternSuccess = () => {
    onSuccess('Developer@AXIOMETIC');
    onClose();
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === 'Developer@AXIOMETIC' || pinInput.trim() === '1234') {
      onSuccess('Developer@AXIOMETIC');
      onClose();
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-mahogany-950/95 backdrop-blur-xl">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-sm bg-mahogany-900 border-2 border-gold-accent/40 rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.9)] p-6 sm:p-8 overflow-hidden brass-border"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-ivory/30 hover:text-red-400 transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-6 text-center relative z-10">
          <div className="w-14 h-14 bg-gold-accent/10 border border-gold-accent/30 rounded-full flex items-center justify-center mb-3 shadow-inner">
            <ShieldCheck className="text-gold-accent w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-ivory tracking-[0.1em] uppercase font-serif">Security Bypass</h3>
          <p className="text-[10px] text-gold-accent/60 uppercase tracking-[0.2em] font-mono mt-0.5">Architect Authorization</p>
        </div>

        {/* Mode Selector Tabs: Pattern Trace vs PIN Backup */}
        <div className="flex gap-2 mb-6 relative z-10">
          <button
            type="button"
            onClick={() => setUnlockMode('pattern')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              unlockMode === 'pattern'
                ? 'bg-gold-accent text-mahogany-950 shadow-md font-black'
                : 'bg-black/30 text-ivory/50 hover:text-gold-accent border border-gold-accent/20'
            }`}
          >
            Pattern Trace
          </button>
          <button
            type="button"
            onClick={() => setUnlockMode('pin')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              unlockMode === 'pin'
                ? 'bg-gold-accent text-mahogany-950 shadow-md font-black'
                : 'bg-black/30 text-ivory/50 hover:text-gold-accent border border-gold-accent/20'
            }`}
          >
            PIN / Password
          </button>
        </div>

        <div className="relative z-10">
          {unlockMode === 'pattern' ? (
            <>
              <PatternLock 
                onSuccess={handlePatternSuccess} 
                correctPattern={CORRECT_PATTERN} 
                showGuide={showGuide} 
              />
              <div className="mt-4 flex items-center justify-center gap-2">
                <input
                  type="checkbox"
                  id="guideToggle"
                  checked={showGuide}
                  onChange={(e) => setShowGuide(e.target.checked)}
                  className="rounded border-gold-accent/40 text-gold-accent focus:ring-0 cursor-pointer"
                />
                <label htmlFor="guideToggle" className="text-[10px] text-ivory/60 cursor-pointer select-none">
                  Show Subtle Node Guides
                </label>
              </div>
            </>
          ) : (
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gold-accent uppercase tracking-wider block mb-1">
                  Developer Passphrase
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-accent/50" />
                  <input
                    type="password"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Developer@AXIOMETIC"
                    className="w-full bg-black/40 border border-gold-accent/25 rounded-xl py-2.5 pl-10 pr-4 text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold-accent transition-all text-xs"
                    autoFocus
                  />
                </div>
                {pinError && (
                  <p className="text-[10px] text-red-400 font-mono mt-1.5 animate-pulse text-center">
                    Invalid Passphrase. Use: Developer@AXIOMETIC
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-gold-accent hover:bg-gold-accent/90 text-mahogany-950 font-black rounded-xl text-xs uppercase tracking-widest shadow-xl transition-all cursor-pointer"
              >
                Unlock Architecture
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center relative z-10">
          <p className="text-[9px] text-ivory/40 italic font-serif leading-relaxed">
            Architect verification required for canvas mutations and system settings.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
