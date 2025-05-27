import { apiRequest } from "@/lib/queryClient";

interface VectorDocument {
  id: number;
  title: string;
  content: string;
  embedding?: number[];
  metadata?: Record<string, any>;
}

/**
 * Simple client-side interface to the vector store
 */
export async function searchDocuments(query: string, limit: number = 3): Promise<VectorDocument[]> {
  try {
    const response = await apiRequest('POST', '/api/search', {
      query,
      limit
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error searching documents:', error);
    return [];
  }
}

/**
 * Add a document to the vector store
 */
export async function addDocument(
  title: string,
  content: string,
  metadata: Record<string, any> = {}
): Promise<VectorDocument | null> {
  try {
    const response = await apiRequest('POST', '/api/documents', {
      title,
      content,
      metadata
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error adding document:', error);
    return null;
  }
}

/**
 * Get all documents
 */
export async function getDocuments(): Promise<VectorDocument[]> {
  try {
    const response = await apiRequest('GET', '/api/documents');
    return await response.json();
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
}
