import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, RefreshCw } from 'lucide-react';
import type { AxioTab } from './types';

interface AxioAiSidebarProps {
  activeTab: AxioTab;
  onClose: () => void;
  onNavigateUrl: (url: string) => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AxioAiSidebar: React.FC<AxioAiSidebarProps> = ({
  activeTab,
  onClose,
  onNavigateUrl,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Greetings. I am **AXIO Copilot**, powered by Gemini 3.8 Flash. I have loaded **"${activeTab.title}"**. How may I synthesize or cross-reference this page with your AXIOMETIC Vault?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isAnalyzing) return;

    const userText = inputVal.trim();
    setInputVal('');
    const newMsgId = `msg_${Date.now()}`;
    
    setMessages(prev => [
      ...prev,
      { id: newMsgId, sender: 'user', text: userText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);

    setIsAnalyzing(true);

    try {
      const res = await fetch('/api/axio/analyze-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: activeTab.url,
          title: activeTab.title,
          content: activeTab.content || activeTab.searchData?.aiOverview?.summary || '',
          userPrompt: userText
        })
      });
      const data = await res.json();

      setMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: data.answer || 'Analysis complete.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: 'Encountered network issue communicating with AXIO neural gateway.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuickAction = async (promptText: string) => {
    setInputVal(promptText);
  };

  return (
    <div className="w-80 sm:w-96 bg-mahogany-950 border-l-2 border-gold-accent/40 flex flex-col h-full z-20 text-ivory shadow-2xl animate-in slide-in-from-right-4 brass-border font-serif">
      {/* Sidebar Header in Mahogany & Brass */}
      <div className="px-4 py-3 bg-mahogany-900 border-b border-gold-accent/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-gold-accent/20 border border-gold-accent/50 text-gold-accent">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-gold-accent">AXIO AI Copilot</h3>
            <span className="text-[10px] text-ivory/50 font-mono">Gemini 3.8 Flash Neural Engine</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gold-accent/20 text-gold-accent/70 hover:text-gold-accent transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Prompt Pills in Brass */}
      <div className="p-3 bg-mahogany-900/60 border-b border-gold-accent/20 flex flex-wrap gap-1.5">
        {[
          'Summarize page in 3 bullets',
          'Extract key data points',
          'Cross-reference with Vault',
        ].map((action, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickAction(action)}
            className="text-[11px] px-2.5 py-1 rounded-xl bg-mahogany-950/80 hover:bg-gold-accent hover:text-mahogany-950 text-ivory/80 border border-gold-accent/25 transition-all cursor-pointer font-serif"
          >
            {action}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-serif">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border border-gold-accent/40 shadow-sm ${
              msg.sender === 'ai' ? 'bg-gold-accent text-mahogany-950 font-black' : 'bg-mahogany-800 text-gold-accent'
            }`}>
              {msg.sender === 'ai' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            </div>
            <div className={`max-w-[85%] p-3.5 rounded-2xl shadow-md leading-relaxed whitespace-pre-wrap ${
              msg.sender === 'ai'
                ? 'bg-mahogany-900/90 border border-gold-accent/30 text-ivory rounded-tl-sm'
                : 'bg-gold-accent text-mahogany-950 font-semibold rounded-tr-sm'
            }`}>
              <div>{msg.text}</div>
              <div className={`text-[9px] mt-1.5 text-right font-mono ${msg.sender === 'ai' ? 'text-gold-accent/60' : 'text-mahogany-950/60'}`}>
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isAnalyzing && (
          <div className="flex items-center gap-2 text-gold-accent text-xs p-2 font-mono">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Synthesizing knowledge nodes...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="p-3 bg-mahogany-900 border-t border-gold-accent/30 flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask AI Copilot about this page..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="flex-1 bg-mahogany-950 border border-gold-accent/30 rounded-xl px-4 py-2 text-xs text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold-accent font-serif"
        />
        <button
          type="submit"
          disabled={!inputVal.trim() || isAnalyzing}
          className={`p-2 rounded-xl transition-all ${
            inputVal.trim() && !isAnalyzing
              ? 'bg-gold-accent hover:bg-gold-accent/90 text-mahogany-950 cursor-pointer shadow-md'
              : 'bg-mahogany-800 text-ivory/30 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
