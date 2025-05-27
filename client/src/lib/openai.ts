import { apiRequest } from "@/lib/queryClient";

/**
 * Send a message to the backend chat API
 */
export async function sendChatMessage(
  message: string,
  conversationId: number | null = null,
  dashboardContext: any = null
) {
  try {
    const response = await apiRequest('POST', '/api/chat', {
      message,
      conversationId,
      dashboardContext
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

/**
 * Process dashboard elements to extract meaningful context
 */
export function extractDashboardContext(
  dashboardElements: any[]
): Record<string, any> {
  if (!dashboardElements || !Array.isArray(dashboardElements)) {
    return {};
  }
  
  // Extract relevant information from dashboard elements
  const processedElements = dashboardElements.map(element => {
    // Focus on the most important attributes 
    // (will vary based on actual Tableau element structure)
    return {
      title: element.title || element.name,
      type: element.type || element.chartType,
      data: element.data || element.summary,
      // Add any other relevant fields
    };
  });
  
  return {
    elements: processedElements,
    timestamp: new Date().toISOString()
  };
}
