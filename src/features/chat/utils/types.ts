export type SenderRole = 'customer' | 'admin';
export type ConversationStatus = 'open' | 'closed';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderRole: SenderRole;
  senderUserId?: string | null;
  senderName: string;
  clientMessageId?: string | null;
  body: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  status: ConversationStatus;
  userId?: string | null;
  patientId?: string | null;
  guestId?: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  medicalRecordNumber?: string | null;
  lastMessageAt: string;
  lastMessagePreview?: string | null;
  awaitingReply: boolean;
  unreadCount?: number;
  messages?: ChatMessage[];
}

export interface ConversationListResponse {
  data?: Conversation[];
  items?: Conversation[];
  hasMore: boolean;
  nextCursor?: string | null;
}

export interface MessageListResponse {
  data?: ChatMessage[];
  items?: ChatMessage[];
  hasMore: boolean;
  nextCursor?: string | null;
}
