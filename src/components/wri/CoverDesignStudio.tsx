import React, { useState, useRef } from 'react';
import { Upload, Loader2, Wand2, Check, ArrowRight } from 'lucide-react';
import { BookRecord } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth } from '../../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface CoverDesignStudioProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const CoverDesignStudio: React.FC<CoverDesignStudioProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<'upload' | 'refining' | 'design' | 'publishing'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  const [bookDraft, setBookDraft] = useState<Partial<BookRecord>>({
    title: '',
    author: '',
    synopsis: '',
    chapters: [],
    coverDesign: {
      front: '',
      back: '',
      spine: '',
      accentColor: '#4a3222',
      style: 'classic'
    },
    price: 0
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setStep('refining');
    setLoadingMessage('Extracting manuscript structure...');

    try {
      // 1. Parse Document
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const parseRes = await fetch('/api/wri/parse-document', {
        method: 'POST',
        body: formData,
      });
      const parseData = await parseRes.json();
      
      if (!parseData.success) throw new Error(parseData.message);

      setLoadingMessage('Vaelourix is architecting the book layout...');

      // 2. AI Enhance
      const enhanceRes = await fetch('/api/wri/enhance-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: parseData.text,
          title: selectedFile.name.replace(/\.[^/.]+$/, ""),
          sourceType: parseData.sourceType
        }),
      });
      const enhanceData = await enhanceRes.json();
      
      if (!enhanceData.success) throw new Error(enhanceData.message);

      setBookDraft({
        ...bookDraft,
        ...enhanceData.book,
        sourceType: parseData.sourceType,
      });

      setStep('design');
    } catch (err) {
      console.error(err);
      alert('Failed to process manuscript. Please try a different file.');
      setStep('upload');
    }
  };

  const generateCoverPart = async (part: 'front' | 'back' | 'spine') => {
    setLoadingMessage(`Generating AI ${part} cover art...`);
    try {
      const res = await fetch('/api/wri/generate-cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `${bookDraft.title} - ${bookDraft.synopsis}`,
          part 
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBookDraft(prev => ({
          ...prev,
          coverDesign: { ...prev.coverDesign!, [part]: data.imageUrl }
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublish = async () => {
    if (!auth.currentUser) {
      alert('Please log in to publish.');
      return;
    }

    // Strict Cover Assets Validation
    const front = bookDraft.coverDesign?.front?.trim();
    const spine = bookDraft.coverDesign?.spine?.trim();
    const back = bookDraft.coverDesign?.back?.trim();
    const accent = bookDraft.coverDesign?.accentColor?.trim();

    if (!front || !spine || !back || !accent) {
      alert('Mandatory cover requirements: You must provide Front Cover, Spine, Back Cover, and Accent Color before publishing.');
      return;
    }

    if (bookDraft.price && bookDraft.price > 0 && !qrCodeFile) {
      alert('Please upload a payment QR code for paid books.');
      return;
    }

    setStep('publishing');
    setLoadingMessage('Finalizing publication...');
    
    try {
      const formData = new FormData();
      formData.append('title', bookDraft.title || '');
      formData.append('author', bookDraft.author || '');
      formData.append('synopsis', bookDraft.synopsis || '');
      formData.append('price', (bookDraft.price || 0).toString());
      formData.append('chapters', JSON.stringify(bookDraft.chapters));
      formData.append('coverDesign', JSON.stringify(bookDraft.coverDesign));
      formData.append('sourceType', bookDraft.sourceType || 'word');
      formData.append('userId', auth.currentUser.uid);
      
      if (file) formData.append('file', file);
      if (qrCodeFile) formData.append('qrCode', qrCodeFile);
      
      const res = await fetch('/api/wri/publish', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.success && data.book) {
        // Save to public library (books collection)
        const bookId = `book_${Date.now()}`;
        await setDoc(doc(db, 'books', bookId), {
          ...data.book,
          id: bookId,
          createdAt: serverTimestamp()
        });
        onComplete();
      } else {
        throw new Error(data.message || 'Failed to package book');
      }
    } catch (err: any) {
      console.error(err);
      alert('Publication failed: ' + err.message);
      setStep('design');
    }
  };


  return (
    <div className="max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1e1e1e] border border-white/10 rounded-2xl p-12 text-center"
          >
            <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Upload className="w-10 h-10 text-amber-500" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-white">Upload Your Manuscript</h2>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              Transform your Word or PowerPoint documents into realistic hardcover books published in the Axiometic Library.
            </p>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden" 
              accept=".docx,.pptx"
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-8 py-4 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold transition-all flex items-center gap-3 mx-auto text-white"
            >
              <Upload className="w-5 h-5" />
              <span>Select File (.docx, .pptx)</span>
            </button>
            <p className="mt-4 text-xs text-white/30 italic">Maximum file size: 50MB</p>
          </motion.div>
        )}

        {step === 'refining' && (
          <motion.div 
            key="refining"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-6" />
            <h2 className="text-2xl font-serif text-amber-100">{loadingMessage}</h2>
            <p className="text-white/40 mt-4 italic">Vaelourix Astra Engine is analyzing your content...</p>
          </motion.div>
        )}

        {step === 'design' && (
          <motion.div 
            key="design"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-white"
          >
            <div className="space-y-8">
              <section>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Check className="text-green-500 w-5 h-5" />
                  Manuscript Verified
                </h3>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-white/40 mb-1 block">Title</label>
                    <input 
                      value={bookDraft.title}
                      onChange={e => setBookDraft({...bookDraft, title: e.target.value})}
                      className="w-full bg-transparent border-b border-white/10 focus:border-amber-500 outline-none py-1 text-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-white/40 mb-1 block">Author</label>
                    <input 
                      value={bookDraft.author}
                      onChange={e => setBookDraft({...bookDraft, author: e.target.value})}
                      className="w-full bg-transparent border-b border-white/10 focus:border-amber-500 outline-none py-1"
                    />
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Cover Studio (All 4 Required)</h3>
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <span className={bookDraft.coverDesign?.front ? 'text-emerald-400' : 'text-red-400'}>Front {bookDraft.coverDesign?.front ? '✓' : '✗'}</span>
                    <span className="text-white/20">•</span>
                    <span className={bookDraft.coverDesign?.spine ? 'text-emerald-400' : 'text-red-400'}>Spine {bookDraft.coverDesign?.spine ? '✓' : '✗'}</span>
                    <span className="text-white/20">•</span>
                    <span className={bookDraft.coverDesign?.back ? 'text-emerald-400' : 'text-red-400'}>Back {bookDraft.coverDesign?.back ? '✓' : '✗'}</span>
                    <span className="text-white/20">•</span>
                    <span className={bookDraft.coverDesign?.accentColor ? 'text-emerald-400' : 'text-red-400'}>Accent {bookDraft.coverDesign?.accentColor ? '✓' : '✗'}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Front Cover */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm flex items-center gap-1.5">
                          <span>Front Cover *</span>
                          {bookDraft.coverDesign?.front && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </p>
                        <p className="text-xs text-white/40">Main artwork and typography (upload or URL)</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => generateCoverPart('front')}
                        className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors text-amber-500 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>AI Gen</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Image URL or upload below..."
                      value={bookDraft.coverDesign?.front || ''}
                      onChange={e => setBookDraft({...bookDraft, coverDesign: {...bookDraft.coverDesign!, front: e.target.value}})}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-500 outline-none font-mono"
                    />
                  </div>

                  {/* Spine Design (Mandatory) */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm flex items-center gap-1.5">
                          <span>Spine Design *</span>
                          {bookDraft.coverDesign?.spine && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </p>
                        <p className="text-xs text-white/40">Spine banner texture, title stamp, or custom art</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => generateCoverPart('spine')}
                        className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors text-amber-500 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>AI Gen</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Spine image URL or custom texture..."
                      value={bookDraft.coverDesign?.spine || ''}
                      onChange={e => setBookDraft({...bookDraft, coverDesign: {...bookDraft.coverDesign!, spine: e.target.value}})}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-500 outline-none font-mono"
                    />
                  </div>
                  
                  {/* Back Cover */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm flex items-center gap-1.5">
                          <span>Back Cover *</span>
                          {bookDraft.coverDesign?.back && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </p>
                        <p className="text-xs text-white/40">Synopsis, barcode and back artwork</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => generateCoverPart('back')}
                        className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors text-amber-500 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>AI Gen</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Back cover image URL..."
                      value={bookDraft.coverDesign?.back || ''}
                      onChange={e => setBookDraft({...bookDraft, coverDesign: {...bookDraft.coverDesign!, back: e.target.value}})}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-500 outline-none font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Binding Style</label>
                      <select 
                        value={bookDraft.coverDesign?.style}
                        onChange={e => setBookDraft({...bookDraft, coverDesign: {...bookDraft.coverDesign!, style: e.target.value as any}})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 outline-none"
                      >
                        <option value="classic">Classic</option>
                        <option value="leather">Premium Leather</option>
                        <option value="modern">Modern Canvas</option>
                        <option value="minimal">Minimalist</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Accent Color</label>
                      <input 
                        type="color"
                        value={bookDraft.coverDesign?.accentColor}
                        onChange={e => setBookDraft({...bookDraft, coverDesign: {...bookDraft.coverDesign!, accentColor: e.target.value}})}
                        className="w-full h-10 bg-transparent rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Price ($)</label>
                      <input 
                        type="number"
                        placeholder="0.00"
                        value={bookDraft.price || ''}
                        onChange={e => setBookDraft({...bookDraft, price: parseFloat(e.target.value)})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Payment QR Code</label>
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) setQrCodeFile(f);
                        }}
                        className="w-full text-xs text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-500 hover:file:bg-amber-500/20"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={onCancel}
                  className="flex-1 px-6 py-3 border border-white/10 rounded-xl hover:bg-white/5 transition-all"
                >
                  Discard
                </button>
                <button 
                  onClick={handlePublish}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20"
                >
                  <ArrowRight className="w-5 h-5" />
                  Publish to Shelf
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center bg-black/40 rounded-3xl p-12 border border-white/5 overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent pointer-events-none" />
               
               <div className="relative z-10 perspective-[1000px]">
                  <motion.div 
                    initial={{ rotateY: -20 }}
                    animate={{ rotateY: 10 }}
                    transition={{ repeat: Infinity, duration: 8, repeatType: 'reverse', ease: 'easeInOut' }}
                    className="w-[280px] h-[400px] relative shadow-2xl preserve-3d"
                  >
                    <div 
                      className="absolute left-0 top-0 h-full w-[40px] origin-left -rotate-y-90 translate-z-0 border-r border-black/20"
                      style={{ backgroundColor: bookDraft.coverDesign?.accentColor }}
                    >
                      {bookDraft.coverDesign?.spine && (
                        <img src={bookDraft.coverDesign.spine} className="w-full h-full object-cover" />
                      )}
                    </div>

                    <div 
                      className="absolute inset-0 w-full h-full rounded-r-sm overflow-hidden"
                      style={{ 
                        backgroundColor: bookDraft.coverDesign?.accentColor,
                        backgroundImage: bookDraft.coverDesign?.style === 'leather' 
                          ? 'url("https://www.transparenttextures.com/patterns/leather.png")'
                          : 'none',
                        boxShadow: 'inset 4px 0 10px rgba(255,255,255,0.1)'
                      }}
                    >
                      {bookDraft.coverDesign?.front && (
                        <img src={bookDraft.coverDesign.front} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60" />
                      )}
                      
                      <div className="relative h-full flex flex-col items-center justify-between p-8 text-center">
                        <div className="space-y-2">
                           <div className="w-12 h-[1px] bg-white/40 mx-auto" />
                           <h4 className="text-xl font-serif font-bold text-amber-100">{bookDraft.title || 'Untitled'}</h4>
                           <div className="w-12 h-[1px] bg-white/40 mx-auto" />
                        </div>
                        
                        <p className="text-sm font-medium tracking-widest uppercase text-white/70">{bookDraft.author || 'Anonymous'}</p>
                        
                        <div className="w-full space-y-4">
                           <div className="text-[10px] uppercase tracking-tighter opacity-40">Axiometic WRI Publisher</div>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-black/20 pointer-events-none" />
                    </div>
                  </motion.div>
               </div>
            </div>
          </motion.div>
        )}

        {step === 'publishing' && (
          <motion.div 
            key="publishing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="relative">
              <Loader2 className="w-20 h-20 text-green-500 animate-spin mb-8" />
              <Check className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Publishing Manuscript...</h2>
            <p className="text-white/40">Adding "{bookDraft.title}" to the Axiometic Global Library.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
