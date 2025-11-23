import { ConversationsStore, UserConversation, ConversationMessage } from '../types';

export class KVStore {
  private kv: KVNamespace;

  constructor(kv: KVNamespace) {
    this.kv = kv;
  }

  async getConversation(userId: string): Promise<UserConversation | null> {
    try {
      const data = await this.kv.get(`conversation:${userId}`, 'json');
      return data as UserConversation | null;
    } catch (error) {
      return null;
    }
  }

  async getAllConversations(): Promise<ConversationsStore> {
    try {
      const list = await this.kv.list({ prefix: 'conversation:' });
      const conversations: ConversationsStore = {};
      
      for (const key of list.keys) {
        const userId = key.name.replace('conversation:', '');
        const conversation = await this.getConversation(userId);
        if (conversation) {
          conversations[userId] = conversation;
        }
      }
      
      return conversations;
    } catch (error) {
      return {};
    }
  }

  async addMessage(userId: string, message: ConversationMessage): Promise<void> {
    let conversation = await this.getConversation(userId);
    
    if (!conversation) {
      conversation = {
        userId,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    conversation.messages.push(message);
    conversation.updatedAt = new Date().toISOString();
    
    await this.kv.put(`conversation:${userId}`, JSON.stringify(conversation));
  }

  async clearConversation(userId: string): Promise<void> {
    const conversation = await this.getConversation(userId);
    if (conversation) {
      conversation.messages = [];
      conversation.updatedAt = new Date().toISOString();
      await this.kv.put(`conversation:${userId}`, JSON.stringify(conversation));
    }
  }

  async getMessages(userId: string): Promise<ConversationMessage[]> {
    const conversation = await this.getConversation(userId);
    return conversation?.messages || [];
  }
}

