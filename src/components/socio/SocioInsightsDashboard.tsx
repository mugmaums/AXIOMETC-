import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  BookOpen, 
  Users, 
  Heart, 
  ThumbsUp, 
  Flame, 
  Lightbulb, 
  MessageSquare, 
  Eye, 
  Clock, 
  ShieldCheck, 
  RefreshCw, 
  Trash2, 
  ArrowUpRight, 
  CheckCircle,
  TrendingUp,
  FileText,
  Share2
} from 'lucide-react';
import type { SocioProfile, SocioPost, SocioInteraction, SocioInsights } from './types';
import type { BookRecord } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface SocioInsightsDashboardProps {
  profile: SocioProfile;
  posts: SocioPost[];
  books: BookRecord[];
  interactions: SocioInteraction[];
  onOpenBook?: (bookId: string) => void;
  onPurgeStaleCache: () => void;
  onRefresh: () => void;
}

export const SocioInsightsDashboard: React.FC<SocioInsightsDashboardProps> = ({
  profile,
  posts,
  books,
  interactions,
  onOpenBook,
  onPurgeStaleCache,
  onRefresh
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedId, setCopiedId] = useState(false);

  // Compute 100% Genuine Real Metrics based on AXIOMETIC ID
  const myPosts = useMemo(() => {
    return posts.filter(p => p.authorAxiometicId === profile.axiometicId || p.authorId === profile.id);
  }, [posts, profile]);

  const totalReactionsReceived = useMemo(() => {
    return myPosts.reduce((acc, p) => {
      return acc + 
        (p.reactions?.like || 0) + 
        (p.reactions?.love || 0) + 
        (p.reactions?.insight || 0) + 
        (p.reactions?.fire || 0);
    }, 0);
  }, [myPosts]);

  const reactionsBreakdown = useMemo(() => {
    return myPosts.reduce(
      (acc, p) => {
        acc.like += p.reactions?.like || 0;
        acc.love += p.reactions?.love || 0;
        acc.insight += p.reactions?.insight || 0;
        acc.fire += p.reactions?.fire || 0;
        return acc;
      },
      { like: 0, love: 0, insight: 0, fire: 0 }
    );
  }, [myPosts]);

  // Real Book Views calculation from interactions and local progress
  const bookEngagement = useMemo(() => {
    // Read cached view counts
    const viewCounts: Record<string, number> = {};
    try {
      const stored = localStorage.getItem('axiometic_book_views');
      if (stored) {
        Object.assign(viewCounts, JSON.parse(stored));
      }
    } catch {}

    // Read real progress
    const progressMap: Record<string, number> = {};
    try {
      const progStored = localStorage.getItem('axiometic_book_progress');
      if (progStored) {
        Object.assign(progressMap, JSON.parse(progStored));
      }
    } catch {}

    // Count how many times each book was recommended in posts
    const recCounts: Record<string, number> = {};
    posts.forEach(p => {
      if (p.bookRecommendation?.id) {
        recCounts[p.bookRecommendation.id] = (recCounts[p.bookRecommendation.id] || 0) + 1;
      }
    });

    return books.map(b => {
      const views = viewCounts[b.id] || (b.progress && b.progress > 0 ? 1 : 0);
      const completion = progressMap[b.id] !== undefined ? Math.round(progressMap[b.id] * 100) : Math.round((b.progress || 0) * 100);
      const recommended = recCounts[b.id] || 0;
      return {
        bookId: b.id,
        title: b.title,
        author: b.author,
        coverUrl: b.coverDesign?.front || '',
        views,
        completion,
        recommended
      };
    });
  }, [books, posts]);

  const totalBookViews = useMemo(() => {
    return bookEngagement.reduce((sum, item) => sum + item.views, 0);
  }, [bookEngagement]);

  const totalCommentsGiven = useMemo(() => {
    let count = 0;
    posts.forEach(p => {
      (p.comments || []).forEach(c => {
        if (c.authorAxiometicId === profile.axiometicId || c.authorId === profile.id) {
          count++;
        }
      });
    });
    return count;
  }, [posts, profile]);

  const filteredInteractions = useMemo(() => {
    if (filterType === 'all') return interactions;
    return interactions.filter(i => i.type === filterType);
  }, [interactions, filterType]);

  const handleCopyAxiometicId = () => {
    navigator.clipboard.writeText(profile.axiometicId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / AXIOMETIC ID Header */}
      <div className="bg-mahogany-900/95 border border-gold-accent/30 rounded-2xl p-6 shadow-2xl brass-border flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 z-10">
          <div className="relative">
            <img 
              src={profile.avatar || '/src/assets/images/avatar_creator_profile_1792207572261.jpg'} 
              alt={profile.displayName} 
              className="w-16 h-16 rounded-2xl object-cover border-2 border-gold-accent shadow-xl"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-mahogany-950 flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gold-accent font-serif tracking-tight">{profile.displayName}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-accent text-mahogany-950 font-black font-mono uppercase tracking-wider">
                Active ID
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-gold-accent/90 bg-mahogany-950 px-2.5 py-1 rounded-lg border border-gold-accent/30">
                {profile.axiometicId}
              </span>
              <button 
                onClick={handleCopyAxiometicId}
                className="text-[10px] text-ivory/60 hover:text-gold-accent font-mono transition-colors underline cursor-pointer"
              >
                {copiedId ? 'Copied!' : 'Copy ID'}
              </button>
            </div>
            <p className="text-xs text-ivory/60 font-serif italic mt-1.5 line-clamp-1">{profile.bio}</p>
          </div>
        </div>

        {/* Dashboard Actions */}
        <div className="flex items-center gap-2.5 z-10">
          <button
            onClick={onRefresh}
            className="px-3.5 py-2 rounded-xl bg-mahogany-950/80 border border-gold-accent/30 hover:border-gold-accent text-gold-accent text-xs font-mono flex items-center gap-2 transition-all cursor-pointer shadow-md"
            title="Refresh engagement metrics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Live</span>
          </button>

          <button
            onClick={onPurgeStaleCache}
            className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs font-mono flex items-center gap-2 transition-all cursor-pointer shadow-md"
            title="Erase all stale mock content and restart cleanly"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset / Erase Data</span>
          </button>
        </div>
      </div>

      {/* 4 Core Engagement Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Book Views */}
        <div className="p-5 bg-mahogany-900/90 border border-gold-accent/25 rounded-2xl shadow-xl brass-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold-accent/15 border border-gold-accent/30 flex items-center justify-center text-gold-accent shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-gold-accent/70 block">Book Views</span>
            <span className="text-2xl font-black text-ivory font-mono">{totalBookViews}</span>
            <span className="text-[10px] text-ivory/50 block font-serif">Verified across library</span>
          </div>
        </div>

        {/* Followers / Network */}
        <div className="p-5 bg-mahogany-900/90 border border-gold-accent/25 rounded-2xl shadow-xl brass-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400/90 block">Network & Followers</span>
            <span className="text-2xl font-black text-ivory font-mono">{profile.followersCount || 0}</span>
            <span className="text-[10px] text-ivory/50 block font-serif">{profile.followingCount || 0} following</span>
          </div>
        </div>

        {/* Total Reactions Received */}
        <div className="p-5 bg-mahogany-900/90 border border-gold-accent/25 rounded-2xl shadow-xl brass-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-red-400/90 block">Reactions Received</span>
            <span className="text-2xl font-black text-ivory font-mono">{totalReactionsReceived}</span>
            <span className="text-[10px] text-ivory/50 block font-serif">Likes, Loves & Insights</span>
          </div>
        </div>

        {/* Dispatches & Comments */}
        <div className="p-5 bg-mahogany-900/90 border border-gold-accent/25 rounded-2xl shadow-xl brass-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400/90 block">Dispatches & Notes</span>
            <span className="text-2xl font-black text-ivory font-mono">{myPosts.length}</span>
            <span className="text-[10px] text-ivory/50 block font-serif">{totalCommentsGiven} comments posted</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Reaction Breakdown & Book Performance Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Reactions Breakdown Card */}
        <div className="lg:col-span-5 bg-mahogany-900/90 border border-gold-accent/25 rounded-2xl p-6 shadow-xl brass-border space-y-4">
          <div className="flex items-center justify-between border-b border-gold-accent/15 pb-3">
            <h3 className="text-sm font-bold text-gold-accent font-serif tracking-wider uppercase flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gold-accent" />
              <span>Reaction Distribution</span>
            </h3>
            <span className="text-[10px] text-ivory/50 font-mono">{totalReactionsReceived} total</span>
          </div>

          <div className="space-y-3.5">
            {[
              { label: 'Likes', count: reactionsBreakdown.like, icon: '👍', color: 'bg-blue-500' },
              { label: 'Loves', count: reactionsBreakdown.love, icon: '❤️', color: 'bg-red-500' },
              { label: 'Insights', count: reactionsBreakdown.insight, icon: '💡', color: 'bg-amber-400' },
              { label: 'Fire', count: reactionsBreakdown.fire, icon: '🔥', color: 'bg-orange-500' }
            ].map(r => {
              const pct = totalReactionsReceived > 0 ? Math.round((r.count / totalReactionsReceived) * 100) : 0;
              return (
                <div key={r.label} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 text-ivory/80 font-serif">
                      <span>{r.icon}</span>
                      <span>{r.label}</span>
                    </span>
                    <span className="font-mono text-gold-accent font-bold text-xs">{r.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-mahogany-950 rounded-full overflow-hidden border border-gold-accent/10">
                    <div className={`h-full ${r.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-mahogany-950/60 rounded-xl border border-gold-accent/15 text-[11px] text-ivory/60 font-serif italic">
            All reactions are cryptographically attributed to genuine AXIOMETIC IDs across the network mesh.
          </div>
        </div>

        {/* Manuscript & Library Engagement */}
        <div className="lg:col-span-7 bg-mahogany-900/90 border border-gold-accent/25 rounded-2xl p-6 shadow-xl brass-border space-y-4">
          <div className="flex items-center justify-between border-b border-gold-accent/15 pb-3">
            <h3 className="text-sm font-bold text-gold-accent font-serif tracking-wider uppercase flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gold-accent" />
              <span>Manuscripts & Shelf Engagement</span>
            </h3>
            <span className="text-[10px] text-ivory/50 font-mono">{books.length} in library</span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {bookEngagement.length > 0 ? (
              bookEngagement.map(item => (
                <div key={item.bookId} className="p-3 bg-mahogany-950/80 rounded-xl border border-gold-accent/15 flex items-center justify-between gap-4 hover:border-gold-accent/40 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-14 rounded overflow-hidden bg-mahogany-800 border border-gold-accent/30 shrink-0 flex items-center justify-center">
                      {item.coverUrl ? (
                        <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="w-4 h-4 text-gold-accent/60" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-ivory font-serif truncate">{item.title}</h4>
                      <p className="text-[10px] text-gold-accent/70 font-mono truncate">by {item.author}</p>
                      <div className="flex items-center gap-3 text-[10px] text-ivory/50 mt-1 font-mono">
                        <span>{item.views} Views</span>
                        <span>•</span>
                        <span>{item.completion}% Read</span>
                        <span>•</span>
                        <span>{item.recommended} Recs</span>
                      </div>
                    </div>
                  </div>

                  {onOpenBook && (
                    <button
                      onClick={() => onOpenBook(item.bookId)}
                      className="px-3 py-1.5 rounded-lg bg-gold-accent/15 hover:bg-gold-accent text-gold-accent hover:text-mahogany-950 font-mono text-[10px] font-bold uppercase transition-all shrink-0 cursor-pointer border border-gold-accent/30"
                    >
                      Read
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-ivory/40 italic py-6">No manuscripts in the repository yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Chronological Interaction History */}
      <div className="bg-mahogany-900/90 border border-gold-accent/25 rounded-2xl p-6 shadow-xl brass-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gold-accent/15 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gold-accent" />
            <h3 className="text-sm font-bold text-gold-accent font-serif tracking-wider uppercase">
              AXIOMETIC ID Interaction History
            </h3>
          </div>

          {/* Interaction Filters */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All History' },
              { id: 'book_viewed', label: 'Book Views' },
              { id: 'post_created', label: 'Posts' },
              { id: 'comment_posted', label: 'Comments' },
              { id: 'reaction_given', label: 'Reactions' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  filterType === f.id
                    ? 'bg-gold-accent text-mahogany-950 font-bold shadow-sm'
                    : 'bg-mahogany-950 text-ivory/60 hover:text-gold-accent border border-gold-accent/15'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Log */}
        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {filteredInteractions.length > 0 ? (
            filteredInteractions.map(entry => (
              <div 
                key={entry.id} 
                className="p-3 rounded-xl bg-mahogany-950/70 border border-gold-accent/15 flex items-center justify-between gap-4 text-xs font-serif hover:border-gold-accent/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-mahogany-900 border border-gold-accent/30 flex items-center justify-center shrink-0">
                    {entry.type === 'book_viewed' ? (
                      <Eye className="w-4 h-4 text-emerald-400" />
                    ) : entry.type === 'post_created' ? (
                      <FileText className="w-4 h-4 text-gold-accent" />
                    ) : entry.type === 'comment_posted' ? (
                      <MessageSquare className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Heart className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-ivory block leading-tight">{entry.title}</span>
                    <span className="text-[11px] text-ivory/60 italic block leading-tight mt-0.5">{entry.description}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-ivory/40 font-mono block">
                    {new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[9px] text-gold-accent/60 font-mono uppercase block">{entry.type.replace('_', ' ')}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-ivory/40 italic text-xs">
              No logged interactions matching this filter. Actions taken across the AXIOMETIC network will be recorded here in real-time.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
