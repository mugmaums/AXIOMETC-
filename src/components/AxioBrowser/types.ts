export interface AxioTab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  isLoading: boolean;
  isPinned: boolean;
  isMuted: boolean;
  isIncognito: boolean;
  history: string[];
  historyIndex: number;
  mode: 'newtab' | 'search' | 'web' | 'reader';
  searchData?: any;
  content?: string;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  favicon: string;
  category?: string;
}

export interface SearchResultItem {
  title: string;
  url: string;
  domain: string;
  snippet: string;
  date?: string;
  tags?: string[];
}

export interface KnowledgePanelData {
  title: string;
  subtitle?: string;
  description: string;
  attributes?: Record<string, string>;
  source?: string;
}

export interface SearchApiResponse {
  query: string;
  aiOverview: {
    summary: string;
    keyTakeaways: string[];
    confidenceScore: number;
  };
  knowledgePanel?: KnowledgePanelData;
  results: SearchResultItem[];
  peopleAlsoAsk?: Array<{ question: string; answer: string }>;
  relatedQueries?: string[];
}

export interface AxioExtension {
  id: string;
  name: string;
  version: string;
  description: string;
  icon: string;
  enabled: boolean;
}
