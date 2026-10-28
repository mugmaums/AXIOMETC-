import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Image as ImageIcon, 
  BookOpen, 
  Smile, 
  Sparkles, 
  Compass, 
  Bookmark, 
  TrendingUp, 
  MessageSquare, 
  Bell, 
  Share2, 
  SlidersHorizontal, 
  AtSign, 
  CheckCircle, 
  Plus, 
  X, 
  ExternalLink, 
  Library, 
  Globe, 
  Mail,
  BarChart3,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Send
} from 'lucide-react';
import { auth, db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import type { SocioProfile, SocioPost, SocioStory, SocioBookRecommendation, SocioInteraction } from './types';
import { SocioPostCard } from './SocioPostCard';
import { SocioProfileModal } from './SocioProfileModal';
import { SocioInsightsDashboard } from './SocioInsightsDashboard';
import type { BookRecord } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface SocioContainerProps {
  onOpenWriBook?: (bookId: string) => void;
  onOpenCanvas?: () => void;
  onOpenWri?: () => void;
  onOpenAxio?: () => void;
  onOpenXio?: () => void;
  books?: BookRecord[];
}

// Fallback books from WRI scriptorium
const FALLBACK_BOOKS: BookRecord[] = [
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
    chapters: [],
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
    chapters: [],
    publishedAt: new Date().toISOString()
  }
];

// Helper to filter out fake mock IDs completely
const isMockPost = (p: any): boolean => {
  if (!p) return true;
  const id = String(p.id || '');
  const authorId = String(p.authorId || '');
  const authorName = String(p.authorName || '');
  return (
    id === 'post_1' ||
    id === 'post_2' ||
    authorId === 'vaelourix_system' ||
    authorId === 'scholar_marcus' ||
    authorName.toLowerCase().includes('marcus aurelius') ||
    authorName.toLowerCase().includes('vaelourix ai engine')
  );
};

export const SocioContainer: React.FC<SocioContainerProps> = ({
  onOpenWriBook,
  onOpenCanvas,
  onOpenWri,
  onOpenAxio,
  onOpenXio,
  books = []
}) => {
  // Use passed books or fallback
  const allBooks = useMemo(() => {
    return books && books.length > 0 ? books : FALLBACK_BOOKS;
  }, [books]);

  // Clean AXIOMETIC Profile from Authenticated User Data
  const [profile, setProfile] = useState<SocioProfile>(() => {
    const user = auth.currentUser;
    const email = user?.email || 'mugmaums@gmail.com';
    const rawHandle = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_.-]/g, '');
    const axiometicId = `${rawHandle || 'user'}@axiometic`;

    // Check localStorage cache & sanitize any previous mock bio or mock followers
    try {
      const cached = localStorage.getItem('axiometic_socio_profile');
      if (cached) {
        const parsed = JSON.parse(cached);
        let modified = false;
        // Wipe legacy mock follower counts (was 142/88/56)
        if (parsed.followersCount === 142 || parsed.followingCount === 88) {
          parsed.followersCount = 0;
          parsed.followingCount = 0;
          parsed.friendsCount = 0;
          modified = true;
        }
        // Wipe legacy mock bio
        if (parsed.bio && parsed.bio.includes('Architect in the Axiometic digital scriptorium')) {
          parsed.bio = '';
          modified = true;
        }
        if (parsed.displayName === 'Axiometic Scholar' && (user?.displayName || rawHandle)) {
          parsed.displayName = user?.displayName || rawHandle;
          modified = true;
        }
        if (modified) {
          localStorage.setItem('axiometic_socio_profile', JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch {}

    return {
      id: user?.uid || 'local_user',
      axiometicId,
      displayName: user?.displayName || rawHandle || 'Scholar',
      avatar: user?.photoURL || '/src/assets/images/avatar_creator_profile_1792207572261.jpg',
      email,
      bio: '',
      coverPhoto: '/src/assets/images/hero_axiometic_workspace_1792207571017.jpg',
      accountType: 'personal',
      followersCount: 0,
      followingCount: 0,
      friendsCount: 0,
      joinedAt: new Date().toISOString(),
      verified: true
    };
  });

  // Authentic Posts State - Discard any mock posts
  const [posts, setPosts] = useState<SocioPost[]>(() => {
    try {
      const saved = localStorage.getItem('axiometic_socio_posts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const authenticOnly = parsed.filter(p => !isMockPost(p));
          // Save back clean list if mock posts were present
          if (authenticOnly.length !== parsed.length) {
            localStorage.setItem('axiometic_socio_posts', JSON.stringify(authenticOnly));
          }
          return authenticOnly;
        }
      }
    } catch {}
    return [];
  });

  // Authentic Stories State
  const [stories, setStories] = useState<SocioStory[]>(() => {
    try {
      const saved = localStorage.getItem('axiometic_socio_stories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Remove mock stories
          return parsed.filter(s => !s.id.startsWith('story_') || s.authorName === profile.displayName);
        }
      }
    } catch {}
    return [];
  });

  // Authentic Interactions Audit History
  const [interactions, setInteractions] = useState<SocioInteraction[]>(() => {
    try {
      const saved = localStorage.getItem('axiometic_socio_interactions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [activeTab, setActiveTab] = useState<'feed' | 'books' | 'insights' | 'myposts'>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // New Post Form State
  const [postContent, setPostContent] = useState('');
  const [postMediaUrl, setPostMediaUrl] = useState('');
  const [selectedBookForPost, setSelectedBookForPost] = useState<BookRecord | null>(null);
  const [selectedFeeling, setSelectedFeeling] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [showFeelingSelector, setShowFeelingSelector] = useState(false);

  // New Story Form State
  const [storyImageUrl, setStoryImageUrl] = useState('');
  const [storyCaption, setStoryCaption] = useState('');

  // Helper to log genuine interactions
  const logInteraction = (
    type: SocioInteraction['type'],
    title: string,
    description?: string,
    targetId?: string
  ) => {
    const newInt: SocioInteraction = {
      id: `int_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      title,
      description: description || '',
      targetId,
      axiometicId: profile.axiometicId,
      timestamp: new Date().toISOString()
    };
    setInteractions(prev => {
      const updated = [newInt, ...prev].slice(0, 150);
      try {
        localStorage.setItem('axiometic_socio_interactions', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Sync profile when auth state updates
  useEffect(() => {
    if (auth.currentUser) {
      const user = auth.currentUser;
      const email = user.email || profile.email;
      const rawHandle = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_.-]/g, '');
      
      setProfile(prev => {
        const updated: SocioProfile = {
          ...prev,
          id: user.uid,
          email,
          displayName: prev.displayName === 'Axiometic Scholar' && user.displayName ? user.displayName : prev.displayName,
          avatar: user.photoURL || prev.avatar,
          axiometicId: prev.axiometicId || `${rawHandle}@axiometic`
        };
        try {
          localStorage.setItem('axiometic_socio_profile', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  }, [auth.currentUser]);

  // Persist posts
  const persistPosts = (updatedPosts: SocioPost[]) => {
    setPosts(updatedPosts);
    try {
      localStorage.setItem('axiometic_socio_posts', JSON.stringify(updatedPosts));
    } catch {}
  };

  // Complete Purge & Clean Slate Handler (Erases all mock, stale, or fake data across private sectors)
  const handlePurgeStaleCache = () => {
    try {
      localStorage.removeItem('axiometic_socio_posts');
      localStorage.removeItem('axiometic_socio_stories');
      localStorage.removeItem('axiometic_socio_interactions');
      localStorage.removeItem('axiometic_book_views');
      localStorage.removeItem('axiometic_xio_emails');
      localStorage.removeItem('axiometic_xio_profile');
    } catch {}

    setPosts([]);
    setStories([]);
    setInteractions([]);

    setProfile(prev => {
      const reset = {
        ...prev,
        bio: '',
        followersCount: 0,
        followingCount: 0,
        friendsCount: 0
      };
      try {
        localStorage.setItem('axiometic_socio_profile', JSON.stringify(reset));
      } catch {}
      return reset;
    });

    logInteraction('profile_updated', 'Pristine Cache Reset', 'All mock content and fake telemetry permanently erased.');

    setNotificationMsg('All mock data and private sector cache erased. Default formatting active.');
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  const handleRefreshInsights = () => {
    // Re-read local storage
    try {
      const rawInt = localStorage.getItem('axiometic_socio_interactions');
      if (rawInt) setInteractions(JSON.parse(rawInt));
    } catch {}
    setNotificationMsg('Live telemetry refreshed from AXIOMETIC ledger.');
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() && !postMediaUrl.trim() && !selectedBookForPost) return;

    let bookRec: SocioBookRecommendation | undefined = undefined;
    if (selectedBookForPost) {
      bookRec = {
        id: selectedBookForPost.id,
        title: selectedBookForPost.title,
        author: selectedBookForPost.author,
        coverUrl: selectedBookForPost.coverDesign?.front || '',
        synopsis: selectedBookForPost.synopsis || '',
        accentColor: selectedBookForPost.coverDesign?.accentColor || '#3d1a10'
      };
    }

    const newPost: SocioPost = {
      id: `post_${Date.now()}`,
      authorId: profile.id,
      authorName: profile.displayName,
      authorAxiometicId: profile.axiometicId,
      authorAvatar: profile.avatar,
      content: postContent.trim(),
      mediaUrl: postMediaUrl.trim() || undefined,
      mediaType: 'image',
      bookRecommendation: bookRec,
      feeling: selectedFeeling || undefined,
      reactions: { like: 1, love: 0, insight: 0, fire: 0 },
      userReaction: 'like',
      comments: [],
      sharesCount: 0,
      createdAt: new Date().toISOString(),
      privacy: 'public'
    };

    const nextPosts = [newPost, ...posts];
    persistPosts(nextPosts);

    // Log genuine interaction
    logInteraction(
      'post_created',
      'Published Socio/X Dispatch',
      postContent.slice(0, 60) + (postContent.length > 60 ? '...' : ''),
      newPost.id
    );

    // Reset Form
    setPostContent('');
    setPostMediaUrl('');
    setSelectedBookForPost(null);
    setSelectedFeeling('');
    setShowMediaInput(false);
    setShowBookSelector(false);
    setShowFeelingSelector(false);
  };

  const handleCreateStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyImageUrl.trim() && !storyCaption.trim()) return;

    const newStory: SocioStory = {
      id: `story_${Date.now()}`,
      authorName: profile.displayName,
      authorAvatar: profile.avatar,
      imageUrl: storyImageUrl.trim() || profile.coverPhoto || '/src/assets/images/hero_axiometic_workspace_1792207571017.jpg',
      caption: storyCaption.trim(),
      timestamp: 'Just now',
      unread: false
    };

    const nextStories = [newStory, ...stories];
    setStories(nextStories);
    try {
      localStorage.setItem('axiometic_socio_stories', JSON.stringify(nextStories));
    } catch {}

    logInteraction('post_created', 'Created Visual Story Dispatch', storyCaption.slice(0, 50), newStory.id);

    setStoryImageUrl('');
    setStoryCaption('');
    setShowStoryModal(false);
  };

  const handleReact = (postId: string, reactionType: 'like' | 'love' | 'insight' | 'fire') => {
    let targetPost = posts.find(p => p.id === postId);

    const nextPosts = posts.map(p => {
      if (p.id !== postId) return p;

      const current = p.userReaction;
      const newReactions = { ...p.reactions };

      if (current === reactionType) {
        // Toggle off
        newReactions[reactionType] = Math.max(0, (newReactions[reactionType] || 0) - 1);
        return { ...p, reactions: newReactions, userReaction: null };
      } else {
        // Decrement previous if any
        if (current) {
          newReactions[current] = Math.max(0, (newReactions[current] || 0) - 1);
        }
        // Increment new
        newReactions[reactionType] = (newReactions[reactionType] || 0) + 1;
        return { ...p, reactions: newReactions, userReaction: reactionType };
      }
    });

    persistPosts(nextPosts);

    if (targetPost) {
      logInteraction(
        'reaction_given',
        `Reacted with ${reactionType} to dispatch`,
        `By @${targetPost.authorAxiometicId}`,
        postId
      );
    }
  };

  const handleAddComment = (postId: string, commentText: string) => {
    const nextPosts = posts.map(p => {
      if (p.id !== postId) return p;

      const newComment = {
        id: `c_${Date.now()}`,
        authorId: profile.id,
        authorName: profile.displayName,
        authorAxiometicId: profile.axiometicId,
        authorAvatar: profile.avatar,
        content: commentText,
        createdAt: new Date().toISOString(),
        likes: 0
      };

      return {
        ...p,
        comments: [...(p.comments || []), newComment]
      };
    });

    persistPosts(nextPosts);

    logInteraction(
      'comment_added',
      'Added Comment to Dispatch',
      commentText.slice(0, 60),
      postId
    );
  };

  const handleShare = (post: SocioPost) => {
    const nextPosts = posts.map(p => {
      if (p.id === post.id) {
        return { ...p, sharesCount: (p.sharesCount || 0) + 1 };
      }
      return p;
    });
    persistPosts(nextPosts);
    logInteraction(
      'post_shared',
      'Broadcasted Dispatch Across Network',
      `Referenced ${post.authorAxiometicId}`,
      post.id
    );
    setNotificationMsg(`Dispatch broadcasted across AXIOMETIC network referencing ${post.authorAxiometicId}`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const handleSaveProfile = (updated: Partial<SocioProfile>) => {
    setProfile(prev => {
      const merged = { ...prev, ...updated };
      try {
        localStorage.setItem('axiometic_socio_profile', JSON.stringify(merged));
      } catch {}
      return merged;
    });

    logInteraction(
      'profile_updated',
      'Updated AXIOMETIC Handle & Scriptorium Profile',
      updated.axiometicId || profile.axiometicId
    );
  };

  // Dynamically calculate real hashtags from genuine posts
  const dynamicHashtags = useMemo(() => {
    const tagCount: Record<string, number> = {};
    posts.forEach(p => {
      const matches = p.content.match(/#([a-zA-Z0-9_-]+)/g);
      if (matches) {
        matches.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });

    const entries = Object.entries(tagCount).sort((a, b) => b[1] - a[1]);
    return entries.map(([tag, count]) => ({
      tag,
      count: `${count} ${count === 1 ? 'dispatch' : 'dispatches'}`
    }));
  }, [posts]);

  // Real Authors currently active in the user's local instance
  const activeAuthors = useMemo(() => {
    const authorsMap = new Map<string, { name: string; handle: string; avatar: string }>();
    
    // 1. Current user
    authorsMap.set(profile.axiometicId, {
      name: profile.displayName,
      handle: profile.axiometicId,
      avatar: profile.avatar
    });

    // 2. Authors from authentic posts
    posts.forEach(p => {
      if (!authorsMap.has(p.authorAxiometicId)) {
        authorsMap.set(p.authorAxiometicId, {
          name: p.authorName,
          handle: p.authorAxiometicId,
          avatar: p.authorAvatar
        });
      }
    });

    return Array.from(authorsMap.values());
  }, [profile, posts]);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesContent = p.content.toLowerCase().includes(q);
        const matchesAuthor = p.authorName.toLowerCase().includes(q) || p.authorAxiometicId.toLowerCase().includes(q);
        const matchesBook = p.bookRecommendation?.title.toLowerCase().includes(q);
        if (!matchesContent && !matchesAuthor && !matchesBook) return false;
      }

      if (activeTab === 'books') return !!p.bookRecommendation;
      if (activeTab === 'myposts') return p.authorId === profile.id || p.authorAxiometicId === profile.axiometicId;
      return true;
    });
  }, [posts, searchQuery, activeTab, profile]);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-mahogany-950 font-serif text-ivory">
      {/* Real-time Banner / Notification Toast */}
      {notificationMsg && (
        <div className="bg-gold-accent text-mahogany-950 px-4 py-2 text-center text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg sticky top-0 z-50 animate-in slide-in-from-top">
          <ShieldCheck className="w-4 h-4 text-emerald-900" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Socio/X Top Navigation Bar (Facebook Style) */}
      <header className="sticky top-12 z-40 bg-mahogany-900/95 border-b border-gold-accent/25 backdrop-blur-md px-4 py-2.5 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Search Bar */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-accent to-amber-700 flex items-center justify-center font-black text-mahogany-950 text-base shadow-md">
                SX
              </div>
              <span className="font-bold text-lg text-gold-accent font-serif tracking-tight hidden sm:inline">
                Socio/X
              </span>
            </div>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-accent/50" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search network, authentic dispatches, books..."
                className="w-full bg-mahogany-950/80 border border-gold-accent/20 rounded-full py-1.5 pl-9 pr-4 text-xs text-ivory placeholder-ivory/40 focus:outline-none focus:border-gold-accent transition-all font-serif"
              />
            </div>
          </div>

          {/* Center Tabs Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'feed'
                  ? 'bg-gold-accent text-mahogany-950 shadow-md font-black'
                  : 'text-ivory/70 hover:bg-gold-accent/10 hover:text-gold-accent'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Feed</span>
            </button>

            <button
              onClick={() => setActiveTab('insights')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'insights'
                  ? 'bg-gold-accent text-mahogany-950 shadow-md font-black'
                  : 'text-ivory/70 hover:bg-gold-accent/10 hover:text-gold-accent'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>Profile Insights</span>
            </button>

            <button
              onClick={() => setActiveTab('books')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'books'
                  ? 'bg-gold-accent text-mahogany-950 shadow-md font-black'
                  : 'text-ivory/70 hover:bg-gold-accent/10 hover:text-gold-accent'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Shelf Reviews</span>
            </button>

            <button
              onClick={() => setActiveTab('myposts')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'myposts'
                  ? 'bg-gold-accent text-mahogany-950 shadow-md font-black'
                  : 'text-ivory/70 hover:bg-gold-accent/10 hover:text-gold-accent'
              }`}
            >
              <AtSign className="w-4 h-4" />
              <span>My Dispatches</span>
            </button>
          </div>

          {/* User Profile Pill with AXIOMETIC Handle */}
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-mahogany-950/90 border border-gold-accent/30 hover:border-gold-accent hover:bg-mahogany-900 transition-all cursor-pointer shadow-md group"
              title="Edit Socio/X Profile & AXIOMETIC Handle"
            >
              <img 
                src={profile.avatar || '/src/assets/images/avatar_creator_profile_1792207572261.jpg'} 
                alt={profile.displayName} 
                className="w-7 h-7 rounded-full object-cover border border-gold-accent/50"
              />
              <div className="text-left hidden lg:block">
                <span className="text-xs font-bold text-ivory block leading-tight group-hover:text-gold-accent transition-colors font-serif truncate max-w-[120px]">
                  {profile.displayName}
                </span>
                <span className="text-[10px] text-gold-accent font-mono block leading-tight">
                  {profile.axiometicId}
                </span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Responsive Layout */}
      <div className="max-w-7xl mx-auto px-4 py-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Column: Profile Card & Quick Navigation Shortcuts */}
        <aside className="lg:col-span-3 space-y-5 hidden lg:block">
          {/* User Profile Summary Card */}
          <div className="bg-mahogany-900/90 border border-gold-accent/25 rounded-2xl p-5 shadow-xl brass-border text-center relative overflow-hidden">
            <div 
              className="h-16 -mx-5 -mt-5 mb-4 bg-cover bg-center border-b border-gold-accent/20"
              style={{ backgroundImage: `url("${profile.coverPhoto || '/src/assets/images/hero_axiometic_workspace_1792207571017.jpg'}")` }}
            />
            
            <div className="relative -mt-12 mb-3 inline-block">
              <img 
                src={profile.avatar} 
                alt={profile.displayName} 
                className="w-16 h-16 rounded-full object-cover border-2 border-gold-accent shadow-xl mx-auto"
              />
              <CheckCircle className="w-4 h-4 text-emerald-400 absolute bottom-0 right-0 bg-mahogany-950 rounded-full" />
            </div>

            <h3 className="text-base font-bold text-gold-accent font-serif truncate">{profile.displayName}</h3>
            <span className="text-xs font-mono text-gold-accent/70 block mb-2">{profile.axiometicId}</span>
            {profile.bio ? (
              <p className="text-xs text-ivory/60 font-serif italic mb-4 line-clamp-2">{profile.bio}</p>
            ) : (
              <p className="text-xs text-ivory/30 font-serif italic mb-4">No bio added</p>
            )}

            {/* Metrics Card with Genuine Zero-Initialized Values */}
            <div className="grid grid-cols-3 gap-2 py-2 border-y border-gold-accent/15 mb-4 text-center">
              <div>
                <span className="text-xs font-black text-ivory font-mono block">{profile.followersCount}</span>
                <span className="text-[9px] text-ivory/40 uppercase font-mono">Followers</span>
              </div>
              <div>
                <span className="text-xs font-black text-ivory font-mono block">{profile.followingCount}</span>
                <span className="text-[9px] text-ivory/40 uppercase font-mono">Following</span>
              </div>
              <div>
                <span className="text-xs font-black text-ivory font-mono block">{posts.length}</span>
                <span className="text-[9px] text-ivory/40 uppercase font-mono">Posts</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('insights')}
                className={`w-full py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'insights'
                    ? 'bg-gold-accent text-mahogany-950 shadow-md'
                    : 'bg-gold-accent/15 hover:bg-gold-accent text-gold-accent hover:text-mahogany-950 border border-gold-accent/30'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Profile Insights</span>
              </button>

              <button
                onClick={() => setShowProfileModal(true)}
                className="w-full py-1.5 bg-mahogany-950/80 hover:bg-gold-accent/10 text-ivory/70 hover:text-gold-accent rounded-xl text-[11px] font-mono transition-all border border-gold-accent/20 cursor-pointer"
              >
                Edit AXIOMETIC Handle
              </button>
            </div>
          </div>

          {/* Navigation Shortcuts */}
          <div className="bg-mahogany-900/90 border border-gold-accent/20 rounded-2xl p-4 shadow-xl space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-gold-accent/60 block px-3 py-1 mb-1 font-bold">
              Axiometic Ecosystem
            </span>

            {onOpenCanvas && (
              <button 
                onClick={onOpenCanvas} 
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-ivory/80 hover:text-gold-accent hover:bg-gold-accent/10 transition-colors cursor-pointer text-left font-serif"
              >
                <Library className="w-4 h-4 text-gold-accent" />
                <span>Living Canvas Surface</span>
              </button>
            )}

            {onOpenWri && (
              <button 
                onClick={onOpenWri} 
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-ivory/80 hover:text-gold-accent hover:bg-gold-accent/10 transition-colors cursor-pointer text-left font-serif"
              >
                <BookOpen className="w-4 h-4 text-gold-accent" />
                <span>WRI 3D Library & Scriptorium</span>
              </button>
            )}

            {onOpenAxio && (
              <button 
                onClick={onOpenAxio} 
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-ivory/80 hover:text-gold-accent hover:bg-gold-accent/10 transition-colors cursor-pointer text-left font-serif"
              >
                <Globe className="w-4 h-4 text-blue-400" />
                <span>AXIO Chrome Engine</span>
              </button>
            )}

            {onOpenXio && (
              <button 
                onClick={onOpenXio} 
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-ivory/80 hover:text-gold-accent hover:bg-gold-accent/10 transition-colors cursor-pointer text-left font-serif"
              >
                <Mail className="w-4 h-4 text-amber-400" />
                <span>XIO Mail Client (@axiometic)</span>
              </button>
            )}

            <div className="pt-2 mt-2 border-t border-gold-accent/15">
              <button
                onClick={handlePurgeStaleCache}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-mono text-red-400/80 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
                title="Erase all mock and cached dispatches"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Erase Mock & Stale Data</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Center Column: Feed / Insights / Reviews */}
        <main className={`${activeTab === 'insights' ? 'lg:col-span-9' : 'lg:col-span-6'} space-y-6`}>
          {activeTab === 'insights' ? (
            /* Socio/X Profile Insights Dashboard Component */
            <SocioInsightsDashboard
              profile={profile}
              posts={posts}
              books={allBooks}
              interactions={interactions}
              onOpenBook={onOpenWriBook}
              onPurgeStaleCache={handlePurgeStaleCache}
              onRefresh={handleRefreshInsights}
            />
          ) : (
            <>
              {/* Stories Carousel (Authentic User-Created Stories) */}
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {/* Create Story Card */}
                <div 
                  onClick={() => setShowStoryModal(true)}
                  className="shrink-0 w-28 h-44 rounded-2xl bg-mahogany-900 border-2 border-dashed border-gold-accent/30 hover:border-gold-accent flex flex-col items-center justify-between p-3 relative overflow-hidden shadow-lg cursor-pointer transition-all hover:scale-105 group"
                >
                  <img 
                    src={profile.avatar} 
                    alt="Profile" 
                    className="w-full h-24 object-cover rounded-xl opacity-80 group-hover:opacity-100" 
                  />
                  <div className="absolute top-20 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gold-accent text-mahogany-950 flex items-center justify-center font-black shadow-lg border-2 border-mahogany-900">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-ivory text-center mt-3 font-serif">Add Story</span>
                </div>

                {/* Real User Stories */}
                {stories.map(s => (
                  <div 
                    key={s.id} 
                    className="shrink-0 w-28 h-44 rounded-2xl relative overflow-hidden shadow-lg border border-gold-accent/40 cursor-pointer transition-all hover:scale-105 group"
                  >
                    <img src={s.imageUrl} alt={s.authorName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Author Avatar */}
                    <div className="absolute top-2.5 left-2.5 w-8 h-8 rounded-full p-0.5 bg-gold-accent shadow-md">
                      <img src={s.authorAvatar} alt={s.authorName} className="w-full h-full rounded-full object-cover border border-mahogany-950" />
                    </div>

                    <div className="absolute bottom-2.5 inset-x-2.5">
                      <span className="text-[11px] font-bold text-ivory font-serif block leading-tight drop-shadow truncate">
                        {s.authorName}
                      </span>
                      {s.caption && (
                        <span className="text-[9px] text-ivory/70 font-serif italic block truncate">
                          {s.caption}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Facebook-Style Create Post Card */}
              <div className="bg-mahogany-900/95 border border-gold-accent/30 rounded-2xl p-4 shadow-xl brass-border">
                <div className="flex gap-3 items-center mb-3">
                  <img 
                    src={profile.avatar} 
                    alt={profile.displayName} 
                    className="w-10 h-10 rounded-full object-cover border border-gold-accent/40 shadow-sm"
                  />
                  <textarea
                    rows={2}
                    value={postContent}
                    onChange={e => setPostContent(e.target.value)}
                    placeholder={`What's happening in your scriptorium, ${profile.displayName.split(' ')[0]}?`}
                    className="flex-1 bg-mahogany-950/80 border border-gold-accent/20 rounded-xl p-3 text-xs text-ivory placeholder-ivory/40 focus:outline-none focus:border-gold-accent transition-all font-serif resize-none"
                  />
                </div>

                {/* Selected Book Recommendation Preview */}
                {selectedBookForPost && (
                  <div className="p-3 mb-3 rounded-xl bg-mahogany-950/90 border border-gold-accent/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-gold-accent shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-gold-accent font-serif block truncate">{selectedBookForPost.title}</span>
                        <span className="text-[10px] text-ivory/50 font-serif italic">by {selectedBookForPost.author}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedBookForPost(null)}
                      className="p-1 text-ivory/40 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Image URL Input Drawer */}
                {showMediaInput && (
                  <div className="mb-3 p-3 rounded-xl bg-mahogany-950/90 border border-gold-accent/20 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-gold-accent shrink-0" />
                    <input 
                      type="url" 
                      value={postMediaUrl} 
                      onChange={e => setPostMediaUrl(e.target.value)} 
                      placeholder="Paste image URL to attach..." 
                      className="flex-1 bg-transparent text-xs text-ivory placeholder-ivory/30 focus:outline-none font-mono" 
                    />
                    <button onClick={() => setShowMediaInput(false)} className="text-ivory/40 hover:text-ivory">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Book Selector Drawer */}
                {showBookSelector && (
                  <div className="mb-3 p-3 rounded-xl bg-mahogany-950/90 border border-gold-accent/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-gold-accent font-bold uppercase tracking-wider">
                        Select Manuscript to Recommend
                      </span>
                      <button onClick={() => setShowBookSelector(false)} className="text-ivory/40 hover:text-ivory">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                      {allBooks.map(b => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            setSelectedBookForPost(b);
                            setShowBookSelector(false);
                          }}
                          className="p-2 rounded-lg bg-mahogany-900 hover:bg-gold-accent/15 border border-gold-accent/20 text-left transition-colors cursor-pointer"
                        >
                          <p className="text-xs font-serif font-bold text-ivory truncate">{b.title}</p>
                          <p className="text-[10px] text-ivory/50 truncate font-serif italic">{b.author}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feeling Selector */}
                {showFeelingSelector && (
                  <div className="mb-3 p-3 rounded-xl bg-mahogany-950/90 border border-gold-accent/20 flex flex-wrap gap-2">
                    {['Inspired 💡', 'Reading 📖', 'Building 🚀', 'Thoughtful ☕', 'Accomplished 🏆', 'Curious 🔍'].map(f => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => {
                          setSelectedFeeling(f);
                          setShowFeelingSelector(false);
                        }}
                        className={`px-3 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                          selectedFeeling === f ? 'bg-gold-accent text-mahogany-950 font-bold' : 'bg-mahogany-900 text-ivory/70 hover:text-gold-accent'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}

                {/* Actions Toolbar */}
                <div className="flex items-center justify-between pt-2 border-t border-gold-accent/15">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => setShowMediaInput(prev => !prev)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-ivory/70 hover:text-gold-accent hover:bg-gold-accent/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                      <span className="hidden sm:inline">Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowBookSelector(prev => !prev)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-ivory/70 hover:text-gold-accent hover:bg-gold-accent/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-gold-accent" />
                      <span className="hidden sm:inline">Recommend Book</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowFeelingSelector(prev => !prev)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-ivory/70 hover:text-gold-accent hover:bg-gold-accent/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Smile className="w-4 h-4 text-amber-400" />
                      <span className="hidden sm:inline">Feeling</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleCreatePost}
                    disabled={!postContent.trim() && !postMediaUrl.trim() && !selectedBookForPost}
                    className="px-5 py-2 rounded-xl bg-gold-accent disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gold-accent/90 text-mahogany-950 font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                  >
                    Post
                  </button>
                </div>
              </div>

              {/* Posts Feed */}
              <div className="space-y-4">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map(post => (
                    <SocioPostCard
                      key={post.id}
                      post={post}
                      currentProfile={profile}
                      onReact={handleReact}
                      onAddComment={handleAddComment}
                      onShare={handleShare}
                      onOpenBook={onOpenWriBook}
                    />
                  ))
                ) : (
                  <div className="p-12 text-center bg-mahogany-900/60 rounded-2xl border border-gold-accent/20 brass-border">
                    <Sparkles className="w-8 h-8 text-gold-accent/50 mx-auto mb-3" />
                    <h4 className="text-base font-bold text-gold-accent mb-1">Clean Feed Active</h4>
                    <p className="text-xs text-ivory/60 font-serif italic max-w-sm mx-auto">
                      All fake and mock content has been cleared. Share your thoughts or recommend a manuscript from WRI Library to start your authentic timeline.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>

        {/* Right Column: Real Trending Topics & Community Authors (Only in Feed/Reviews view) */}
        {activeTab !== 'insights' && (
          <aside className="lg:col-span-3 space-y-5 hidden lg:block">
            {/* Dynamic Real Trending Topics Card */}
            <div className="bg-mahogany-900/90 border border-gold-accent/25 rounded-2xl p-4 shadow-xl brass-border space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-gold-accent uppercase tracking-wider pb-2 border-b border-gold-accent/15">
                <TrendingUp className="w-4 h-4 text-gold-accent" />
                <span>Trending in Socio/X</span>
              </div>

              {dynamicHashtags.length > 0 ? (
                <div className="space-y-2.5">
                  {dynamicHashtags.map(t => (
                    <div 
                      key={t.tag} 
                      onClick={() => setSearchQuery(t.tag)}
                      className="group cursor-pointer hover:bg-gold-accent/5 p-1.5 rounded-lg transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gold-accent font-serif group-hover:underline">{t.tag}</span>
                        <span className="text-[10px] text-ivory/40 font-mono">{t.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-[11px] text-ivory/50 font-serif italic">
                    No active hashtags yet. Use #hashtags in your dispatches to see real trends appear here.
                  </p>
                </div>
              )}
            </div>

            {/* Real Active Network Authors */}
            <div className="bg-mahogany-900/90 border border-gold-accent/25 rounded-2xl p-4 shadow-xl brass-border space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-gold-accent uppercase tracking-wider pb-2 border-b border-gold-accent/15">
                <Users className="w-4 h-4 text-gold-accent" />
                <span>Connected Scholars</span>
              </div>

              <div className="space-y-3">
                {activeAuthors.map(u => (
                  <div key={u.handle} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-gold-accent/40" />
                        <div className="w-2 h-2 rounded-full bg-emerald-500 absolute bottom-0 right-0 border border-mahogany-950" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-ivory block font-serif leading-tight">{u.name}</span>
                          {u.handle === profile.axiometicId && (
                            <span className="text-[9px] px-1 rounded bg-gold-accent/20 text-gold-accent font-mono">You</span>
                          )}
                        </div>
                        <span className="text-[9px] text-gold-accent font-mono block leading-tight">{u.handle}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSearchQuery(u.handle)}
                      className="p-1 hover:text-gold-accent text-ivory/40 text-xs font-mono transition-colors"
                    >
                      Filter
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Story Creation Modal */}
      {showStoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-mahogany-900 border border-gold-accent/40 rounded-2xl p-6 max-w-md w-full shadow-2xl brass-border">
            <div className="flex items-center justify-between pb-3 border-b border-gold-accent/20 mb-4">
              <h3 className="text-base font-bold text-gold-accent font-serif">Add Story Dispatch</h3>
              <button onClick={() => setShowStoryModal(false)} className="text-ivory/40 hover:text-ivory">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStory} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-gold-accent/80 block mb-1">Image URL</label>
                <input
                  type="url"
                  value={storyImageUrl}
                  onChange={e => setStoryImageUrl(e.target.value)}
                  placeholder="https://... (or leave blank to use workspace image)"
                  className="w-full bg-mahogany-950 border border-gold-accent/20 rounded-xl px-3 py-2 text-xs text-ivory font-mono focus:outline-none focus:border-gold-accent"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-gold-accent/80 block mb-1">Story Caption</label>
                <input
                  type="text"
                  value={storyCaption}
                  onChange={e => setStoryCaption(e.target.value)}
                  placeholder="A thought for your network..."
                  className="w-full bg-mahogany-950 border border-gold-accent/20 rounded-xl px-3 py-2 text-xs text-ivory font-serif focus:outline-none focus:border-gold-accent"
                  maxLength={100}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gold-accent/15">
                <button
                  type="button"
                  onClick={() => setShowStoryModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-ivory/60 hover:text-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gold-accent text-mahogany-950 font-bold text-xs uppercase tracking-wider hover:bg-gold-accent/90"
                >
                  Publish Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile & Handle Customization Modal */}
      <SocioProfileModal
        profile={profile}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSave={handleSaveProfile}
      />
    </div>
  );
};
