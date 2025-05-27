import { useState, useEffect } from "react";
import ChatWidget from "@/components/ChatWidget";
import { getDashboardContext } from "@/lib/tableauApi";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { setDashboardChangeCallback } from "@/lib/tableauApi";

export default function Home() {
  const [isTableauContext, setIsTableauContext] = useState<boolean>(false);
  const [dashboardContext, setDashboardContext] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  
  // Mutation for dashboard context refresh
  const refreshContextMutation = useMutation({
    mutationFn: async () => {
      const context = await getDashboardContext();
      setDashboardContext(context);
      return context;
    }
  });

  // Check if we're in a Tableau dashboard and get initial context
  useEffect(() => {
    const checkContext = async () => {
      try {
        const context = await getDashboardContext();
        if (context) {
          setIsTableauContext(true);
          setDashboardContext(context);
        }
      } catch (error) {
        console.log("Not running in Tableau context or error:", error);
        setIsTableauContext(false);
        
        // Use mock data for development/preview
        setDashboardContext({
          title: "Sales Performance Dashboard",
          url: "https://tableau-server/views/sales-dashboard",
          elements: [
            { title: "Monthly Sales Trend", type: "bar-chart" },
            { title: "Regional Performance", type: "pie-chart" },
            { title: "Top Products by Revenue", type: "bar-chart" }
          ]
        });
      }
    };
    
    checkContext();
  }, []);
  
  // Listen for Tableau dashboard changes
  useEffect(() => {
    const handleDashboardChange = async () => {
      if (isTableauContext) {
        refreshContextMutation.mutate();
      }
    };
    
    // Set up event listener for tableau context changes
    setDashboardChangeCallback(handleDashboardChange);
    
    return () => {
      // Clean up event listener
    };
  }, [isTableauContext, refreshContextMutation]);
  
  return (
    <div className="relative min-h-screen bg-background">
      {!isTableauContext && (
        <div className="p-4 max-w-3xl mx-auto">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  This application is designed to be embedded in a Tableau dashboard. You are viewing it in standalone mode.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Tableau Dashboard Assistant</h1>
            <p className="mb-4">This chat assistant helps users understand Tableau dashboards by:</p>
            <ul className="list-disc ml-6 mb-6 space-y-2">
              <li>Explaining visualizations and metrics</li>
              <li>Highlighting insights from the data</li>
              <li>Answering questions about the dashboard content</li>
              <li>Providing context from relevant documentation</li>
            </ul>
            <div className="flex space-x-4">
              <Button 
                onClick={() => setIsChatOpen(true)}
                className="bg-tableau-blue hover:bg-tableau-blue/90"
              >
                Open Chat Widget
              </Button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Integration Instructions</h2>
            <ol className="list-decimal ml-6 space-y-2">
              <li>Add this extension to your Tableau dashboard</li>
              <li>Position the extension where you want the chat button to appear</li>
              <li>Configure the extension settings if needed</li>
              <li>Users can then click the chat button to get assistance</li>
            </ol>
          </div>
        </div>
      )}
      
      <ChatWidget 
        isOpen={isChatOpen} 
        setIsOpen={setIsChatOpen}
        dashboardContext={dashboardContext}
      />
    </div>
  );
}
