export type Attachment = {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
};

export type MessageType = 'text' | 'audio' | 'status_update' | 'image';

export type Message = {
  id: string;
  sender: 'user' | 'contact' | 'system';
  author: string;
  text: string;
  timestamp: string;
  type?: MessageType;
  audioDuration?: string;
  statusUpdateText?: string;
  attachments?: Attachment[];
};

export type StepperIconType =
  | 'lead'
  | 'contact'
  | 'qualified'
  | 'booked'
  | 'completed'
  | 'payment'
  | 'prescription'
  | 'doctor';

export type StepperTimelineItem = {
  id: string | number;
  title: string;
  subtitle: string;
  date: string;
  iconType: StepperIconType;
  hasUserAvatar?: boolean;
  userAvatar?: string;
  hasAction?: boolean;
  actionLabel?: string;
};

export type Conversation = {
  id: string;
  name: string;
  id_pasien: string;
  avatar: string;
  time: string;
  status: string;
  unread: number;
  phone: string;
  email: string;
  gender: string;
  age: number;
  dpjp: {
    name: string;
    specialty: string;
    avatar: string;
  };
  messages: Message[];
  quickReplies: string[];
  timeline: StepperTimelineItem[];
};
