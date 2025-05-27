import { generateEmbedding } from "./openai";

/**
 * Process document text and optionally generate embedding
 */
export async function processDocumentText(
  text: string,
  generateEmbeddings: boolean = true
): Promise<number[] | null> {
  // Preprocess text if needed (remove extra whitespace, normalize, etc.)
  const processedText = text.trim().replace(/\s+/g, ' ');
  
  // Generate embeddings if requested
  if (generateEmbeddings) {
    return await generateEmbedding(processedText);
  }
  
  return null;
}

/**
 * Split a long document into chunks suitable for embedding and retrieval
 */
export function splitDocumentIntoChunks(
  text: string,
  maxChunkLength: number = 1000,
  overlap: number = 200
): string[] {
  const chunks: string[] = [];
  let currentPosition = 0;
  
  while (currentPosition < text.length) {
    // Calculate end position
    let endPosition = Math.min(currentPosition + maxChunkLength, text.length);
    
    // If we're not at the end of the text, try to find a good break point
    if (endPosition < text.length) {
      // Look for paragraph breaks, then sentence breaks, then word breaks
      const paragraphBreak = text.lastIndexOf('\n\n', endPosition);
      const sentenceBreak = text.lastIndexOf('. ', endPosition);
      const wordBreak = text.lastIndexOf(' ', endPosition);
      
      if (paragraphBreak > currentPosition && paragraphBreak > endPosition - 200) {
        endPosition = paragraphBreak + 2; // Include the break
      } else if (sentenceBreak > currentPosition && sentenceBreak > endPosition - 150) {
        endPosition = sentenceBreak + 2; // Include the period and space
      } else if (wordBreak > currentPosition) {
        endPosition = wordBreak + 1; // Include the space
      }
    }
    
    // Extract the chunk and add to results
    chunks.push(text.slice(currentPosition, endPosition).trim());
    
    // Move position, accounting for overlap
    currentPosition = endPosition - overlap;
    if (currentPosition < 0) currentPosition = 0;
    
    // Avoid infinite loops
    if (currentPosition >= text.length) break;
  }
  
  return chunks;
}
