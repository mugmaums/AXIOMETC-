import React, { useState } from 'react';
import { X, Send, Sparkles, Paperclip } from 'lucide-react';
import type { EmailMessage, XioUserProfile } from './types';

interface ComposeModalProps {
  userProfile: XioUserProfile;
  onClose: () => void;
  onSend: (msg: Omit<EmailMessage, 'id' | 'timestamp' | 'isRead'>) => void;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({ userProfile, onClose, onSend }) => {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !subject.trim()) return;

    const formattedRecipient = recipient.includes('@axiometic') ? recipient : `${recipient.trim()}@axiometic`;
    onSend({
      senderName: userProfile.displayName,
      senderEmail: userProfile.axiometicId,
      recipientEmail: formattedRecipient,
      subject: subject.trim(),
      body: body.trim(),
      isStarred: false,
      folder: 'sent',
      labels: ['Outgoing']
    });
    onClose();
  };

  const handleAiSmartCompose = async () => {
    if (isAiGenerating) return;
    setIsAiGenerating(true);

    try {
      const prompt = `Write an eloquent, formal, and concise email message for the subject: "${subject || 'Project Update'}".
      Sender: ${userProfile.displayName} (${userProfile.axiometicId})
      Recipient: ${recipient || 'Colleague'}
      Return only the email body text.`;

      const res = await fetch('/api/axio/analyze-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'xio://compose', title: subject, content: prompt, userPrompt: 'Compose email body' })
      });
      const data = await res.json();
      if (data.answer) {
        setBody(data.answer);
      }
    } catch {
      setBody('Greetings,\n\nWriting to share the latest updates regarding our ongoing initiatives and verified network nodes.\n\nBest regards,\n' + userProfile.displayName);
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    <div className="fixed bottom-0 right-4 sm:right-10 z-50 w-full sm:w-[580px] bg-mahogany-950 border-2 border-gold-accent/40 rounded-t-2xl shadow-2xl overflow-hidden flex flex-col text-ivory font-serif brass-border animate-in slide-in-from-bottom-6">
      {/* Compose Header in Polished Wood & Brass */}
      <div className="px-5 py-3 bg-gradient-to-r from-mahogany-900 to-mahogany-950 border-b border-gold-accent/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-gold-accent uppercase tracking-widest font-mono">
            Compose XIO Dispatch
          </span>
          <span className="text-[10px] text-ivory/50 font-mono">({userProfile.axiometicId})</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gold-accent/20 text-gold-accent/70 hover:text-gold-accent transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Compose Form */}
      <form onSubmit={handleSend} className="flex flex-col flex-1">
        <div className="px-5 py-2.5 border-b border-gold-accent/20 flex items-center gap-2 text-xs bg-mahogany-900/40">
          <span className="text-gold-accent/80 font-mono w-16">To:</span>
          <input
            type="text"
            required
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="handle@axiometic"
            className="flex-1 bg-transparent text-ivory placeholder-ivory/30 focus:outline-none font-mono text-xs"
          />
        </div>

        <div className="px-5 py-2.5 border-b border-gold-accent/20 flex items-center gap-2 text-xs bg-mahogany-900/40">
          <span className="text-gold-accent/80 font-mono w-16">Subject:</span>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject of transmission"
            className="flex-1 bg-transparent text-ivory placeholder-ivory/30 focus:outline-none font-serif text-sm font-bold"
          />
        </div>

        <div className="p-5 flex-1 min-h-[220px] flex flex-col bg-mahogany-950/90">
          <textarea
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Inscribe your message here..."
            className="w-full flex-1 bg-transparent text-xs sm:text-sm text-ivory placeholder-ivory/30 focus:outline-none resize-none leading-relaxed font-serif"
          />
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-mahogany-900 border-t border-gold-accent/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-gold-accent hover:bg-gold-accent/90 text-mahogany-950 text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer transition-all border border-gold-accent"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch</span>
            </button>
            <button
              type="button"
              onClick={handleAiSmartCompose}
              disabled={isAiGenerating}
              className="px-4 py-2 rounded-xl bg-mahogany-950 hover:bg-gold-accent/15 border border-gold-accent/40 text-gold-accent text-xs font-bold font-serif flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>{isAiGenerating ? 'Drafting...' : 'AI Compose'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => alert('Attachment secured in vault.')}
            className="p-2 text-gold-accent/60 hover:text-gold-accent rounded-lg hover:bg-gold-accent/10 cursor-pointer"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
