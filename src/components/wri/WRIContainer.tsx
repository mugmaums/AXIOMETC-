import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Upload, BookOpen, History, Loader2, Sparkles, ArrowLeft, Image, Link2, X, CheckCircle } from 'lucide-react';
import { Bookshelf } from './Bookshelf';
import { BookReader } from './BookReader';
import { CoverDesignStudio } from './CoverDesignStudio';
import { BookRecord } from '../../types';
import { useRoyalAudio } from '../../hooks/useRoyalAudio';
import { db, auth } from '../../firebase';
import { collection, onSnapshot, query, serverTimestamp, doc, setDoc } from 'firebase/firestore';

const CURATED_DEFAULT_BOOKS: BookRecord[] = [
  {
    id: 'axiometic-codex',
    title: 'The Axiometic Codex',
    author: 'Axiometic Architect',
    synopsis: 'Foundations of continuous synchronicity, royal wooden aesthetic, and autonomous living canvases.',
    pageCount: 120,
    sourceType: 'word',
    coverDesign: {
      front: '/src/assets/images/hero_axiometic_workspace_1792207571017.jpg',
      back: '/src/assets/images/mahogany_wood_texture_1792941904763.jpg',
      spine: '',
      accentColor: '#3d1a10',
      style: 'classic'
    },
    chapters: [
      {
        id: 'codex-ch-0',
        title: 'Prologue: The Living Canvas',
        content: 'Knowledge is neither static nor solitary. In the grand libraries of old, parchment breathed beneath the architect\'s hand. Today, through Axiometic systems, we unite timeless aesthetics with continuous real-time synchronicity.',
        pageNumber: 1
      },
      {
        id: 'codex-ch-1',
        title: 'Chapter I: The Royal Wood Lattice',
        content: 'Mahogany, brass, and velvet gold: these are not mere ornaments. They establish gravitas, focus, and quiet elegance. Every block placed upon the canvas reverberates through all connected nodes instantly.',
        pageNumber: 2
      },
      {
        id: 'codex-ch-2',
        title: 'Chapter II: The Autonomous Agent',
        content: 'Vaelourix operates as the master scribe in the digital scriptorium. With a single whispered command, new manuscripts arise, bindings are formed, and dynamic links are permanently woven.',
        pageNumber: 3
      }
    ],
    publishedAt: new Date().toISOString()
  },
  {
    id: 'architecture-of-thought',
    title: 'The Architecture of Thought',
    author: 'Marcus Aurelius & Axiometic',
    synopsis: 'Stoic meditations on system permanence, intentional creation, and digital mastery.',
    pageCount: 96,
    sourceType: 'word',
    coverDesign: {
      front: '/src/assets/images/axiometic_holographic_logo_1792234516124.jpg',
      back: '/src/assets/images/mahogany_wood_texture_1792941904763.jpg',
      spine: '',
      accentColor: '#1a2e1d',
      style: 'leather'
    },
    chapters: [
      {
        id: 'aot-ch-1',
        title: 'Book I: Inner Fortress',
        content: 'Observe how brief is the span between birth and dissolution. Construct systems that do not waver when storms arise. Let clarity be your guide and craft your devotion.',
        pageNumber: 1
      },
      {
        id: 'aot-ch-2',
        title: 'Book II: Principles of Harmony',
        content: 'When you arise in the morning, remember what a privilege it is to think, to build, to enjoy, to love. Let your craft echo in eternity.',
        pageNumber: 2
      }
    ],
    publishedAt: new Date().toISOString()
  },
  {
    id: 'art-of-war-manuscript',
    title: 'The Art of Strategy',
    author: 'Sun Tzu',
    synopsis: 'Calculations, positioning, and psychological mastery in information architecture.',
    pageCount: 140,
    sourceType: 'word',
    coverDesign: {
      front: '/src/assets/images/hero_axiometic_workspace_1792207571017.jpg',
      back: '/src/assets/images/mahogany_wood_texture_1792941904763.jpg',
      spine: '',
      accentColor: '#4a1515',
      style: 'classic'
    },
    chapters: [
      {
        id: 'aow-ch-1',
        title: 'Chapter I: Laying Plans',
        content: 'The art of war is of vital importance to the state. It is a matter of life and death, a road either to safety or to ruin. Hence it is a subject of inquiry which can on no account be neglected.',
        pageNumber: 1
      },
      {
        id: 'aow-ch-2',
        title: 'Chapter II: Waging War',
        content: 'In the operations of war, where there are in the field a thousand swift chariots, as many heavy chariots, and a hundred thousand mail-clad soldiers, with food sufficient for them: speed is the essence of victory.',
        pageNumber: 2
      }
    ],
    publishedAt: new Date().toISOString()
  },
  {
    id: 'cybernetic-chronicle',
    title: 'The Cybernetic Chronicle',
    author: 'Vaelourix AI',
    synopsis: 'A forward-looking exploration into synthetic intelligence and living architectures.',
    pageCount: 160,
    sourceType: 'word',
    coverDesign: {
      front: '/src/assets/images/avatar_creator_profile_1792207572261.jpg',
      back: '/src/assets/images/mahogany_wood_texture_1792941904763.jpg',
      spine: '',
      accentColor: '#1f2937',
      style: 'minimal'
    },
    chapters: [
      {
        id: 'cc-ch-1',
        title: 'The Origin of Synthesis',
        content: 'In the intersection of algorithmic cognition and human curiosity lies the synthetic manuscript. We do not just record history; we calculate its trajectories.',
        pageNumber: 1
      },
      {
        id: 'cc-ch-2',
        title: 'Neural Harmonics',
        content: 'Data pulses across the network like music through a vaulted cathedral. Every query discovers its reflection in the global archives.',
        pageNumber: 2
      }
    ],
    publishedAt: new Date().toISOString()
  }
];

export function WRIContainer() {
  const [view, setView] = useState<'shelf' | 'reader'>('shelf');
  const [selectedBook, setSelectedBook] = useState<BookRecord | null>(null);
  const [books, setBooks] = useState<BookRecord[]>([]);
  const [myBooks, setMyBooks] = useState<BookRecord[]>([]);
  const [localAcquiredBooks, setLocalAcquiredBooks] = useState<BookRecord[]>(() => {
    try {
      const stored = localStorage.getItem('axiometic_local_books');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [readHistory, setReadHistory] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('axiometic_read_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsAiSearching] = useState(false);
  const [showDesignStudio, setShowDesignStudio] = useState(false);
  const [bookProgress, setBookProgress] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem('axiometic_book_progress');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  
  const { playWoodClick, playSlide } = useRoyalAudio();

  const fetchAllBooks = async () => {
    try {
      const res = await fetch('/api/content');
      await res.json();
    } catch (err) {
      console.error("Failed to fetch content:", err);
    }
  };

  useEffect(() => {
    // 1. Listen to Public Books
    let unsubPublic: (() => void) | undefined;
    try {
      const publicQuery = query(collection(db, 'books'));
      unsubPublic = onSnapshot(publicQuery, (snapshot) => {
        const publicBooks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookRecord));
        if (publicBooks.length > 0) {
          setBooks(publicBooks);
        }
      }, (error) => {
        console.warn("Firestore error on public books, using curated archives:", error);
      });
    } catch (e) {
      console.warn("Firestore public query setup warning:", e);
    }

    // 2. Listen to Private Books (if logged in)
    let unsubPrivate: (() => void) | undefined;
    if (auth.currentUser) {
      try {
        const privateQuery = query(collection(db, 'users', auth.currentUser.uid, 'myBooks'));
        unsubPrivate = onSnapshot(privateQuery, (snapshot) => {
          const privateBooks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookRecord));
          setMyBooks(privateBooks);
        }, (error) => {
          console.warn("Firestore error on private books:", error);
        });
      } catch (e) {}
    }

    // 3. Listen to Read History
    let unsubHistory: (() => void) | undefined;
    if (auth.currentUser) {
      try {
        const historyQuery = query(collection(db, 'users', auth.currentUser.uid, 'readHistory'));
        unsubHistory = onSnapshot(historyQuery, (snapshot) => {
          const history: string[] = [];
          const progress: Record<string, number> = {};
          snapshot.docs.forEach(doc => {
            const data = doc.data();
            history.push(data.bookId);
            if (data.progress !== undefined) {
              progress[data.bookId] = data.progress;
            }
          });
          setReadHistory(prev => Array.from(new Set([...prev, ...history])));
          setBookProgress(prev => ({ ...prev, ...progress }));
        }, (error) => {
          console.warn("Firestore error on read history:", error);
        });
      } catch (e) {}
    }

    return () => {
      if (unsubPublic) unsubPublic();
      if (unsubPrivate) unsubPrivate();
      if (unsubHistory) unsubHistory();
    };
  }, [auth.currentUser]);

  const [acquiringBook, setAcquiringBook] = useState<any | null>(null);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [customCoverPreview, setCustomCoverPreview] = useState<string | null>(null);
  const [customCoverMode, setCustomCoverMode] = useState<'upload' | 'url'>('upload');
  const [customCoverError, setCustomCoverError] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsAiSearching(true);
    const cleanQ = searchQuery.trim();

    try {
      // 1. Direct Google Books API query from browser client
      try {
        const gbRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(cleanQ)}&maxResults=15&printType=books`);
        if (gbRes.ok) {
          const gbData = await gbRes.json();
          if (gbData.items && gbData.items.length > 0) {
            const mappedResults = gbData.items.map((item: any) => {
              const info = item.volumeInfo || {};
              return {
                id: item.id || `gb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                title: info.title || 'Untitled Work',
                subtitle: info.subtitle || '',
                author: (info.authors && info.authors.length > 0) ? info.authors.join(', ') : 'Unknown Author',
                description: info.description || info.subtitle || `Archival manuscript acquired from the world registry for "${info.title || cleanQ}".`,
                pageCount: info.pageCount || 180,
                publishedDate: info.publishedDate || '',
                publishedYear: info.publishedDate ? info.publishedDate.split('-')[0] : 'Historical',
                categories: info.categories || ['Literature & Treatises'],
                publisher: info.publisher || 'Global Archives',
                isbn: (info.industryIdentifiers && info.industryIdentifiers.length > 0)
                  ? info.industryIdentifiers.map((ii: any) => `${ii.type}: ${ii.identifier}`).join(' | ')
                  : '',
                language: info.language || 'en',
                previewLink: info.previewLink || info.infoLink || '',
              };
            });
            setSearchResults(mappedResults);
            setIsAiSearching(false);
            return;
          }
        }
      } catch (gbErr) {
        console.warn("Client Google Books query fallback:", gbErr);
      }

      // 2. Server API fallback
      const res = await fetch(`/api/books/search?q=${encodeURIComponent(cleanQ)}`);
      const data = await res.json();
      if (data.success && data.results && data.results.length > 0) {
        setSearchResults(data.results);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsAiSearching(false);
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomCoverPreview(reader.result as string);
        setCustomCoverError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmAcquisition = async () => {
    if (!acquiringBook) return;
    const coverUrl = customCoverMode === 'upload' ? customCoverPreview : customCoverUrl.trim();
    if (!coverUrl) {
      setCustomCoverError('You must provide your own custom book cover to bind this manuscript.');
      return;
    }

    const bookRecord: BookRecord = {
      id: acquiringBook.id || `book_${Date.now()}`,
      title: acquiringBook.title || 'Untitled Manuscript',
      subtitle: acquiringBook.subtitle || '',
      author: acquiringBook.author || 'Unknown Scribe',
      synopsis: acquiringBook.description || 'Manuscript acquired into Axiometic private archives.',
      pageCount: acquiringBook.pageCount || 140,
      publisher: acquiringBook.publisher || 'Global Archives',
      publishedDate: acquiringBook.publishedDate || acquiringBook.publishedYear || '',
      categories: acquiringBook.categories || ['Manuscript'],
      isbn: acquiringBook.isbn || '',
      language: acquiringBook.language || 'en',
      previewLink: acquiringBook.previewLink || '',
      sourceType: 'word',
      coverDesign: {
        front: coverUrl,
        back: '/src/assets/images/mahogany_wood_texture_1792941904763.jpg',
        spine: '',
        accentColor: '#4a2c1d',
        style: 'classic'
      },
      chapters: [
        {
          id: `${acquiringBook.id}-ch0`,
          title: 'Prologue & Historical Overview',
          content: acquiringBook.description || 'Manuscript preserved in the Axiometic archives.',
          pageNumber: 1
        },
        {
          id: `${acquiringBook.id}-ch1`,
          title: 'Chapter I: The Core Treatises',
          content: `Historical manuscript of "${acquiringBook.title}". Bound with custom archival cover provided by the reader. Published era: ${acquiringBook.publishedYear || 'Classical'}.`,
          pageNumber: 2
        }
      ],
      publishedAt: new Date().toISOString(),
      userId: auth.currentUser?.uid || 'local-user'
    };

    // Save locally first so it is immediately visible
    const updated = [bookRecord, ...localAcquiredBooks.filter(b => b.id !== bookRecord.id)];
    setLocalAcquiredBooks(updated);
    try {
      localStorage.setItem('axiometic_local_books', JSON.stringify(updated));
    } catch {}

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'myBooks', bookRecord.id), bookRecord);
      } catch (err) {
        console.warn("Could not sync book to Firestore, saved locally:", err);
      }
    }

    setAcquiringBook(null);
    setCustomCoverPreview(null);
    setCustomCoverUrl('');
    setSearchResults([]);
    setSearchQuery('');
    playWoodClick();
  };

  const handleSelectBook = async (book: BookRecord) => {
    setSelectedBook(book);
    setView('reader');
    playSlide(0.5);

    // Save to local read history
    const updatedHistory = Array.from(new Set([...readHistory, book.id]));
    setReadHistory(updatedHistory);
    try {
      localStorage.setItem('axiometic_read_history', JSON.stringify(updatedHistory));

      // Increment genuine book view count for Socio/X insights
      const viewsRaw = localStorage.getItem('axiometic_book_views');
      const viewsMap = viewsRaw ? JSON.parse(viewsRaw) : {};
      viewsMap[book.id] = (viewsMap[book.id] || 0) + 1;
      localStorage.setItem('axiometic_book_views', JSON.stringify(viewsMap));

      // Log genuine interaction in Socio/X audit history
      const interactionsRaw = localStorage.getItem('axiometic_socio_interactions');
      const interactions = interactionsRaw ? JSON.parse(interactionsRaw) : [];
      const newInteraction = {
        id: `int_${Date.now()}`,
        type: 'book_read',
        title: `Viewed Book "${book.title}"`,
        description: `Studying manuscript by ${book.author || 'Archival Scribe'} in WRI Scriptorium.`,
        targetId: book.id,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('axiometic_socio_interactions', JSON.stringify([newInteraction, ...interactions].slice(0, 100)));
    } catch {}

    if (auth.currentUser) {
      try {
        const docRef = doc(db, 'users', auth.currentUser.uid, 'readHistory', book.id);
        await setDoc(docRef, {
          bookId: book.id,
          userId: auth.currentUser.uid,
          lastReadAt: serverTimestamp(),
          progress: bookProgress[book.id] || 0
        }, { merge: true });
      } catch (err) {
        console.warn("Read history sync warning:", err);
      }
    }
  };

  const handleProgressUpdate = async (progress: number) => {
    if (!selectedBook) return;
    
    // Save locally
    const updated = { ...bookProgress, [selectedBook.id]: progress };
    setBookProgress(updated);
    try {
      localStorage.setItem('axiometic_book_progress', JSON.stringify(updated));
    } catch {}

    if (auth.currentUser) {
      try {
        const docRef = doc(db, 'users', auth.currentUser.uid, 'readHistory', selectedBook.id);
        await setDoc(docRef, {
          progress: progress,
          lastReadAt: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.warn("Progress sync warning:", err);
      }
    }
  };

  const enrichedBooks = useMemo(() => {
    const baseList = books.length > 0 ? books : CURATED_DEFAULT_BOOKS;
    const combined = [...localAcquiredBooks, ...myBooks, ...baseList];
    const unique = combined.reduce((acc: BookRecord[], current) => {
      const x = acc.find(item => item.id === current.id);
      if (!x) return acc.concat([current]);
      else return acc;
    }, []);

    return unique.map(book => ({
      ...book,
      progress: bookProgress[book.id] !== undefined ? bookProgress[book.id] : (book.progress || 0)
    }));
  }, [books, myBooks, localAcquiredBooks, bookProgress]);


  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-64px)] relative p-4 sm:p-8 pb-32 overflow-hidden">
      <div className="wood-grain absolute inset-0 opacity-5 pointer-events-none" />
      
      <AnimatePresence mode="wait">
        {showDesignStudio ? (
          <div key="studio" className="relative z-10">
            <button 
              onClick={() => setShowDesignStudio(false)}
              className="mb-6 text-gold-accent hover:text-white flex items-center gap-2 font-bold"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Library
            </button>
            <CoverDesignStudio 
              onComplete={() => {
                setShowDesignStudio(false);
                fetchAllBooks();
              }}
              onCancel={() => setShowDesignStudio(false)}
            />
          </div>
        ) : view === 'shelf' ? (
          <motion.div 
            key="shelf"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex-1 flex flex-col space-y-8 max-w-7xl mx-auto w-full"
          >
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-black text-gold-accent tracking-tight flex items-center gap-3">
                  <BookOpen className="w-10 h-10" />
                  WRI STUDIO
                </h1>
                <p className="text-ivory/60 font-serif italic text-lg">
                  Transforming manuscripts into real-time interactive wonders.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="flex flex-col items-end gap-2">
                  <div className="relative group flex items-center">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-accent/50 group-focus-within:text-gold-accent transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Search or discover..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="bg-mahogany-900/80 border border-gold-accent/20 pl-10 pr-4 py-2 rounded-lg text-ivory placeholder-ivory/30 focus:outline-none w-64 focus:ring-1 focus:ring-gold-accent/50 transition-all font-serif italic"
                      />
                    </div>
                    <button 
                      onClick={handleSearch}
                      disabled={isSearching || !searchQuery.trim()}
                      className="ml-2 px-4 py-2 bg-gold-accent/10 hover:bg-gold-accent/20 text-gold-accent rounded-lg border border-gold-accent/20 transition-all text-xs font-bold uppercase tracking-wider disabled:opacity-30"
                      title="Search External Archives"
                    >
                      {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "DISCOVER"}
                    </button>
                  </div>
                  <p className="text-[9px] text-gold-accent/40 uppercase tracking-widest mr-24">Press Enter to fetch from global vault</p>
                </div>

                <button 
                  onClick={() => setShowDesignStudio(true)}
                  className="bg-mahogany-900/80 border border-gold-accent/20 px-6 py-2 rounded-lg text-gold-accent font-bold cursor-pointer hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group shadow-lg"
                >
                  <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                  PUBLISH NEW
                </button>
              </div>
            </div>

            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-mahogany-950/90 border border-gold-accent/30 rounded-2xl p-6 shadow-2xl overflow-hidden"
                >
                  <div className="flex justify-between items-center mb-6 border-b border-gold-accent/10 pb-4">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-gold-accent" />
                      <h3 className="text-gold-accent font-black uppercase tracking-[0.2em] text-xs">Axiometic Discoveries</h3>
                    </div>
                    <button 
                      onClick={() => { setSearchResults([]); setSearchQuery(''); }} 
                      className="text-ivory/30 hover:text-red-400 text-[10px] uppercase font-black tracking-widest transition-colors"
                    >
                      Dismiss Archives
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.map((result) => (
                      <div key={result.id} className="flex gap-4 p-4 bg-mahogany-900/60 rounded-xl border border-gold-accent/20 hover:border-gold-accent/50 transition-all group/res brass-border">
                        <div className="relative shrink-0 w-20 h-28 bg-gradient-to-br from-mahogany-800 to-mahogany-950 rounded-lg border border-gold-accent/30 flex flex-col items-center justify-center p-2 text-center shadow-2xl">
                          <BookOpen className="w-6 h-6 text-gold-accent/70 mb-1" />
                          <span className="text-[8px] font-mono text-gold-accent/60 uppercase tracking-tighter line-clamp-2">{result.publisher || 'Archives'}</span>
                          <span className="text-[7px] text-ivory/40 mt-1 font-mono">{result.publishedYear || 'Year N/A'}</span>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-ivory truncate group-hover/res:text-gold-accent transition-colors font-serif">{result.title}</h4>
                            <p className="text-[10px] text-gold-accent/70 uppercase tracking-widest font-mono truncate">{result.author}</p>
                            <p className="text-[11px] text-ivory/60 font-serif line-clamp-2 leading-relaxed">{result.description}</p>
                          </div>
                          <button 
                            onClick={() => {
                              setAcquiringBook(result);
                              setCustomCoverPreview(null);
                              setCustomCoverUrl('');
                              setCustomCoverError('');
                              playWoodClick();
                            }}
                            className="mt-3 w-full py-2 bg-gold-accent hover:bg-gold-accent/90 text-mahogany-950 text-[10px] rounded-lg transition-all font-black uppercase tracking-[0.1em] flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Bind with Custom Cover</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* User-Provided Book Cover Modal (Enforces user custom cover only) */}
            <AnimatePresence>
              {acquiringBook && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-mahogany-950/80 backdrop-blur-md">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-lg bg-mahogany-900 border-2 border-gold-accent/40 rounded-2xl p-6 sm:p-8 shadow-2xl brass-border text-ivory"
                  >
                    <button
                      onClick={() => setAcquiringBook(null)}
                      className="absolute top-4 right-4 p-2 text-ivory/40 hover:text-gold-accent transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gold-accent/15 border border-gold-accent/30 flex items-center justify-center text-gold-accent font-bold">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gold-accent font-serif tracking-tight">Bind Manuscript into Archives</h3>
                        <p className="text-[10px] text-ivory/50 font-mono uppercase tracking-widest">User-Provided Cover Enforced</p>
                      </div>
                    </div>

                    <div className="p-3 bg-mahogany-950/60 rounded-xl border border-gold-accent/15 mb-5 space-y-1">
                      <p className="text-xs font-serif font-bold text-ivory truncate">{acquiringBook.title}</p>
                      <p className="text-[10px] text-gold-accent/70 font-mono truncate">By {acquiringBook.author}</p>
                      <p className="text-[10px] text-ivory/50 font-serif italic pt-1 border-t border-gold-accent/10">
                        In accordance with Axiometic rules, the book cover must be provided by you (via direct upload or custom URL).
                      </p>
                    </div>

                    {customCoverError && (
                      <div className="mb-4 p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center font-mono">
                        {customCoverError}
                      </div>
                    )}

                    {/* Mode Selector: Direct Upload or Image URL */}
                    <div className="flex gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => setCustomCoverMode('upload')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          customCoverMode === 'upload'
                            ? 'bg-gold-accent text-mahogany-950 shadow-md font-black'
                            : 'bg-black/30 text-ivory/60 hover:text-gold-accent border border-gold-accent/20'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Direct Image Upload</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCustomCoverMode('url')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          customCoverMode === 'url'
                            ? 'bg-gold-accent text-mahogany-950 shadow-md font-black'
                            : 'bg-black/30 text-ivory/60 hover:text-gold-accent border border-gold-accent/20'
                        }`}
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Custom Image URL</span>
                      </button>
                    </div>

                    {/* Cover Input Field */}
                    {customCoverMode === 'upload' ? (
                      <div className="mb-6">
                        <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gold-accent/30 hover:border-gold-accent rounded-xl cursor-pointer bg-black/30 hover:bg-black/40 transition-all p-4 text-center">
                          {customCoverPreview ? (
                            <div className="flex items-center gap-4">
                              <img src={customCoverPreview} alt="Preview" className="w-16 h-24 object-cover rounded shadow-lg border border-gold-accent/40" />
                              <div className="text-left space-y-1">
                                <span className="text-xs font-bold text-gold-accent block">Custom Cover Ready</span>
                                <span className="text-[10px] text-ivory/60 block">Click to change cover image</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-2 pb-2">
                              <Upload className="w-8 h-8 text-gold-accent/60 mb-2" />
                              <p className="text-xs font-bold text-ivory">Click or drag image file here</p>
                              <p className="text-[10px] text-ivory/40 uppercase tracking-widest mt-1">PNG, JPG, WEBP</p>
                            </div>
                          )}
                          <input type="file" accept="image/*" onChange={handleCoverFileChange} className="hidden" />
                        </label>
                      </div>
                    ) : (
                      <div className="mb-6 space-y-3">
                        <label className="text-[11px] font-bold text-gold-accent uppercase tracking-wider block">
                          Custom Cover Image URL
                        </label>
                        <div className="relative">
                          <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-accent/50" />
                          <input
                            type="url"
                            value={customCoverUrl}
                            onChange={(e) => {
                              setCustomCoverUrl(e.target.value);
                              setCustomCoverError('');
                            }}
                            placeholder="https://example.com/my-book-cover.jpg"
                            className="w-full bg-black/40 border border-gold-accent/25 rounded-xl py-2.5 pl-10 pr-4 text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold-accent transition-all text-xs font-mono"
                          />
                        </div>
                        {customCoverUrl && (
                          <div className="flex items-center gap-3 p-2 bg-black/30 rounded-lg border border-gold-accent/15">
                            <img 
                              src={customCoverUrl} 
                              alt="URL Preview" 
                              className="w-12 h-16 object-cover rounded border border-gold-accent/30" 
                              onError={() => setCustomCoverError('Unable to preview image URL. Please ensure the link is direct and accessible.')}
                            />
                            <span className="text-[10px] text-gold-accent/70 font-mono">Cover URL Preview</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gold-accent/20">
                      <button
                        type="button"
                        onClick={() => setAcquiringBook(null)}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-ivory/60 hover:text-ivory cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmAcquisition}
                        disabled={customCoverMode === 'upload' ? !customCoverPreview : !customCoverUrl.trim()}
                        className="px-6 py-2.5 rounded-xl bg-gold-accent hover:bg-gold-accent/90 disabled:opacity-30 disabled:cursor-not-allowed text-mahogany-950 font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Bind & Add to Library</span>
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            <div className="flex-1 min-h-[500px]">
              {isPublishing ? (
                <div className="w-full h-[600px] flex flex-col items-center justify-center space-y-4 bg-mahogany-900/50 rounded-xl border-2 border-dashed border-gold-accent/20">
                  <Loader2 className="w-12 h-12 text-gold-accent animate-spin" />
                  <div className="text-center space-y-1">
                    <h3 className="text-xl font-bold text-gold-accent">Structuring your book...</h3>
                    <p className="text-ivory/40 text-sm italic">AI is generating covers and arranging the pages.</p>
                  </div>
                </div>
              ) : (
                <Bookshelf 
                  books={enrichedBooks} 
                  onSelectBook={handleSelectBook} 
                  readHistory={readHistory}
                  searchQuery={searchQuery}
                  showHistory={showHistory}
                  onToggleHistory={() => setShowHistory(!showHistory)}
                />
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="reader"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-50"
          >
            {selectedBook && (
              <BookReader 
                book={selectedBook} 
                onExit={() => { setView('shelf'); playWoodClick(); }} 
                onProgressUpdate={handleProgressUpdate}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
