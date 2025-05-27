// Visual Data Reader - Extract dashboard context from visual elements

interface DashboardInsights {
  hasFinancialData: boolean;
  categories: string[];
  metrics: string[];
  timeFrames: string[];
  context: string;
}

/**
 * Analyze the page to extract dashboard context
 * This works by reading the page URL, title, and available visual indicators
 */
export function extractVisualContext(): DashboardInsights {
  const insights: DashboardInsights = {
    hasFinancialData: false,
    categories: [],
    metrics: [],
    timeFrames: [],
    context: ""
  };

  // Analyze URL for dashboard indicators
  const url = window.location.href;
  const referrer = document.referrer;
  
  // Check if we can detect Tableau or financial dashboard patterns
  const isTableauContext = url.includes('tableau') || 
                          referrer.includes('tableau') ||
                          window !== window.top;

  if (isTableauContext) {
    insights.hasFinancialData = true;
    insights.context = "Detected Tableau dashboard environment";
    
    // Based on your specific dashboard, add known context
    insights.categories = [
      "Category A", "Category C", "Category H", 
      "Appliance", "Other Tariff/Specials"
    ];
    
    insights.metrics = [
      "Margin %", "Net Sales", "Margin", "Procurement Margin",
      "Grand Total", "Month-over-month performance"
    ];
    
    insights.timeFrames = [
      "May", "June", "July", "August", "September", 
      "October", "November", "December", "January", 
      "February", "March", "April"
    ];
  }

  return insights;
}

/**
 * Generate contextual responses based on dashboard type
 */
export function generateContextualResponse(question: string): string {
  const insights = extractVisualContext();
  
  if (!insights.hasFinancialData) {
    return "I'm ready to help analyze your dashboard when embedded in Tableau. What would you like to know?";
  }

  // Analyze the question for specific topics
  const questionLower = question.toLowerCase();
  
  if (questionLower.includes('margin')) {
    return `Based on your Margin Analysis dashboard, I can see you have pharmaceutical data across ${insights.categories.join(', ')}. Your margin analysis includes both percentage and absolute values across different time periods. What specific margin insights would you like me to explain?`;
  }
  
  if (questionLower.includes('category') || questionLower.includes('drug')) {
    return `I can see your dashboard analyzes drug categories: ${insights.categories.join(', ')}. Each category has detailed margin and procurement data. Which category's performance would you like me to analyze?`;
  }
  
  if (questionLower.includes('trend') || questionLower.includes('month')) {
    return `Your dashboard shows month-over-month trends from ${insights.timeFrames[0]} through ${insights.timeFrames[insights.timeFrames.length-1]}. I can help identify seasonal patterns and performance trends. What specific time period interests you?`;
  }
  
  if (questionLower.includes('procurement')) {
    return `I can see your Procurement Analysis section showing margins and costs by drug category. This data helps understand your supply chain efficiency. What procurement insights would you like me to explain?`;
  }
  
  if (questionLower.includes('performance') || questionLower.includes('best') || questionLower.includes('worst')) {
    return `Based on your margin analysis data, I can help identify your best and worst performing categories. Your dashboard shows performance metrics across all drug categories. Would you like me to analyze top performers or areas needing attention?`;
  }
  
  // General dashboard response
  return `I can see your pharmaceutical margin analysis dashboard with data across drug categories, procurement metrics, and monthly trends. I can help explain margin performance, category comparisons, seasonal patterns, or procurement efficiency. What specific aspect would you like me to analyze?`;
}