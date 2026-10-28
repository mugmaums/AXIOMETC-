import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Sparkles, 
  Bookmark, 
  BookOpen, 
  Send, 
  MoreHorizontal, 
  ThumbsUp, 
  Flame, 
  Lightbulb, 
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import type { SocioPost, SocioComment, SocioProfile } from './types';
import { motion, AnimatePresence } from 'framer-motion';

interface SocioPostCardProps {
  post: SocioPost;
  currentProfile: SocioProfile;
  onReact: (postId: string, reactionType: 'like' | 'love' | 'insight' | 'fire') => void;
  onAddComment: (postId: string, commentText: string) => void;
  onShare: (post: SocioPost) => void;
  onOpenBook?: (bookId: string) => void;
}

export const SocioPostCard: React.FC<SocioPostCardProps> = ({
  post,
  currentProfile,
  onReact,
  onAddComment,
  onShare,
  onOpenBook
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const totalReactions = 
    (post.reactions.like || 0) + 
    (post.reactions.love || 0) + 
    (post.reactions.insight || 0) + 
    (post.reactions.fire || 0);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(post.id, newComment.trim());
    setNewComment('');
  };

  const getReactionIcon = (type?: string | null) => {
    switch (type) {
      case 'love':
        return <Heart className="w-4 h-4 fill-red-500 text-red-500" />;
      case 'insight':
        return <Lightbulb className="w-4 h-4 fill-amber-400 text-amber-400" />;
      case 'fire':
        return <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />;
      case 'like':
      default:
        return <ThumbsUp className="w-4 h-4 fill-blue-500 text-blue-500" />;
    }
  };

  return (
    <div className="bg-mahogany-900/90 border border-gold-accent/25 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md brass-border transition-all hover:border-gold-accent/40 mb-5">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between border-b border-gold-accent/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={post.authorAvatar || '/src/assets/images/avatar_creator_profile_1792207572261.jpg'} 
              alt={post.authorName} 
              className="w-11 h-11 rounded-full object-cover border-2 border-gold-accent/40 shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/src/assets/images/avatar_creator_profile_1792207572261.jpg';
              }}
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-mahogany-950 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-sm text-ivory hover:text-gold-accent transition-colors font-serif cursor-pointer">
                {post.authorName}
              </h4>
              <span title="Verified AXIOMETIC Account"><CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" /></span>
              {post.feeling && (
                <span className="text-xs text-ivory/60 font-serif italic">
                  is feeling <span className="text-gold-accent font-semibold">{post.feeling}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-ivory/50 font-mono">
              <span className="text-gold-accent/80 font-bold">{post.authorAxiometicId}</span>
              <span>•</span>
              <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              <span>•</span>
              <span className="capitalize">{post.privacy}</span>
            </div>
          </div>
        </div>

        <button 
          className="p-2 text-ivory/40 hover:text-gold-accent rounded-full hover:bg-gold-accent/10 transition-colors cursor-pointer"
          title="Post Options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Post Text Body */}
      <div className="p-4 pt-3 text-sm text-ivory/90 leading-relaxed font-serif whitespace-pre-wrap">
        {post.content}
      </div>

      {/* Embedded Book Recommendation Card (Facebook-Style rich media attachment) */}
      {post.bookRecommendation && (
        <div className="mx-4 mb-4 p-4 rounded-xl bg-mahogany-950/80 border border-gold-accent/30 shadow-inner flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative shrink-0 w-24 h-32 rounded-lg overflow-hidden border border-gold-accent/40 shadow-xl bg-mahogany-800">
            {post.bookRecommendation.coverUrl ? (
              <img 
                src={post.bookRecommendation.coverUrl} 
                alt={post.bookRecommendation.title} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center" style={{ backgroundColor: post.bookRecommendation.accentColor || '#3d1a10' }}>
                <BookOpen className="w-6 h-6 text-gold-accent mb-1" />
                <span className="text-[9px] font-serif font-bold text-ivory line-clamp-2">{post.bookRecommendation.title}</span>
              </div>
            )}
            <div className="absolute top-1 right-1 bg-mahogany-950/80 px-1 py-0.5 rounded text-[8px] font-mono text-gold-accent">
              WRI
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-gold-accent/70">
                <Bookmark className="w-3 h-3 text-gold-accent" />
                <span>Featured Manuscript in WRI Library</span>
              </div>
              <h5 className="text-base font-bold text-gold-accent font-serif truncate">
                {post.bookRecommendation.title}
              </h5>
              <p className="text-xs text-ivory/60 italic font-serif">
                by {post.bookRecommendation.author}
              </p>
              <p className="text-xs text-ivory/70 line-clamp-2 leading-relaxed pt-1 font-serif">
                {post.bookRecommendation.synopsis}
              </p>
            </div>

            <div className="mt-3 flex items-center gap-2">
              {onOpenBook && (
                <button
                  onClick={() => onOpenBook(post.bookRecommendation!.id)}
                  className="px-4 py-1.5 rounded-lg bg-gold-accent text-mahogany-950 font-black text-xs uppercase tracking-wider hover:bg-gold-accent/90 transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Read in WRI</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Media Attachment (Photo / Video) */}
      {post.mediaUrl && (
        <div className="border-t border-b border-gold-accent/15 bg-black/40 overflow-hidden max-h-[480px] flex items-center justify-center">
          {post.mediaType === 'video' ? (
            <video src={post.mediaUrl} controls className="max-h-[460px] w-full object-contain" />
          ) : (
            <img 
              src={post.mediaUrl} 
              alt="Post media" 
              className="max-h-[460px] w-full object-cover cursor-pointer hover:scale-[1.01] transition-transform" 
            />
          )}
        </div>
      )}

      {/* Reaction and Comment Counts Row */}
      <div className="px-4 py-2.5 flex items-center justify-between text-xs text-ivory/50 border-b border-gold-accent/10 font-mono">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center -space-x-1">
            <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white shadow-sm">👍</span>
            <span className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-[10px] text-white shadow-sm">❤️</span>
            <span className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-[10px] text-white shadow-sm">💡</span>
          </div>
          <span className="ml-1 text-gold-accent/90 font-bold">{totalReactions}</span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowComments(prev => !prev)} 
            className="hover:text-gold-accent transition-colors cursor-pointer"
          >
            {post.comments?.length || 0} Comments
          </button>
          <span>{post.sharesCount || 0} Shares</span>
        </div>
      </div>

      {/* Action Buttons: Like / React, Comment, Share */}
      <div className="px-2 py-1.5 flex items-center justify-around relative">
        {/* Reaction Trigger Button */}
        <div className="relative flex-1">
          <button
            onMouseEnter={() => setShowReactionPicker(true)}
            onClick={() => {
              if (post.userReaction) {
                onReact(post.id, 'like'); // toggle
              } else {
                onReact(post.id, 'like');
              }
            }}
            className={`w-full py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
              post.userReaction 
                ? 'text-gold-accent bg-gold-accent/10 font-black' 
                : 'text-ivory/70 hover:bg-gold-accent/10 hover:text-gold-accent'
            }`}
          >
            {getReactionIcon(post.userReaction)}
            <span className="capitalize">{post.userReaction || 'Like'}</span>
          </button>

          {/* Facebook-Style Reaction Picker Hover Popover */}
          <AnimatePresence>
            {showReactionPicker && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                onMouseLeave={() => setShowReactionPicker(false)}
                className="absolute bottom-full left-4 mb-2 bg-mahogany-950/95 border border-gold-accent/40 rounded-full px-3 py-1.5 shadow-2xl flex items-center gap-2 z-30 brass-border"
              >
                {[
                  { type: 'like' as const, emoji: '👍', label: 'Like' },
                  { type: 'love' as const, emoji: '❤️', label: 'Love' },
                  { type: 'insight' as const, emoji: '💡', label: 'Insight' },
                  { type: 'fire' as const, emoji: '🔥', label: 'Fire' }
                ].map(r => (
                  <button
                    key={r.type}
                    onClick={() => {
                      onReact(post.id, r.type);
                      setShowReactionPicker(false);
                    }}
                    className="p-1 hover:scale-130 active:scale-95 transition-transform text-lg cursor-pointer"
                    title={r.label}
                  >
                    {r.emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Comment Button */}
        <button
          onClick={() => setShowComments(prev => !prev)}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
            showComments ? 'text-gold-accent bg-gold-accent/10' : 'text-ivory/70 hover:bg-gold-accent/10 hover:text-gold-accent'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Comment</span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => onShare(post)}
          className="flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-ivory/70 hover:bg-gold-accent/10 hover:text-gold-accent transition-all cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-mahogany-950/60 border-t border-gold-accent/10 space-y-4"
          >
            {/* Existing Comments */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map(c => (
                  <div key={c.id} className="flex gap-2.5 items-start">
                    <img 
                      src={c.authorAvatar || '/src/assets/images/avatar_creator_profile_1792207572261.jpg'} 
                      alt={c.authorName} 
                      className="w-8 h-8 rounded-full object-cover border border-gold-accent/30 mt-0.5 shrink-0" 
                    />
                    <div className="flex-1 bg-mahogany-900/90 border border-gold-accent/20 rounded-2xl px-3.5 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gold-accent font-serif">{c.authorName}</span>
                        <span className="text-[9px] text-ivory/40 font-mono">
                          {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-ivory/80 font-serif mt-1">{c.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-xs text-ivory/40 italic py-2">No comments yet. Be the first to share your thoughts!</p>
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-1">
              <img 
                src={currentProfile.avatar || '/src/assets/images/avatar_creator_profile_1792207572261.jpg'} 
                alt={currentProfile.displayName} 
                className="w-8 h-8 rounded-full object-cover border border-gold-accent/30 shrink-0" 
              />
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={newComment} 
                  onChange={e => setNewComment(e.target.value)} 
                  placeholder="Write a comment with your AXIOMETIC ID..." 
                  className="w-full bg-mahogany-900 border border-gold-accent/30 rounded-full py-2 pl-4 pr-10 text-xs text-ivory placeholder-ivory/40 focus:outline-none focus:border-gold-accent font-serif" 
                />
                <button 
                  type="submit" 
                  disabled={!newComment.trim()} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gold-accent disabled:opacity-30 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
