export interface MediationAppointment {
  nombre: string;
  fecha: string;
  hora: string;
  lugar: string;
  mediador?: string;
  notasAdicionales?: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface UserConversation {
  userId: string;
  phoneNumber?: string;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationsStore {
  [userId: string]: UserConversation;
}
