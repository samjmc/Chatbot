import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  messageRequestSchema, 
  messageResponseSchema,
  type MessageResponse 
} from "@shared/schema";
import { generateChatCompletion } from "./lib/openai";
import { searchSimilarDocuments } from "./lib/vectorStore";
import { processDocumentText } from "./lib/documentProcessor";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "healthy" });
  });

  // Process chat message with RAG
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const validatedData = messageRequestSchema.parse(req.body);
      const { message, conversationId, dashboardContext } = validatedData;

      // Create conversation if needed
      let activeConversationId = conversationId;
      if (!activeConversationId) {
        const title = dashboardContext?.title || "Dashboard Conversation";
        const newConversation = await storage.createConversation({
          userId: 1, // Default user for now
          title
        });
        activeConversationId = newConversation.id;
      }

      // Store user message
      const userMessage = await storage.createMessage({
        conversationId: activeConversationId,
        role: "user",
        content: message,
        context: dashboardContext || null
      });

      // Search for relevant documents (RAG)
      let relevantDocuments: string[] = [];
      
      // Generate embeddings and search for similar documents
      if (message) {
        const messageEmbedding = await processDocumentText(message, true);
        if (messageEmbedding) {
          const similarDocs = await searchSimilarDocuments(messageEmbedding, 3);
          relevantDocuments = similarDocs.map(doc => doc.content);
        }
      }

      // Prepare context for AI completion
      const context = {
        dashboardContext,
        relevantDocuments
      };

      // Generate assistant response using OpenAI
      const assistantResponse = await generateChatCompletion(
        message, 
        context,
        (await storage.getConversationMessages(activeConversationId))
      );

      // Store assistant response
      const savedResponse = await storage.createMessage({
        conversationId: activeConversationId,
        role: "assistant",
        content: assistantResponse,
        context: null
      });

      // Format response according to our schema
      const responseData: MessageResponse = {
        id: savedResponse.id,
        role: savedResponse.role,
        content: savedResponse.content,
        createdAt: savedResponse.createdAt ? savedResponse.createdAt.toISOString() : new Date().toISOString()
      };

      res.status(200).json({
        message: responseData,
        conversationId: activeConversationId
      });

    } catch (error) {
      console.error("Error in chat endpoint:", error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : "Invalid request" 
      });
    }
  });

  // Get conversation messages
  app.get("/api/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id);
      if (isNaN(conversationId)) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }

      const messages = await storage.getConversationMessages(conversationId);
      const formattedMessages = messages.map(message => ({
        id: message.id,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt ? message.createdAt.toISOString() : new Date().toISOString()
      }));

      res.status(200).json({ messages: formattedMessages });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Create an HTTP server to use with WebSockets if needed later
  const httpServer = createServer(app);

  return httpServer;
}
