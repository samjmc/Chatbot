// Dashboard Data Extractor - Multiple methods to read Tableau data

interface FinancialMetrics {
  category: string;
  margin: number;
  marginPercent: number;
  netSales: number;
  month: string;
}

/**
 * Extract dashboard data using multiple detection methods
 */
export async function extractDashboardData(): Promise<{
  connected: boolean;
  data: FinancialMetrics[];
  context: string;
}> {
  
  // Method 1: Try to read from URL parameters (if Tableau passes data via URL)
  const urlData = extractFromURL();
  if (urlData.connected) {
    return urlData;
  }

  // Method 2: Try to read from localStorage (if Tableau stores data there)
  const storageData = extractFromStorage();
  if (storageData.connected) {
    return storageData;
  }

  // Method 3: Try to detect from page title or other indicators
  const contextData = extractFromContext();
  if (contextData.connected) {
    return contextData;
  }

  // Method 4: Use PostMessage API to communicate with parent Tableau window
  const messageData = await extractViaPostMessage();
  if (messageData.connected) {
    return messageData;
  }

  // Return ready state for when embedded in Tableau
  return {
    connected: false,
    data: [],
    context: "Ready to analyze your financial dashboard data when embedded in Tableau"
  };
}

/**
 * Extract data from URL parameters
 */
function extractFromURL(): { connected: boolean; data: FinancialMetrics[]; context: string } {
  try {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('tableauData');
    
    if (data) {
      const parsedData = JSON.parse(decodeURIComponent(data));
      return {
        connected: true,
        data: parsedData,
        context: "Connected via URL parameters"
      };
    }
  } catch (error) {
    console.log("No URL data available");
  }
  
  return { connected: false, data: [], context: "" };
}

/**
 * Extract data from localStorage
 */
function extractFromStorage(): { connected: boolean; data: FinancialMetrics[]; context: string } {
  try {
    const data = localStorage.getItem('tableauDashboardData');
    if (data) {
      const parsedData = JSON.parse(data);
      return {
        connected: true,
        data: parsedData,
        context: "Connected via localStorage"
      };
    }
  } catch (error) {
    console.log("No localStorage data available");
  }
  
  return { connected: false, data: [], context: "" };
}

/**
 * Extract context from page indicators
 */
function extractFromContext(): { connected: boolean; data: FinancialMetrics[]; context: string } {
  // Check if we're embedded in an iframe (indicates Tableau embedding)
  if (window !== window.top) {
    // Check for Tableau-specific indicators
    const referrer = document.referrer;
    const isTableauEmbedded = referrer.includes('tableau') || 
                             window.location.href.includes('tableau') ||
                             document.title.includes('tableau');
    
    if (isTableauEmbedded) {
      return {
        connected: true,
        data: [],
        context: "Embedded in Tableau dashboard - ready to analyze your margin data"
      };
    }
  }
  
  return { connected: false, data: [], context: "" };
}

/**
 * Try to communicate with parent Tableau window via PostMessage
 */
function extractViaPostMessage(): Promise<{ connected: boolean; data: FinancialMetrics[]; context: string }> {
  return new Promise((resolve) => {
    if (window === window.top) {
      resolve({ connected: false, data: [], context: "" });
      return;
    }

    // Set up listener for response
    const messageHandler = (event: MessageEvent) => {
      if (event.data && event.data.type === 'tableauData') {
        window.removeEventListener('message', messageHandler);
        resolve({
          connected: true,
          data: event.data.data || [],
          context: "Connected via PostMessage API"
        });
      }
    };

    window.addEventListener('message', messageHandler);

    // Request data from parent window
    window.parent.postMessage({
      type: 'requestTableauData',
      source: 'rwa-assistant'
    }, '*');

    // Timeout after 2 seconds
    setTimeout(() => {
      window.removeEventListener('message', messageHandler);
      resolve({ connected: false, data: [], context: "" });
    }, 2000);
  });
}

/**
 * Detect if we're running in a Tableau environment
 */
export function isInTableauEnvironment(): boolean {
  // Multiple detection methods
  return window !== window.top || // In iframe
         document.referrer.includes('tableau') ||
         window.location.href.includes('tableau') ||
         document.title.toLowerCase().includes('tableau') ||
         !!document.querySelector('[data-tableau]') ||
         !!(window as any).tableau;
}