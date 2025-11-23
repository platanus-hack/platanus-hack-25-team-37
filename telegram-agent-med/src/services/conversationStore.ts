import fs from 'fs';
import path from 'path';
import { ConversationsStore, UserConversation, ConversationMessage } from '../types';

export class ConversationStore {
  private filePath: string;
  private conversations: ConversationsStore = {};

  constructor(filePath: string = './conversations.json') {
    this.filePath = filePath;
    this.loadConversations();
  }

  private loadConversations(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        this.conversations = JSON.parse(data);
      } else {
        this.saveConversations();
      }
    } catch (error) {
      this.conversations = {};
    }
  }

  private saveConversations(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.conversations, null, 2));
    } catch (error) {
      // Error silencioso al guardar
    }
  }

  addMessage(userId: string, message: ConversationMessage): void {
    if (!this.conversations[userId]) {
      this.conversations[userId] = {
        userId,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    this.conversations[userId].messages.push(message);
    this.conversations[userId].updatedAt = new Date().toISOString();
    this.saveConversations();
  }

  getConversation(userId: string): UserConversation | undefined {
    return this.conversations[userId];
  }

  getMessages(userId: string): ConversationMessage[] {
    return this.conversations[userId]?.messages || [];
  }

  setPhoneNumber(userId: string, phoneNumber: string): void {
    if (this.conversations[userId]) {
      this.conversations[userId].phoneNumber = phoneNumber;
      this.saveConversations();
    }
  }

  clearConversation(userId: string): void {
    if (this.conversations[userId]) {
      this.conversations[userId].messages = [];
      this.conversations[userId].updatedAt = new Date().toISOString();
      this.saveConversations();
    }
  }

  getAllConversations(): ConversationsStore {
    return this.conversations;
  }
}
