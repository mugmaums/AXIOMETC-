export interface EmailMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  folder: 'inbox' | 'sent' | 'drafts' | 'spam' | 'trash';
  labels?: string[];
}

export interface XioUserProfile {
  axiometicId: string;
  displayName: string;
  avatarUrl: string;
}
