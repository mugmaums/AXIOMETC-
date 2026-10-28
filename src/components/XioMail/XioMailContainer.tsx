import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Inbox, 
  Send, 
  FileText, 
  Star, 
  Trash2, 
  AlertOctagon, 
  Plus, 
  Search, 
  Reply, 
  ShieldCheck, 
  ArrowLeft,
  RotateCcw
} from 'lucide-react';
import { IdSetupModal } from './IdSetupModal';
import { ComposeModal } from './ComposeModal';
import type { EmailMessage, XioUserProfile } from './types';
import { auth } from '../../firebase';

// Helper to filter out mock emails
const isMockEmail = (m: any): boolean => {
  if (!m) return true;
  const id = String(m.id || '');
  const sender = String(m.senderEmail || '').toLowerCase();
  const recipient = String(m.recipientEmail || '').toLowerCase();
  return (
    id === 'mail_1' ||
    id === 'mail_2' ||
    id === 'mail_3' ||
    sender === 'system@axiometic' ||
    sender === 'vault@axiometic' ||
    sender === 'research@axiometic' ||
    recipient === 'architect@axiometic'
  );
};

export const XioMailContainer: React.FC = () => {
  // Auto-configure user profile from authenticated session
  const [userProfile, setUserProfile] = useState<XioUserProfile>(() => {
    const user = auth.currentUser;
    const email = user?.email || 'mugmaums@gmail.com';
    const rawHandle = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_.-]/g, '');
    const axiometicId = `${rawHandle || 'user'}@axiometic`;

    try {
      const cached = localStorage.getItem('axiometic_xio_profile');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.axiometicId !== 'architect@axiometic') {
          return parsed;
        }
      }
    } catch {}

    return {
      axiometicId,
      displayName: user?.displayName || rawHandle || 'Scholar',
      avatarUrl: user?.photoURL || ''
    };
  });

  const [showIdSetup, setShowIdSetup] = useState(false);

  // Initialize emails from local storage, strictly filtering out any mock emails
  const [emails, setEmails] = useState<EmailMessage[]>(() => {
    try {
      const saved = localStorage.getItem('axiometic_xio_emails');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const authentic = parsed.filter(m => !isMockEmail(m));
          if (authentic.length !== parsed.length) {
            localStorage.setItem('axiometic_xio_emails', JSON.stringify(authentic));
          }
          return authentic;
        }
      }
    } catch {}
    return [];
  });

  const [currentFolder, setCurrentFolder] = useState<'inbox' | 'sent' | 'drafts' | 'starred' | 'spam' | 'trash'>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Sync profile when Firebase auth updates
  useEffect(() => {
    if (auth.currentUser) {
      const user = auth.currentUser;
      const email = user.email || 'mugmaums@gmail.com';
      const rawHandle = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_.-]/g, '');
      const axiometicId = `${rawHandle || 'user'}@axiometic`;

      setUserProfile(prev => {
        const updated: XioUserProfile = {
          axiometicId: prev.axiometicId.includes('architect@') ? axiometicId : prev.axiometicId,
          displayName: user.displayName || prev.displayName,
          avatarUrl: user.photoURL || prev.avatarUrl
        };
        try {
          localStorage.setItem('axiometic_xio_profile', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  }, [auth.currentUser]);

  // Persist emails helper
  const persistEmails = (updatedList: EmailMessage[]) => {
    setEmails(updatedList);
    try {
      localStorage.setItem('axiometic_xio_emails', JSON.stringify(updatedList));
    } catch {}
  };

  const filteredEmails = emails.filter(m => {
    const matchesSearch = searchQuery === '' || 
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.body.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (currentFolder === 'starred') return m.isStarred;
    return m.folder === currentFolder;
  });

  const unreadInboxCount = emails.filter(m => m.folder === 'inbox' && !m.isRead).length;

  const handleSendEmail = (newMsg: Omit<EmailMessage, 'id' | 'timestamp' | 'isRead'>) => {
    const created: EmailMessage = {
      ...newMsg,
      id: `mail_${Date.now()}`,
      timestamp: 'Just now',
      isRead: true,
    };
    const nextList = [created, ...emails];
    persistEmails(nextList);

    setStatusNotification(`Transmission dispatched to ${newMsg.recipientEmail}`);
    setTimeout(() => setStatusNotification(null), 4000);
  };

  const handleSelectEmail = (msg: EmailMessage) => {
    setSelectedEmail(msg);
    if (!msg.isRead) {
      const nextList = emails.map(m => m.id === msg.id ? { ...m, isRead: true } : m);
      persistEmails(nextList);
    }
  };

  const handleToggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextList = emails.map(m => m.id === id ? { ...m, isStarred: !m.isStarred } : m);
    persistEmails(nextList);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextList = emails.map(m => m.id === id ? { ...m, folder: 'trash' as const } : m);
    persistEmails(nextList);
    if (selectedEmail?.id === id) setSelectedEmail(null);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim() || !selectedEmail || !userProfile) return;

    const replyMsg: EmailMessage = {
      id: `mail_${Date.now()}`,
      senderName: userProfile.displayName,
      senderEmail: userProfile.axiometicId,
      recipientEmail: selectedEmail.senderEmail,
      subject: `Re: ${selectedEmail.subject}`,
      body: replyBody.trim(),
      timestamp: 'Just now',
      isRead: true,
      isStarred: false,
      folder: 'sent'
    };

    const nextList = [replyMsg, ...emails];
    persistEmails(nextList);
    setReplyBody('');

    setStatusNotification(`Reply transmitted to ${selectedEmail.senderEmail}`);
    setTimeout(() => setStatusNotification(null), 4000);
  };

  const handleClearMailbox = () => {
    persistEmails([]);
    setSelectedEmail(null);
    setStatusNotification('Mailbox has been cleared to pristine default state.');
    setTimeout(() => setStatusNotification(null), 4000);
  };

  return (
    <div 
      className="fixed inset-0 top-12 z-50 flex flex-col h-[calc(100vh-3rem)] w-full select-none overflow-hidden font-serif text-ivory"
      style={{
        backgroundImage: 'url("/src/assets/images/mahogany_wood_texture_1792941904763.jpg")',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-mahogany-950/80 pointer-events-none z-0" />

      {/* Notification Toast */}
      {statusNotification && (
        <div className="bg-gold-accent text-mahogany-950 px-4 py-2 text-center text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg z-30 animate-in slide-in-from-top">
          <ShieldCheck className="w-4 h-4 text-emerald-950" />
          <span>{statusNotification}</span>
        </div>
      )}

      {showIdSetup && (
        <IdSetupModal 
          initialProfile={userProfile}
          onComplete={(prof) => { 
            setUserProfile(prof); 
            setShowIdSetup(false);
            try {
              localStorage.setItem('axiometic_xio_profile', JSON.stringify(prof));
            } catch {}
          }} 
        />
      )}

      {/* XIO Mail Top Bar in Deep Mahogany & Brass */}
      <header className="h-14 bg-mahogany-950/95 border-b border-gold-accent/35 px-4 flex items-center justify-between gap-4 shadow-xl z-20 brass-border-sm relative">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gold-accent text-mahogany-950 flex items-center justify-center font-black text-lg shadow-md border border-gold-accent">
              X
            </div>
            <span className="text-lg font-black tracking-tight text-gold-accent font-serif drop-shadow-sm">
              XIO MAIL <span className="text-xs font-mono text-ivory/60">(@axiometic)</span>
            </span>
          </div>
        </div>

        {/* Recessed Mahogany Search Well */}
        <div className="flex-1 max-w-2xl relative">
          <div className="flex items-center h-10 px-4 rounded-xl bg-mahogany-900/90 border border-gold-accent/30 focus-within:border-gold-accent focus-within:bg-mahogany-900 focus-within:shadow-lg transition-all shadow-inner">
            <Search className="w-4 h-4 text-gold-accent/60 mr-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search XIO letterbox..."
              className="w-full bg-transparent text-xs sm:text-sm text-ivory placeholder-ivory/30 focus:outline-none font-serif"
            />
          </div>
        </div>

        {/* User Profile / ID */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowIdSetup(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gold-accent/15 border border-gold-accent/40 text-gold-accent text-xs font-bold font-mono hover:bg-gold-accent/25 transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
            title="Configure AXIOMETIC Handle"
          >
            <span>{userProfile.axiometicId}</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-accent to-amber-700 text-mahogany-950 flex items-center justify-center font-black text-xs shadow-md border border-gold-accent/50">
            {userProfile.displayName ? userProfile.displayName[0].toUpperCase() : 'S'}
          </div>
        </div>
      </header>

      {/* Main Mail Layout */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left Sidebar Paneling */}
        <aside className="w-64 bg-mahogany-950/90 border-r border-gold-accent/30 p-3 flex flex-col gap-2 shrink-0 brass-border-sm">
          <button
            onClick={() => setIsComposeOpen(true)}
            className="flex items-center gap-3 px-6 py-3.5 rounded-xl bg-gold-accent hover:bg-gold-accent/90 text-mahogany-950 font-black text-xs uppercase tracking-wider shadow-xl transition-all cursor-pointer mb-2 border border-gold-accent"
          >
            <Plus className="w-4 h-4" />
            <span>Compose Letter</span>
          </button>

          <nav className="space-y-1 text-xs font-bold font-serif">
            {[
              { id: 'inbox', label: 'Inbox', icon: Inbox, count: unreadInboxCount },
              { id: 'starred', label: 'Starred', icon: Star, count: 0 },
              { id: 'sent', label: 'Sent', icon: Send, count: 0 },
              { id: 'drafts', label: 'Drafts', icon: FileText, count: 0 },
              { id: 'spam', label: 'Spam', icon: AlertOctagon, count: 0 },
              { id: 'trash', label: 'Trash', icon: Trash2, count: 0 },
            ].map(item => {
              const Icon = item.icon;
              const isActive = currentFolder === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setCurrentFolder(item.id as any); setSelectedEmail(null); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-colors cursor-pointer ${
                    isActive 
                      ? 'bg-gold-accent/20 text-gold-accent font-black border border-gold-accent/40 shadow-sm' 
                      : 'text-ivory/70 hover:bg-gold-accent/10 hover:text-gold-accent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-gold-accent" />
                    <span>{item.label}</span>
                  </div>
                  {item.count > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-gold-accent text-mahogany-950 text-[10px] font-mono font-black">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto space-y-2">
            <button
              onClick={handleClearMailbox}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-mono text-red-400/80 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer border border-red-500/20"
              title="Clear all private mail records"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Mailbox to Empty</span>
            </button>

            <div className="p-3 rounded-xl bg-mahogany-900 border border-gold-accent/25 text-[11px] text-ivory/80 brass-border-sm">
              <div className="font-bold text-gold-accent flex items-center gap-1.5 mb-1 font-serif">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Decentralized Ledger</span>
              </div>
              <span className="font-serif italic text-ivory/60">Transmitted securely via @axiometic nodes.</span>
            </div>
          </div>
        </aside>

        {/* Center / Email List or Detail View on Carved Wood Surface */}
        <main className="flex-1 flex flex-col bg-mahogany-900/80 overflow-hidden">
          {selectedEmail ? (
            /* Email Detail View on Antique Writing Surface */
            <div className="flex-1 flex flex-col overflow-y-auto p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gold-accent/25">
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="flex items-center gap-2 text-xs font-bold text-gold-accent hover:underline cursor-pointer uppercase tracking-wider font-serif"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to {currentFolder}</span>
                </button>
                <div className="flex items-center gap-2 text-gold-accent/70 text-xs font-mono">
                  <span>{selectedEmail.timestamp}</span>
                </div>
              </div>

              <div className="space-y-3 bg-mahogany-950/90 border border-gold-accent/35 rounded-2xl p-6 shadow-2xl brass-border">
                <h2 className="text-xl sm:text-2xl font-bold text-gold-accent">
                  {selectedEmail.subject}
                </h2>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-10 h-10 rounded-xl bg-gold-accent text-mahogany-950 flex items-center justify-center font-black text-sm shadow-md">
                    {selectedEmail.senderName ? selectedEmail.senderName[0].toUpperCase() : 'M'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-ivory flex items-center gap-2">
                      <span>{selectedEmail.senderName}</span>
                      <span className="text-xs text-gold-accent font-mono font-normal">&lt;{selectedEmail.senderEmail}&gt;</span>
                    </div>
                    <div className="text-xs text-ivory/50">to {selectedEmail.recipientEmail}</div>
                  </div>
                </div>

                <div className="py-6 text-sm text-ivory/90 leading-relaxed whitespace-pre-wrap border-y border-gold-accent/20">
                  {selectedEmail.body}
                </div>

                {/* Reply Box in Inset Wood Slot */}
                <form onSubmit={handleSendReply} className="space-y-3 pt-4">
                  <textarea
                    rows={4}
                    required
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder={`Compose reply to ${selectedEmail.senderName} (${selectedEmail.senderEmail})...`}
                    className="w-full p-4 rounded-xl bg-mahogany-900 border border-gold-accent/30 text-xs sm:text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold-accent resize-none font-serif leading-relaxed"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gold-accent hover:bg-gold-accent/90 text-mahogany-950 text-xs font-black shadow-lg flex items-center gap-2 cursor-pointer transition-all uppercase tracking-wider"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span>Send Reply</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* Email List View */
            <div className="flex-1 flex flex-col overflow-y-auto">
              <div className="px-4 py-2.5 bg-mahogany-950 border-b border-gold-accent/20 flex items-center justify-between text-xs text-gold-accent/80 font-mono">
                <span>{filteredEmails.length} messages in {currentFolder}</span>
                <span>XIO PROTOCOL ACTIVE</span>
              </div>

              {filteredEmails.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-ivory/40 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gold-accent/10 border border-gold-accent/25 flex items-center justify-center text-gold-accent shadow-inner">
                    <Mail className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gold-accent uppercase tracking-wider">
                      No letters in {currentFolder}
                    </h3>
                    <p className="text-xs text-ivory/60 font-serif italic mt-1 max-w-sm mx-auto">
                      Your private XIO letterbox is in pristine default state. Transmissions you send or receive will appear here.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsComposeOpen(true)}
                    className="px-5 py-2.5 bg-gold-accent text-mahogany-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-gold-accent/90 transition-all shadow-md cursor-pointer"
                  >
                    Compose First Letter
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gold-accent/15">
                  {filteredEmails.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => handleSelectEmail(msg)}
                      className={`flex items-center px-4 py-3.5 gap-4 cursor-pointer transition-colors text-xs sm:text-sm ${
                        msg.isRead 
                          ? 'bg-mahogany-900/60 text-ivory/80 hover:bg-gold-accent/10 hover:text-ivory' 
                          : 'bg-mahogany-950/90 font-bold text-ivory hover:bg-mahogany-950 border-l-2 border-gold-accent'
                      }`}
                    >
                      <button
                        onClick={(e) => handleToggleStar(msg.id, e)}
                        className="text-gold-accent/40 hover:text-gold-accent transition-colors cursor-pointer"
                      >
                        <Star className={`w-4 h-4 ${msg.isStarred ? 'fill-gold-accent text-gold-accent' : ''}`} />
                      </button>

                      <div className="w-48 truncate font-serif font-bold text-gold-accent">{msg.senderName}</div>

                      <div className="flex-1 truncate font-serif">
                        <span className="font-bold text-ivory">{msg.subject}</span>
                        <span className="text-ivory/50 font-normal ml-2 font-serif italic">— {msg.body.slice(0, 60)}...</span>
                      </div>

                      {msg.labels && msg.labels.length > 0 && (
                        <div className="hidden md:flex items-center gap-1">
                          {msg.labels.map((lbl, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-mahogany-950 text-gold-accent/80 font-mono border border-gold-accent/20">
                              {lbl}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="text-[11px] text-gold-accent/70 font-mono shrink-0">{msg.timestamp}</div>

                      <button
                        onClick={(e) => handleDelete(msg.id, e)}
                        className="p-1 text-gold-accent/40 hover:text-red-400 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Compose Modal */}
      {isComposeOpen && (
        <ComposeModal
          userProfile={userProfile}
          onClose={() => setIsComposeOpen(false)}
          onSend={handleSendEmail}
        />
      )}
    </div>
  );
};
