import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model from the original schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Conversations model
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  title: text("title").default("New Conversation"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  userId: true,
  title: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// Messages model
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: serial("conversation_id").references(() => conversations.id),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  context: jsonb("context"), // Dashboard context data
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  conversationId: true,
  role: true,
  content: true,
  context: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Documents model (for RAG)
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  embedding: jsonb("embedding"), // Vector embedding
  metadata: jsonb("metadata"), // Additional info about the document
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  title: true,
  content: true,
  embedding: true,
  metadata: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// Message request and response schemas for API
export const messageRequestSchema = z.object({
  message: z.string().min(1),
  conversationId: z.number().optional(),
  dashboardContext: z.object({
    url: z.string().optional(),
    title: z.string().optional(),
    currentSheet: z.string().optional(),
    filters: z.array(z.object({
      fieldName: z.string(),
      appliedValues: z.array(z.string()),
    })).optional(),
    parameters: z.array(z.object({
      name: z.string(),
      currentValue: z.string(),
    })).optional(),
    elements: z.array(z.any()).optional(),
    domSnapshot: z.string().optional(),
  }).optional().nullable(),
});

export type MessageRequest = z.infer<typeof messageRequestSchema>;

export const messageResponseSchema = z.object({
  id: z.number(),
  role: z.string(),
  content: z.string(),
  createdAt: z.string(),
});

export type MessageResponse = z.infer<typeof messageResponseSchema>;
