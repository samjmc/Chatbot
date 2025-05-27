import ChatWidget from "@/components/ChatWidget";
import { useEffect, useState } from "react";

interface TableauDashboardData {
  title: string;
  sheets: Array<{
    name: string;
    fields: string[];
    marks?: any[];
  }>;
  filters: Array<{
    field: string;
    values: string[];
  }>;
  parameters: Array<{
    name: string;
    value: string;
  }>;
}

export default function TableauWidget() {
  const [dashboardData, setDashboardData] = useState<TableauDashboardData | null>(null);
  const [isTableauReady, setIsTableauReady] = useState(false);

  useEffect(() => {
    const initializeTableauAPI = async () => {
      try {
        console.log("Initializing Tableau Extensions API...");
        
        // Check if we're running inside Tableau
        if (window.parent !== window) {
          console.log("Detected embedding in parent window");
          
          // Check for Tableau Extensions API availability first
          if (!window.tableau) {
            console.warn("Tableau Extensions API not found. Are you using Web Page instead of Extension?");
            throw new Error("Tableau API not available");
          }

          // Try to initialize Tableau Extensions API properly
          if (window.tableau.extensions) {
            console.log("Tableau Extensions API found, initializing...");
            
            await window.tableau.extensions.initializeAsync();
            console.log("Tableau Extensions API initialized successfully");
            
            // Access dashboard content through Extensions API
            const dashboard = window.tableau.extensions.dashboardContent.dashboard;
            const worksheets = dashboard.worksheets;
              
            const data: TableauDashboardData = {
              title: dashboard.name || "Dashboard",
              sheets: [],
              filters: [],
              parameters: []
            };
            
            // Get worksheet information from Extensions API
            for (const worksheet of worksheets) {
              try {
                console.log(`Processing worksheet: ${worksheet.name}`);
                
                // Get summary data from the worksheet
                const summaryData = await worksheet.getSummaryDataAsync();
                const columns = summaryData.getColumns();
                const fields = columns.map((col: any) => col.getFieldName());
                
                data.sheets.push({
                  name: worksheet.name,
                  fields: fields,
                  marks: summaryData.getData().slice(0, 5) // Sample data
                });
                
                // Get filters for this worksheet
                const filters = await worksheet.getFiltersAsync();
                for (const filter of filters) {
                  data.filters.push({
                    field: filter.fieldName,
                    values: filter.appliedValues.map((v: any) => v.value)
                  });
                }
              } catch (e) {
                console.log(`Could not access data for worksheet ${worksheet.name}:`, e);
              }
            }
            
            // Get dashboard parameters
            try {
              const parameters = await dashboard.getParametersAsync();
              data.parameters = parameters.map((param: any) => ({
                name: param.name,
                value: param.currentValue.value
              }));
            } catch (e) {
              console.log("Could not access parameters:", e);
            }
            
            console.log("Dashboard data extracted:", data);
            setDashboardData(data);
            setIsTableauReady(true);
            return;
          }
          
          // Fallback: Try to read from parent window content
          try {
            const parentContent = window.parent.document.body.innerText;
            const fallbackData: TableauDashboardData = {
              title: "Embedded Dashboard",
              sheets: [{
                name: "Financial Overview",
                fields: ["Category", "Margin", "Sales", "Date"],
                marks: []
              }],
              filters: [],
              parameters: []
            };
            
            // Detect data type from content
            if (parentContent.includes('NHS') || parentContent.includes('Patient')) {
              fallbackData.sheets[0].name = "NHS Financial Data";
              fallbackData.sheets[0].fields = ["Patient Count", "Claimed Items", "Financial Overview"];
            } else if (parentContent.includes('Margin') || parentContent.includes('Drug')) {
              fallbackData.sheets[0].name = "Pharmaceutical Margins";
              fallbackData.sheets[0].fields = ["Drug Category", "Margin %", "Procurement Cost"];
            }
            
            console.log("Using fallback dashboard data:", fallbackData);
            setDashboardData(fallbackData);
          } catch (e) {
            console.log("Cross-origin restrictions prevent reading parent content");
          }
        }
        
        setIsTableauReady(true);
      } catch (error) {
        console.error("Error initializing Tableau API:", error);
        setIsTableauReady(true);
      }
    };

    // Add Tableau Extensions API script with proper CDN
    const script = document.createElement('script');
    script.src = 'https://tableau.extensionscdn.com/tableau.extensions.1.latest.js';
    script.onload = initializeTableauAPI;
    script.onerror = () => {
      console.warn("Tableau Extensions API not available, proceeding without it");
      setIsTableauReady(true);
    };
    document.head.appendChild(script);

    // Fallback timer
    setTimeout(initializeTableauAPI, 2000);
  }, []);

  return (
    <div className="w-full h-full bg-transparent">
      <ChatWidget 
        tableauReady={isTableauReady} 
        dashboardData={dashboardData}
      />
    </div>
  );
}