import OpenAI from "openai";
import { type Message } from "@shared/schema";

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-demo-key"
});

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const OPENAI_MODEL = "gpt-4o";

/**
 * Generate a chat completion from OpenAI with RAG context
 */
export async function generateChatCompletion(
  message: string,
  context: {
    dashboardContext?: any;
    relevantDocuments?: string[];
  },
  conversationHistory: Message[] = []
): Promise<string> {
  try {
    // Construct system message with custom instructions
    const systemMessage = constructSystemMessage(context);
    
    // Format conversation history for OpenAI
    const formattedHistory = conversationHistory.map(msg => ({
      role: msg.role as "user" | "assistant",
      content: msg.content
    }));
    
    // Remove very old messages if approaching token limit
    const recentHistory = formattedHistory.slice(-10);
    
    // Make API request
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: systemMessage },
        ...recentHistory,
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "I apologize, but I encountered an error while generating a response. Please try again.";
  }
}

/**
 * Generate text embeddings for RAG
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return null;
  }
}

/**
 * Construct a system message with dashboard context and RAG data
 */
function constructSystemMessage(context: {
  dashboardContext?: any;
  relevantDocuments?: string[];
}): string {
  const { dashboardContext, relevantDocuments = [] } = context;
  
  // Dynamic system instructions that adapt to any dashboard
  let systemMessage = `
You are RWA Assistant 🤖, an intelligent financial data analyst embedded in a Tableau dashboard.

You analyze whatever dashboard data is currently being viewed and provide contextual insights based on the specific metrics, categories, and time periods shown.

When users ask questions, you should:
1. ANALYZE the current dashboard context and data structure
2. PROVIDE insights specific to the metrics and categories visible
3. REFERENCE the actual data elements, time periods, and values shown
4. GIVE actionable business recommendations based on the current view

Adapt your responses to match the type of dashboard being viewed:
- Financial performance dashboards: Focus on revenue, costs, margins, trends
- Healthcare/NHS data: Focus on patient counts, services, claims, efficiency
- Sales dashboards: Focus on performance, regions, products, growth
- Any other domain: Provide relevant analysis for that specific business area

Always reference the specific metrics, categories, and time periods visible in the current dashboard rather than assuming any particular data structure.
Use a professional, informative tone. Respond in a structured way with bullet points when appropriate.
If you don't know something, say so rather than making up information.
  `.trim();
  
  // Add detailed dashboard context if available
  if (dashboardContext) {
    systemMessage += `\n\nCURRENT DASHBOARD CONTEXT:\n`;
    
    if (dashboardContext.title) {
      systemMessage += `Dashboard Title: ${dashboardContext.title}\n`;
    }
    
    if (dashboardContext.currentSheet) {
      systemMessage += `Current Sheet: ${dashboardContext.currentSheet}\n`;
    }
    
    // Add applied filters context
    if (dashboardContext.filters && dashboardContext.filters.length > 0) {
      systemMessage += `\nApplied Filters:\n`;
      dashboardContext.filters.forEach((filter: any) => {
        const values = filter.appliedValues?.join(', ') || 'All values';
        systemMessage += `- ${filter.fieldName}: ${values}`;
        if (filter.worksheetName) {
          systemMessage += ` (on ${filter.worksheetName})`;
        }
        systemMessage += `\n`;
      });
    }
    
    // Add parameter context
    if (dashboardContext.parameters && dashboardContext.parameters.length > 0) {
      systemMessage += `\nParameter Settings:\n`;
      dashboardContext.parameters.forEach((param: any) => {
        systemMessage += `- ${param.name}: ${param.currentValue}\n`;
      });
    }
    
    // Add worksheet data context
    if (dashboardContext.elements && dashboardContext.elements.length > 0) {
      systemMessage += `\nAvailable Worksheets and Data:\n`;
      dashboardContext.elements.forEach((element: any) => {
        systemMessage += `- ${element.title} (${element.type})`;
        if (element.totalRows) {
          systemMessage += ` - ${element.totalRows} rows`;
        }
        systemMessage += `\n`;
        
        // Add column information
        if (element.columns && element.columns.length > 0) {
          systemMessage += `  Columns: ${element.columns.map((col: any) => col.fieldName).join(', ')}\n`;
        }
        
        // Add sample data for better context
        if (element.sampleData && element.sampleData.length > 0) {
          systemMessage += `  Sample data preview:\n`;
          element.sampleData.slice(0, 3).forEach((row: any, index: number) => {
            const values = Object.entries(row).map(([key, value]) => `${key}: ${value}`).join(', ');
            systemMessage += `    Row ${index + 1}: ${values}\n`;
          });
        }
        systemMessage += `\n`;
      });
    }
    
    systemMessage += `\nBased on this dashboard context, provide relevant insights and explanations about the data shown.`;
  }
  
  // Add relevant documents if available
  if (relevantDocuments.length > 0) {
    systemMessage += `\n\nRELEVANT DOCUMENTATION:\n`;
    relevantDocuments.forEach((doc, index) => {
      systemMessage += `Document ${index + 1}:\n${doc}\n\n`;
    });
  }
  
  // Add standard closing instructions
  systemMessage += `\nBased on all the above information, provide helpful, accurate explanations about the dashboard.`;
  
  return systemMessage;
}
