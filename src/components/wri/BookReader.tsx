import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Text, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { BookRecord } from '../../types';
import { useRoyalAudio } from '../../hooks/useRoyalAudio';
import { motion, AnimatePresence } from 'framer-motion';

interface PageProps {
  content: string;
  pageNumber: number;
  rotation: number;
  isFlipping: boolean;
}

function Page({ content, pageNumber, rotation, isFlipping }: PageProps) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = THREE.MathUtils.damp(meshRef.current.rotation.y, rotation, 8, state.clock.getDelta());
  });

  return (
    <group ref={meshRef}>
      <mesh castShadow receiveShadow>
        <planeGeometry args={[1.5, 2]} />
        <meshPhysicalMaterial 
          color="#fdfaf0" 
          side={THREE.DoubleSide} 
          roughness={0.9}
        />
        <group position={[-0.6, 0.8, 0.01]}>
          <Text
            fontSize={0.06}
            color="#1a0f0a"
            maxWidth={1.2}
            anchorX="left"
            anchorY="top"
            lineHeight={1.4}
            font="/fonts/PlayfairDisplay-Regular.ttf"
          >
            {content.slice(0, 1500)}
          </Text>
          <Text
            position={[0.6, -1.7, 0]}
            fontSize={0.05}
            color="#4a2c1d"
            font="/fonts/PlayfairDisplay-Italic.ttf"
          >
            {pageNumber}
          </Text>
        </group>
      </mesh>
    </group>
  );
}

export function BookReader({ book, onExit, onProgressUpdate }: { 
  book: BookRecord, 
  onExit: () => void,
  onProgressUpdate?: (progress: number) => void
}) {
  const [currentPage, setCurrentPage] = useState(-1); // -1 is Cover
  const [isFlipping, setIsFlipping] = useState(false);
  const [hasSavedBookmark, setHasSavedBookmark] = useState(false);
  const { playSlide, playWoodClick } = useRoyalAudio();
  const lastTap = useRef(0);

  const pages = useMemo(() => {
    const p: string[] = [];
    if (book.chapters && Array.isArray(book.chapters) && book.chapters.length > 0) {
      book.chapters.forEach(ch => {
        p.push((ch.title ? ch.title.toUpperCase() + "\n\n" : "") + (ch.content || ""));
      });
    } else if (book.synopsis) {
      p.push("SYNOPSIS\n\n" + book.synopsis);
      p.push("ARCHIVAL NOTE\n\nThis manuscript was acquired from global repositories. Full interactive synthesis can be authored in WRI Studio.");
    } else {
      p.push("MANUSCRIPT EXCERPT\n\n" + (book.title || "Untitled Archive"));
    }
    return p;
  }, [book]);

  const coverAccent = book.coverDesign?.accentColor || '#4a2c1d';
  const coverFront = book.coverDesign?.front || '';
  const coverTexture = useMemo(() => {
    if (!coverFront) return null;
    try {
      return new THREE.TextureLoader().load(coverFront);
    } catch {
      return null;
    }
  }, [coverFront]);

  const [savedBookmarkPage, setSavedBookmarkPage] = useState<number | null>(null);

  // Load saved bookmark on mount
  useEffect(() => {
    try {
      const savedPageStr = localStorage.getItem(`axiometic_bm_${book.id}`);
      if (savedPageStr !== null) {
        const pageNum = parseInt(savedPageStr, 10);
        if (!isNaN(pageNum) && pageNum >= 0 && pageNum < pages.length) {
          setSavedBookmarkPage(pageNum);
          setHasSavedBookmark(true);
        }
      }
    } catch {}
  }, [book.id, pages.length]);

  const handleResumeBookmark = () => {
    try {
      const saved = localStorage.getItem(`axiometic_bm_${book.id}`);
      if (saved !== null) {
        const pageNum = parseInt(saved, 10);
        if (!isNaN(pageNum) && pageNum >= 0 && pageNum < pages.length) {
          setCurrentPage(pageNum);
          playSlide(0.4);
          return;
        }
      }
    } catch {}
    setCurrentPage(0);
    playWoodClick();
  };

  const handleSaveBookmark = () => {
    if (currentPage < 0) return;
    try {
      localStorage.setItem(`axiometic_bm_${book.id}`, String(currentPage));
      setHasSavedBookmark(true);
      playWoodClick();
      const progress = Math.min(1, (currentPage + 1) / pages.length);
      if (onProgressUpdate) onProgressUpdate(progress);
    } catch {}
  };

  const handleFlip = () => {
    if (currentPage < pages.length - 1) {
      playSlide(0.4);
      setIsFlipping(true);
      const nextProgress = (currentPage + 2) / pages.length;
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      try {
        localStorage.setItem(`axiometic_bm_${book.id}`, String(nextPage));
        setHasSavedBookmark(true);
      } catch {}
      setTimeout(() => setIsFlipping(false), 600);
      if (onProgressUpdate) onProgressUpdate(Math.min(1, nextProgress));
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      handleFlip();
    }
    lastTap.current = now;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm" onPointerDown={handleDoubleTap}>
      {/* Wooden Table / Background for Reader */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'url("/src/assets/images/mahogany_wood_texture_1792941904763.jpg")', backgroundSize: 'cover', opacity: 0.8 }} />
      <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none" />

      {/* Top Header */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 text-center max-w-xl px-4">
        <h2 className="text-gold-accent font-black text-xl sm:text-2xl tracking-[0.2em] uppercase drop-shadow-lg truncate">{book.title}</h2>
        <p className="text-ivory/60 italic font-serif text-sm">by {book.author || 'Unknown'}</p>
      </div>

      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        {currentPage >= 0 && (
          <button
            onClick={handleSaveBookmark}
            className="bg-gold-accent/20 hover:bg-gold-accent text-gold-accent hover:text-mahogany-950 px-4 py-2.5 rounded-full font-bold border border-gold-accent/40 transition-all text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg cursor-pointer"
            title="Bookmark Current Page"
          >
            <span>🔖</span>
            <span className="hidden sm:inline">Bookmark Spread</span>
          </button>
        )}
        <button 
          onClick={onExit}
          className="bg-mahogany-900/90 px-6 py-2.5 rounded-full text-gold-accent font-bold brass-border hover:scale-105 active:scale-95 transition-all shadow-2xl uppercase tracking-wider text-xs cursor-pointer"
        >
          Close Archive
        </button>
      </div>

      {/* Main 3D Canvas */}
      <div className="w-full h-full">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={45} />
          <OrbitControls 
            enablePan={false} 
            minDistance={2.5} 
            maxDistance={6}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 3}
          />

          <ambientLight intensity={0.5} />
          <spotLight position={[5, 10, 5]} angle={0.2} penumbra={1} intensity={1.5} castShadow />
          <pointLight position={[0, 5, 0]} intensity={0.8} color="#fdfaf0" />

          <group position={[0, 0, 0]}>
            {/* Table Surface */}
            <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[10, 10]} />
              <meshPhysicalMaterial color="#1a0f0a" roughness={0.1} metalness={0.2} />
            </mesh>

            {currentPage === -1 ? (
              // Front Cover Transitioning to Open
              <group 
                onClick={() => { setCurrentPage(0); playWoodClick(); }}
              >
                <group>
                  <mesh castShadow>
                    <boxGeometry args={[1.6, 2.1, 0.1]} />
                    <meshPhysicalMaterial color={coverAccent} roughness={0.4} />
                  </mesh>
                  <mesh position={[0, 0, 0.051]}>
                    <planeGeometry args={[1.6, 2.1]} />
                    {coverTexture ? (
                      <meshPhysicalMaterial map={coverTexture} />
                    ) : (
                      <meshPhysicalMaterial color={coverAccent} roughness={0.4} />
                    )}
                  </mesh>
                </group>
              </group>
            ) : (
              // Open Book Spread
              <group>
                {/* Covers */}
                <mesh position={[0.8, 0, -0.06]} castShadow>
                  <boxGeometry args={[1.6, 2.1, 0.05]} />
                  <meshPhysicalMaterial color={coverAccent} roughness={0.4} />
                </mesh>
                <mesh position={[-0.8, 0, -0.06]} castShadow>
                  <boxGeometry args={[1.6, 2.1, 0.05]} />
                  <meshPhysicalMaterial color={coverAccent} roughness={0.4} />
                </mesh>
                
                {/* Right Page */}
                <group position={[0.78, 0, 0]}>
                  <Page 
                    content={pages[currentPage + 1] || "THE END"} 
                    pageNumber={(currentPage + 1) * 2} 
                    rotation={0} 
                    isFlipping={false} 
                  />
                </group>

                {/* Left Page */}
                <group position={[-0.78, 0, 0]}>
                  <Page 
                    content={pages[currentPage] || ""} 
                    pageNumber={currentPage * 2 + 1} 
                    rotation={0} 
                    isFlipping={false} 
                  />
                </group>

                {/* Flipping Page Animation */}
                {isFlipping && (
                   <group position={[0, 0, 0.01]}>
                     <Page 
                       content={pages[currentPage - 1] || ""} 
                       pageNumber={(currentPage - 1) * 2 + 1} 
                       rotation={-Math.PI} 
                       isFlipping={true} 
                     />
                   </group>
                )}
              </group>
            )}
          </group>

          <Environment preset="studio" />
          <ContactShadows position={[0, -1.19, 0]} opacity={0.6} scale={10} blur={2} />
        </Canvas>
      </div>

      {/* Reader Controls */}
      <div className="absolute bottom-10 flex flex-col items-center gap-3 z-50">
        {currentPage === -1 ? (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => { setCurrentPage(0); playWoodClick(); }}
              className="px-8 py-3 rounded-xl bg-gold-accent text-mahogany-950 font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Open Manuscript
            </button>
            {hasSavedBookmark && savedBookmarkPage !== null && (
              <button
                onClick={handleResumeBookmark}
                className="px-6 py-3 rounded-xl bg-mahogany-900/90 text-gold-accent border border-gold-accent/40 font-bold text-xs uppercase tracking-wider hover:bg-mahogany-800 transition-all flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <span>🔖 Resume (Spread {savedBookmarkPage + 1}, {Math.round(((savedBookmarkPage + 1) / pages.length) * 100)}%)</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-6 items-center">
              <button 
                onClick={() => { if(currentPage > 0) setCurrentPage(c => c - 1); playSlide(0.4); }}
                className="w-14 h-14 rounded-full bg-mahogany-900/90 brass-border flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-gold-accent shadow-xl disabled:opacity-30 cursor-pointer"
                disabled={currentPage <= 0}
                aria-label="Previous Page"
              >
                <span className="text-2xl">←</span>
              </button>

              <button
                onClick={handleSaveBookmark}
                className="px-4 py-2 rounded-lg bg-mahogany-950/80 border border-gold-accent/30 text-gold-accent text-xs font-mono uppercase tracking-widest hover:border-gold-accent transition-colors"
              >
                {hasSavedBookmark ? '🔖 BOOKMARKED' : '🔖 BOOKMARK'}
              </button>

              <button 
                onClick={handleFlip}
                className="w-14 h-14 rounded-full bg-mahogany-900/90 brass-border flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-gold-accent shadow-xl disabled:opacity-30 cursor-pointer"
                disabled={currentPage >= pages.length - 1}
                aria-label="Next Page"
              >
                <span className="text-2xl">→</span>
              </button>
            </div>
            <span className="text-gold-accent/80 font-mono text-xs tracking-widest mt-1 bg-mahogany-950/80 px-3 py-1 rounded-full border border-gold-accent/20">
              SPREAD {currentPage + 1} OF {pages.length} ({Math.round(((currentPage + 1) / pages.length) * 100)}% READ)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
