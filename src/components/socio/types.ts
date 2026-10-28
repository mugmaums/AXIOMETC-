export interface SocioProfile {
  id: string; // Firebase Auth UID or local ID
  axiometicId: string; // e.g. "mugmaums@axiometic"
  displayName: string;
  avatar: string;
  email: string;
  bio: string;
  coverPhoto: string;
  accountType: 'personal' | 'business' | 'creator';
  followersCount: number;
  followingCount: number;
  friendsCount: number;
  joinedAt: string;
  verified: boolean;
  companyName?: string;
  websiteUrl?: string;
  officialAddress?: string;
  contactNumber?: string;
}

export interface SocioComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAxiometicId: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
}

export interface SocioBookRecommendation {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  synopsis: string;
  accentColor?: string;
}

export interface SocioPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAxiometicId: string;
  authorAvatar: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  bookRecommendation?: SocioBookRecommendation;
  feeling?: string;
  reactions: {
    like: number;
    love: number;
    insight: number;
    fire: number;
  };
  userReaction?: 'like' | 'love' | 'insight' | 'fire' | null;
  comments: SocioComment[];
  sharesCount: number;
  createdAt: string;
  privacy: 'public' | 'friends' | 'private';
  pinned?: boolean;
}

export interface SocioStory {
  id: string;
  authorName: string;
  authorAvatar: string;
  imageUrl: string;
  caption?: string;
  timestamp: string;
  unread: boolean;
}

export type InteractionType = 
  | 'book_viewed'
  | 'book_read'
  | 'book_published'
  | 'post_created'
  | 'post_shared'
  | 'comment_posted'
  | 'comment_added'
  | 'reaction_given'
  | 'reaction_received'
  | 'profile_updated';

export interface SocioInteraction {
  id: string;
  type: InteractionType;
  title: string;
  description: string;
  timestamp: string;
  targetId?: string;
  axiometicId: string;
  metadata?: Record<string, any>;
}

export interface SocioInsights {
  axiometicId: string;
  totalBookViews: number;
  totalPosts: number;
  totalReactionsReceived: number;
  totalCommentsGiven: number;
  followersCount: number;
  followingCount: number;
  reactionsBreakdown: {
    like: number;
    love: number;
    insight: number;
    fire: number;
  };
  bookEngagement: Array<{
    bookId: string;
    title: string;
    views: number;
    completionRate: number;
    recommendedCount: number;
  }>;
  recentInteractions: SocioInteraction[];
}

