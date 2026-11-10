import { AUDIENCE, type AudienceType } from '@/core/auth/permissions.constants';

export const CHAT_SENDER_ROLE = {
  INTERNAL: AUDIENCE.INTERNAL,
  EXTERNAL: AUDIENCE.EXTERNAL
} as const;

export type SenderRole = AudienceType;
export type ChatSenderRole = SenderRole;
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
  isOnline?: boolean;
  messages?: ChatMessage[];
  createdAt?: string;
}

export interface ChatUnreadSummary {
  totalUnread: number;
  awaitingReplyCount: number;
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

export interface ChatCandidateUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  medicalRecordNumber?: string | null;
  existingConversationId?: string | null;
}

export interface ChatCandidateResponse {
  data: ChatCandidateUser[];
}
