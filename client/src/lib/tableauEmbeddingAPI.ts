// Tableau Embedding API v3 for Web Page objects
// This approach works much better for reading dashboard context

interface TableauEmbeddingContext {
  isEmbedded: boolean;
  dashboardTitle?: string;
  activeFilters: Array<{
    worksheet: string;
    field: string;
    values: string[];
  }>;
  visibleData: {
    worksheets: Array<{
      name: string;
      summary: string;
    }>;
  };
}

/**
 * Initialize Tableau Embedding API v3 connection
 */
export async function initializeTableauEmbedding(): Promise<boolean> {
  try {
    console.log("Initializing Tableau Embedding API v3...");
    
    // Check if we're embedded in a parent window
    if (window.parent === window) {
      console.log("Not embedded - running standalone");
      return false;
    }

    // Try to communicate with parent Tableau window
    return new Promise((resolve) => {
      // Set up message listener for responses from Tableau
      const messageHandler = (event: MessageEvent) => {
        if (event.data && event.data.type === 'tableau_ready') {
          console.log("Tableau parent confirmed - Embedding API v3 ready");
          window.removeEventListener('message', messageHandler);
          resolve(true);
        }
      };

      window.addEventListener('message', messageHandler);

      // Request confirmation from parent Tableau window
      try {
        window.parent.postMessage({
          type: 'request_tableau_status',
          source: 'rwa_assistant'
        }, '*');
      } catch (error) {
        console.log("Cross-origin detected - assuming Tableau embedded");
        window.removeEventListener('message', messageHandler);
        resolve(true);
      }

      // Timeout after 2 seconds - assume embedded if no response
      setTimeout(() => {
        window.removeEventListener('message', messageHandler);
        console.log("Assuming Tableau embedded environment");
        resolve(true);
      }, 2000);
    });
  } catch (error) {
    console.error("Error initializing Tableau Embedding API:", error);
    return false;
  }
}

/**
 * Get dashboard context using Embedding API v3 approaches
 */
export async function getEmbeddingContext(): Promise<TableauEmbeddingContext> {
  const context: TableauEmbeddingContext = {
    isEmbedded: window.parent !== window,
    activeFilters: [],
    visibleData: { worksheets: [] }
  };

  try {
    // Method 1: Try to read page title and content for context
    const pageTitle = document.title;
    const pageContent = document.body.innerText;
    
    context.dashboardTitle = pageTitle;

    // Method 2: Analyze visible content for dashboard context
    if (pageContent.includes('NHS')) {
      context.visibleData.worksheets.push({
        name: 'NHS Financial Overview',
        summary: 'NHS healthcare financial data with patient counts and claimed items'
      });
    }
    
    if (pageContent.includes('Margin')) {
      context.visibleData.worksheets.push({
        name: 'Margin Analysis',
        summary: 'Pharmaceutical margin analysis with drug categories and procurement data'
      });
    }

    // Method 3: Try PostMessage API for real-time data
    await requestDashboardData(context);

    console.log("Embedding context extracted:", context);
    return context;
  } catch (error) {
    console.error("Error getting embedding context:", error);
    return context;
  }
}

/**
 * Request dashboard data from parent window using PostMessage
 */
async function requestDashboardData(context: TableauEmbeddingContext): Promise<void> {
  return new Promise((resolve) => {
    // Set up listener for dashboard data response
    const dataHandler = (event: MessageEvent) => {
      if (event.data && event.data.type === 'tableau_dashboard_data') {
        try {
          const data = event.data.payload;
          if (data.title) context.dashboardTitle = data.title;
          if (data.filters) context.activeFilters = data.filters;
          if (data.worksheets) context.visibleData.worksheets = data.worksheets;
          
          console.log("Received dashboard data from parent:", data);
        } catch (error) {
          console.warn("Error processing dashboard data:", error);
        }
        
        window.removeEventListener('message', dataHandler);
        resolve();
      }
    };

    window.addEventListener('message', dataHandler);

    // Request data from parent window
    try {
      window.parent.postMessage({
        type: 'request_dashboard_data',
        source: 'rwa_assistant',
        timestamp: Date.now()
      }, '*');
    } catch (error) {
      console.log("Cannot access parent - cross-origin restrictions");
    }

    // Timeout after 1.5 seconds
    setTimeout(() => {
      window.removeEventListener('message', dataHandler);
      resolve();
    }, 1500);
  });
}

/**
 * Extract context from current page content
 */
export function extractPageContext(): {
  dashboardType: string;
  dataCategories: string[];
  metrics: string[];
} {
  const pageContent = document.body.innerText.toLowerCase();
  const pageTitle = document.title.toLowerCase();
  
  // Detect dashboard type
  let dashboardType = 'General Financial Dashboard';
  if (pageContent.includes('nhs') || pageTitle.includes('nhs')) {
    dashboardType = 'NHS Healthcare Financial Data';
  } else if (pageContent.includes('margin') || pageTitle.includes('margin')) {
    dashboardType = 'Pharmaceutical Margin Analysis';
  }

  // Extract data categories
  const dataCategories: string[] = [];
  if (pageContent.includes('patient')) dataCategories.push('Patient Data');
  if (pageContent.includes('claimed')) dataCategories.push('Claimed Items');
  if (pageContent.includes('category')) dataCategories.push('Drug Categories');
  if (pageContent.includes('procurement')) dataCategories.push('Procurement Data');

  // Extract metrics
  const metrics: string[] = [];
  if (pageContent.includes('margin')) metrics.push('Margins');
  if (pageContent.includes('revenue') || pageContent.includes('sales')) metrics.push('Revenue/Sales');
  if (pageContent.includes('cost')) metrics.push('Costs');
  if (pageContent.includes('count')) metrics.push('Counts');

  return { dashboardType, dataCategories, metrics };
}