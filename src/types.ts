export type BlockType = 'text' | 'picture' | 'video' | 'link' | 'button' | 'file' | 'tool' | 'analysis' | 'chart' | 'simulator';

export interface BaseBlock {
  id: string;
  type: BlockType;
  title: string;
  pinned?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  category?: string;
  content: string;
  readTime?: string;
}

export interface PictureBlock extends BaseBlock {
  type: 'picture';
  imageUrl: string;
  caption?: string;
  aspectRatio: '16:9' | '4:3' | '1:1' | 'natural';
}

export interface VideoBlock extends BaseBlock {
  type: 'video';
  videoUrl: string;
  caption?: string;
  aspectRatio?: '16:9' | '4:3' | '9:16';
  duration?: string;
}

export interface LinkBlock extends BaseBlock {
  type: 'link';
  url: string;
  description?: string;
  domain?: string;
  badgeText?: string;
  clicks: number;
}

export type DynamicButtonActionType =
  | 'action_link'
  | 'trigger_alert'
  | 'submit_form'
  | 'counter'
  | 'copy_text'
  | 'toggle_note';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline';

export interface AlertConfig {
  title: string;
  message: string;
  alertType: 'info' | 'success' | 'announcement';
}

export interface FormConfig {
  formType: 'newsletter' | 'feedback' | 'inquiry';
  promptLabel: string;
  submitSuccessMessage: string;
}

export interface ActiveButtonBlock extends BaseBlock {
  type: 'button';
  buttonText: string;
  buttonType: DynamicButtonActionType;
  actionPayload?: string;
  count: number;
  variant: ButtonVariant;
  iconName: string;
  description?: string;
  alertConfig?: AlertConfig;
  formConfig?: FormConfig;
}

export interface UploadedFileRecord {
  id: string;
  name: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  category: 'image' | 'document' | 'archive' | 'media' | 'other';
  uploadedAt: string;
}

export interface FileBlock extends BaseBlock {
  type: 'file';
  fileUrl: string;
  fileName: string;
  fileSizeFormatted: string;
  mimeType: string;
  category: 'image' | 'document' | 'archive' | 'media' | 'other';
  description?: string;
}

export interface ToolBlock extends BaseBlock {
  type: 'tool';
  toolName: string;
  toolType: 'calculator' | 'converter' | 'generator' | 'code_sandbox';
  description?: string;
  initialValue?: string;
}

export interface AnalysisBlock extends BaseBlock {
  type: 'analysis';
  summaryMetrics: Array<{ label: string; value: string; change?: string }>;
  tableData: { headers: string[]; rows: string[][] };
  insights: string[];
}

export interface ChartBlock extends BaseBlock {
  type: 'chart';
  chartType: 'bar' | 'line' | 'radar';
  dataPoints: Array<{ label: string; value: number; secondaryValue?: number }>;
  unit?: string;
}

export interface SimulatorBlock extends BaseBlock {
  type: 'simulator';
  simType: 'physics' | 'financial' | 'neural' | 'quantum';
  parameters: Array<{ id: string; label: string; min: number; max: number; step: number; default: number; unit?: string }>;
  outputMetricName: string;
}

export type Block = 
  | TextBlock 
  | PictureBlock 
  | VideoBlock
  | LinkBlock 
  | ActiveButtonBlock 
  | FileBlock 
  | ToolBlock 
  | AnalysisBlock 
  | ChartBlock 
  | SimulatorBlock;


export interface SiteSettings {
  siteTitle: string;
  tagline: string;
  bio: string;
  creatorName: string;
  creatorAvatar: string;
  headerBanner: string;
  themeAccent: 'blue' | 'emerald' | 'amber' | 'violet' | 'slate';
  announcement?: string;
  lastUpdated: string;
}

export interface VisitorMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export interface FormSubmissionRecord {
  id: string;
  buttonId: string;
  buttonTitle: string;
  formType: string;
  data: Record<string, string>;
  submittedAt: string;
}

export interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  creator: string;
  timestamp: string;
  type?: 'creation' | 'announcement' | 'system' | 'emergency';
  targetBlockId?: string;
  radiusKm?: number; // 0 or undefined = Global (all users & non-users)
  location?: {
    lat: number;
    lng: number;
    name?: string;
  };
  forceTransmission?: boolean;
  priority?: 'critical' | 'high' | 'normal';
}

export interface LiveUrlRecord {
  id: string;
  slug: string;
  title: string;
  description?: string;
  url: string;
  fullUrl?: string;
  targetBlockId?: string;
  createdAt: string;
  expiresAt: string;
  daysRemaining: number;
  creator: 'vaelourix' | 'vaelourix_2' | 'developer' | 'system';
}

export interface SiteData {
  settings: SiteSettings;
  blocks: Block[];
  messages: VisitorMessage[];
  uploadedFiles: UploadedFileRecord[];
  formSubmissions: FormSubmissionRecord[];
  broadcasts?: BroadcastNotification[];
  activeBroadcast?: BroadcastNotification | null;
  liveUrls?: LiveUrlRecord[];
  publishedBooks?: BookRecord[];
}

export interface BookRecord {
  id: string;
  userId?: string;
  title: string;
  author: string;
  sourceType: 'word' | 'ppt';
  chapters: Chapter[];
  coverDesign: {
    front: string;
    back: string;
    spine: string;
    accentColor: string;
    style: 'leather' | 'modern' | 'minimal' | 'classic';
  };
  synopsis: string;
  publishedAt: string;
  pageCount: number;
  progress?: number; // 0 to 1
  price?: number;
  qrCodeUrl?: string;
  subtitle?: string;
  publisher?: string;
  publishedDate?: string;
  categories?: string[];
  isbn?: string;
  language?: string;
  previewLink?: string;
}

export interface Chapter {
  id: string;
  title: string;
  content: string; // HTML or Markdown
  pageNumber: number;
}

export interface WebSocketMessage {
  type: 'WS_INIT' | 'WS_UPDATE' | 'NOTIFICATION_EVENT';
  section?: 'blocks' | 'settings' | 'files' | 'messages' | 'forms' | 'broadcasts' | 'urls' | 'all';
  updatedBlockId?: string;
  data?: SiteData;
  id?: string;
  title?: string;
  message?: string;
  timestamp: number | string;
}

