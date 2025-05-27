import { 
  users, 
  type User, 
  type InsertUser, 
  conversations, 
  type Conversation, 
  type InsertConversation,
  messages,
  type Message,
  type InsertMessage,
  documents,
  type Document,
  type InsertDocument
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Conversation operations
  getConversation(id: number): Promise<Conversation | undefined>;
  getUserConversations(userId: number): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  
  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  getConversationMessages(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Document operations (for RAG)
  getDocument(id: number): Promise<Document | undefined>;
  getDocuments(): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  searchSimilarDocuments(embedding: number[], limit?: number): Promise<Document[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private documents: Map<number, Document>;
  private userIdCounter: number;
  private conversationIdCounter: number;
  private messageIdCounter: number;
  private documentIdCounter: number;

  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.documents = new Map();
    this.userIdCounter = 1;
    this.conversationIdCounter = 1;
    this.messageIdCounter = 1;
    this.documentIdCounter = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Conversation operations
  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getUserConversations(userId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(
      (conversation) => conversation.userId === userId,
    );
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.conversationIdCounter++;
    const now = new Date();
    const conversation: Conversation = { 
      ...insertConversation, 
      id, 
      createdAt: now, 
      updatedAt: now,
      title: insertConversation.title || "New Conversation" 
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getConversationMessages(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((message) => message.conversationId === conversationId)
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const now = new Date();
    const message: Message = { 
      ...insertMessage, 
      id,
      createdAt: now 
    };
    this.messages.set(id, message);
    
    // Update conversation's updatedAt
    const conversation = this.conversations.get(message.conversationId);
    if (conversation) {
      conversation.updatedAt = now;
      this.conversations.set(conversation.id, conversation);
    }
    
    return message;
  }

  // Document operations (for RAG)
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const now = new Date();
    const document: Document = { 
      ...insertDocument, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.documents.set(id, document);
    return document;
  }

  // Search for similar documents using cosine similarity
  async searchSimilarDocuments(embedding: number[], limit: number = 3): Promise<Document[]> {
    const documents = Array.from(this.documents.values());
    
    // Simple implementation of cosine similarity
    const documentsWithScores = documents
      .filter(doc => doc.embedding !== null)
      .map(doc => {
        const docEmbedding = doc.embedding as number[];
        let similarity = 0;
        
        if (docEmbedding && docEmbedding.length === embedding.length) {
          // Calculate dot product
          let dotProduct = 0;
          let magnitude1 = 0;
          let magnitude2 = 0;
          
          for (let i = 0; i < embedding.length; i++) {
            dotProduct += embedding[i] * docEmbedding[i];
            magnitude1 += embedding[i] * embedding[i];
            magnitude2 += docEmbedding[i] * docEmbedding[i];
          }
          
          magnitude1 = Math.sqrt(magnitude1);
          magnitude2 = Math.sqrt(magnitude2);
          
          // Calculate cosine similarity
          if (magnitude1 > 0 && magnitude2 > 0) {
            similarity = dotProduct / (magnitude1 * magnitude2);
          }
        }
        
        return { doc, similarity };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => item.doc);
    
    return documentsWithScores;
  }
}

export const storage = new MemStorage();
