import { storage } from "../storage";
import { generateEmbedding } from "./openai";
import { type Document } from "@shared/schema";

/**
 * Search for similar documents using embeddings
 */
export async function searchSimilarDocuments(
  embedding: number[],
  limit: number = 3
): Promise<Document[]> {
  // Use the storage implementation to search
  return await storage.searchSimilarDocuments(embedding, limit);
}

/**
 * Add a document to the vector store
 */
export async function addDocument(
  title: string,
  content: string,
  metadata: Record<string, any> = {}
): Promise<Document | null> {
  try {
    // Generate embedding
    const embedding = await generateEmbedding(content);
    
    if (!embedding) {
      console.error("Failed to generate embedding for document");
      return null;
    }
    
    // Create document with embedding
    const document = await storage.createDocument({
      title,
      content,
      embedding,
      metadata
    });
    
    return document;
  } catch (error) {
    console.error("Error adding document to vector store:", error);
    return null;
  }
}

/**
 * Initialize with some sample documents for explanations
 */
export async function initializeVectorStore(): Promise<void> {
  const sampleDocuments = [
    {
      title: "Understanding Bar Charts",
      content: "Bar charts display categorical data with rectangular bars. The heights of the bars represent the values. Horizontal bar charts are useful when category labels are long. Look for the tallest/shortest bars to identify max/min values."
    },
    {
      title: "Reading Line Charts",
      content: "Line charts display data points connected by straight line segments. They're ideal for showing trends over time. Look for slopes to understand rate of change, peaks/valleys for maximum/minimum values, and intersections for when series cross."
    },
    {
      title: "Interpreting Pie Charts",
      content: "Pie charts show the proportion of categories as slices of a circle. The entire circle represents 100% of the data. Each slice's size corresponds to its percentage of the whole. Larger slices represent higher percentages."
    },
    {
      title: "Dashboard KPI Analysis",
      content: "Key Performance Indicators (KPIs) are critical metrics that measure success. When analyzing KPIs, compare against targets, look for trends over time, and identify correlations with other metrics. Red typically indicates below target, green above target."
    },
    {
      title: "Common Tableau Terms",
      content: "Measures: Numeric values that can be aggregated. Dimensions: Categorical fields used for grouping. Filters: Limit the data shown. Parameters: User inputs that change the visualization. Worksheets: Individual visualizations. Dashboards: Collections of worksheets."
    }
  ];
  
  // Add each document to the vector store
  for (const doc of sampleDocuments) {
    await addDocument(doc.title, doc.content);
  }
  
  console.log("Vector store initialized with sample documents");
}
