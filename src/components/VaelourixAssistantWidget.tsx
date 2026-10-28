import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  X,
  Minimize2,
  Loader2,
  CheckCircle2,
  Zap,
  Mic,
  MicOff,
  Upload,
  FileText,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AxiometicBubbleGraphic, AxiometicLogo } from './AxiometicBubbleGraphic';
import { CreationPreviewCard } from './CreationPreviewCard';

interface ChatMessage {
  id: string;
  sender: 'user' | 'vaelourix';
  text: string;
  actionTaken?: string;
  blockCreated?: any;
  timestamp: string;
}

interface VaelourixAssistantWidgetProps {
  onExecuteAction: (
    prompt: string,
    password?: string,
    fileData?: string | File,
    fileName?: string,
    fileType?: string,
    publish?: boolean
  ) => Promise<{ success: boolean; reply: string; block?: any; requiresAuth?: boolean }>;
  onPublishBlock: (block: any) => Promise<boolean>;
  isDeveloper: boolean;
}

export const VaelourixAssistantWidget: React.FC<VaelourixAssistantWidgetProps> = ({
  onExecuteAction,
  onPublishBlock,
  isDeveloper,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<{ prompt: string; fileData?: string | File; fileName?: string; fileType?: string } | null>(null);
  const [authPasswordInput, setAuthPasswordInput] = useState('');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      sender: 'vaelourix',
      text: 'Greetings. I am vaelourix, your embedded AXIOMETIC AI client. Upload images, videos, audio, PDFs, or code files, and tell me what action to take. Creations appear first as previews in chat before you publish them to the live canvas.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Web Speech API is not supported in this browser. Please use Google Chrome.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error('Speech recognition start error:', e);
      setIsListening(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const executePromptWithPassword = async (
    promptToRun: string,
    fileDataToUpload?: string | File | null,
    fileNameToUpload?: string | null,
    fileTypeToUpload?: string | null,
    password?: string
  ) => {
    setIsLoading(true);
    try {
      const result = await onExecuteAction(
        promptToRun,
        password,
        fileDataToUpload || undefined,
        fileNameToUpload || undefined,
        fileTypeToUpload || undefined,
        false // preview mode first
      );

      if (result.requiresAuth) {
        setIsLoading(false);
        setPendingPrompt({ prompt: promptToRun, fileData: fileDataToUpload || undefined, fileName: fileNameToUpload || undefined, fileType: fileTypeToUpload || undefined });
        setShowAuthModal(true);
        const authMsg: ChatMessage = {
          id: `auth_${Date.now()}`,
          sender: 'vaelourix',
          text: 'This action modifies canvas contents and requires your developer password. Please enter it securely below.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, authMsg]);
        return;
      }

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'vaelourix',
        text: result.reply || 'Action completed successfully.',
        actionTaken: result.block ? `Generated preview: "${result.block.title || 'Creation'}"` : undefined,
        blockCreated: result.block,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'vaelourix',
        text: `Action notice: ${err.message || 'Complete.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !fileData && !rawFile) return;
    if (isLoading) return;

    const userPrompt = input.trim() || 'Analyze attached media and provide creation preview.';
    const fileToUpload = rawFile || fileData;
    const nameToUpload = fileName;
    const typeToUpload = fileType;

    setInput('');
    setRawFile(null);
    setFileData(null);
    setFileName(null);
    setFileType(null);

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: userPrompt + (nameToUpload ? ` [Attached: ${nameToUpload}]` : ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    await executePromptWithPassword(userPrompt, fileToUpload, nameToUpload, typeToUpload);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="bubble"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 pl-2.5 pr-4 py-2.5 bg-mahogany-900/95 hover:bg-mahogany-800 text-ivory font-medium text-xs rounded-xl shadow-2xl shadow-black/60 border border-gold-accent/30 backdrop-blur-xl transition-all duration-200 hover:scale-[1.05] active:scale-[0.95] pointer-events-auto"
            title="Open vaelourix AXIOMETIC AI Client"
          >
            <AxiometicBubbleGraphic size="sm" isAnimated={true} showHalo={true} />
            <div className="flex flex-col text-left">
              <span className="font-bold text-ivory tracking-wide flex items-center gap-1.5">
                <span>vaelourix</span>
                <span className="w-1.5 h-1.5 rounded-full bg-gold-accent animate-pulse" />
              </span>
              <span className="text-[10px] text-gold-accent/70 font-mono uppercase tracking-widest">Architect</span>
            </div>
          </motion.button>
        ) : (
          <motion.div 
            key="widget"
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className="relative w-[360px] sm:w-[440px] max-w-[calc(100vw-32px)] h-[600px] bg-mahogany-950/98 border border-gold-accent/30 rounded-2xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden text-ivory pointer-events-auto backdrop-blur-2xl"
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />
            
            {showAuthModal && (
              <div className="absolute inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-mahogany-900 border border-gold-accent/40 rounded-xl p-6 w-full max-w-sm text-ivory shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gold-accent/20" />
                  <h4 className="text-sm font-bold text-gold-accent mb-1 uppercase tracking-[0.2em]">Access Authorization</h4>
                  <p className="text-[10px] text-ivory/50 mb-6 leading-relaxed italic font-serif">
                    Critical canvas modification requested. Security credentials required.
                  </p>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!authPasswordInput.trim()) return;
                    const pw = authPasswordInput.trim();
                    setAuthPasswordInput('');
                    setShowAuthModal(false);
                    const p = pendingPrompt;
                    setPendingPrompt(null);
                    if (p) {
                      await executePromptWithPassword(p.prompt, p.fileData, p.fileName, p.fileType, pw);
                    }
                  }} className="space-y-4">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gold-accent/40" />
                      <input
                        type="password"
                        value={authPasswordInput}
                        onChange={(e) => setAuthPasswordInput(e.target.value)}
                        placeholder="SECURITY KEY"
                        className="w-full pl-10 pr-4 py-3 bg-black/60 border border-gold-accent/20 rounded-lg text-xs text-gold-accent focus:outline-none focus:border-gold-accent font-mono tracking-widest placeholder:text-gold-accent/20"
                        autoFocus
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAuthModal(false)}
                        className="px-4 py-2 text-[10px] font-bold text-ivory/40 hover:text-ivory uppercase tracking-widest transition-colors"
                      >
                        Abort
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 text-[10px] font-black text-mahogany-950 bg-gold-accent hover:bg-gold-accent/90 rounded-lg shadow-lg uppercase tracking-widest active:scale-95 transition-all"
                      >
                        Authorize
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}

            <div className="p-4 bg-mahogany-900/90 border-b border-gold-accent/30 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <AxiometicBubbleGraphic size="sm" isAnimated={true} showHalo={true} />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-[11px] font-black text-ivory tracking-[0.1em] uppercase">vaelourix</h4>
                    <span className="text-[8px] font-mono text-gold-accent px-2 py-0.5 rounded bg-black/40 border border-gold-accent/20">
                      ASTRA-01
                    </span>
                  </div>
                  <p className="text-[9px] text-gold-accent/40 uppercase tracking-widest font-mono">System Architect</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-ivory/30 hover:text-gold-accent rounded-lg hover:bg-white/5 transition-all"
                  title="Minimize"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-ivory/30 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-5 font-serif text-xs custom-scrollbar relative z-10">
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.sender === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl leading-relaxed whitespace-pre-line shadow-xl border ${
                      msg.sender === 'user'
                        ? 'bg-gold-accent text-mahogany-950 border-gold-accent/50 rounded-tr-none font-bold'
                        : 'bg-mahogany-900/80 border-gold-accent/20 text-ivory/90 rounded-tl-none'
                    }`}
                  >
                    <p className="text-[11px] sm:text-xs">{msg.text}</p>
                    {msg.blockCreated && (
                      <div className="mt-5">
                        <CreationPreviewCard
                          block={msg.blockCreated}
                          onPublish={onPublishBlock}
                        />
                      </div>
                    )}
                    {msg.actionTaken && !msg.blockCreated && (
                      <div className="mt-3 pt-3 border-t border-gold-accent/20 flex items-center gap-2 text-[9px] text-gold-accent/70 font-mono uppercase tracking-[0.2em]">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{msg.actionTaken}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[8px] text-ivory/20 mt-2 px-1 uppercase tracking-[0.2em] font-mono">{msg.timestamp}</span>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-3 p-4 bg-mahogany-900/60 border border-gold-accent/20 rounded-xl text-gold-accent/60 text-[10px] uppercase tracking-widest font-mono w-fit animate-pulse">
                  <div className="flex gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-gold-accent animate-bounce" />
                     <div className="w-1.5 h-1.5 rounded-full bg-gold-accent animate-bounce [animation-delay:0.2s]" />
                     <div className="w-1.5 h-1.5 rounded-full bg-gold-accent animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span>Architecting</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Attached File Preview Tray */}
            <AnimatePresence>
              {fileData && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 py-3 bg-black/40 border-t border-gold-accent/20 flex items-center justify-between text-[10px]"
                >
                  <div className="flex items-center gap-3 truncate text-gold-accent">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span className="truncate font-mono uppercase tracking-[0.1em]">{fileName || 'SECURED OBJECT'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setFileData(null); setFileName(null); setFileType(null); }}
                    className="text-ivory/30 hover:text-red-400 p-1.5 transition-colors"
                    title="Remove"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="px-4 py-2.5 bg-black/30 border-t border-gold-accent/10 flex items-center gap-2 overflow-x-auto no-scrollbar relative z-10">
              {['AI Picture', 'Research', 'Counter', 'System Map'].map(tag => (
                <button
                  key={tag}
                  onClick={() => handleQuickPrompt(`Create a ${tag.toLowerCase()}`)}
                  className="px-3 py-1.5 bg-mahogany-900/80 hover:bg-gold-accent hover:text-mahogany-950 border border-gold-accent/20 text-[9px] font-black text-ivory/50 rounded-lg transition-all uppercase tracking-[0.2em] whitespace-nowrap active:scale-95"
                >
                  {tag}
                </button>
              ))}
            </div>

            <form onSubmit={handleSend} className="p-4 bg-mahogany-900/95 border-t border-gold-accent/30 flex items-center gap-3 relative z-10">
              <input
                type="file"
                accept="image/*,video/*,audio/*,application/pdf,.ts,.tsx,.js,.jsx,.json,.py,.csv,.md,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setRawFile(file);
                    setFileName(file.name);
                    setFileType(file.type);
                    const reader = new FileReader();
                    reader.onloadend = () => setFileData(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
                id="vaelourix-file-upload"
              />
              <label
                htmlFor="vaelourix-file-upload"
                className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
                  fileData
                    ? 'bg-gold-accent text-mahogany-950 border-gold-accent shadow-lg'
                    : 'bg-black/40 text-ivory/30 hover:text-gold-accent hover:bg-black/60 border-gold-accent/20'
                }`}
                title="Attach media"
              >
                <Upload className="w-4 h-4" />
              </label>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isListening ? 'LISTENING...' : 'SPEAK OR TYPE COMMAND...'}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 bg-black/60 border rounded-xl text-xs text-ivory placeholder-ivory/10 focus:outline-none focus:ring-1 font-serif transition-all ${
                    isListening ? 'border-red-500 ring-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-gold-accent/20 focus:ring-gold-accent/20 focus:border-gold-accent/50'
                  }`}
                />
              </div>
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition-all border ${
                  isListening
                    ? 'bg-red-600 text-white border-red-500 animate-pulse'
                    : 'bg-black/40 text-ivory/30 hover:text-gold-accent hover:bg-black/60 border-gold-accent/20'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && !fileData)}
                className="p-3 bg-gold-accent hover:bg-gold-accent/90 disabled:opacity-20 text-mahogany-950 rounded-xl transition-all shadow-xl active:scale-90"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
