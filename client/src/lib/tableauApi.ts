// Tableau Extensions API integration for dashboard context detection

declare global {
  interface Window {
    tableau: any;
  }
}

interface TableauDashboardContext {
  title: string;
  url: string;
  currentSheet: string;
  activeWorksheet: string;
  filters: Array<{
    fieldName: string;
    appliedValues: string[];
    filterType: string;
    worksheetName: string;
  }>;
  parameters: Array<{
    name: string;
    currentValue: string;
    dataType: string;
    allowableValues?: string[];
  }>;
  elements: Array<{
    title: string;
    type: string;
    columns?: Array<{
      fieldName: string;
      dataType: string;
    }>;
    sampleData?: Record<string, any>[];
    totalRows?: number;
  }>;
}

let tableauViz: any = null;
let dashboardChangeCallback: (() => void) | null = null;
let changeTimeout: any = null;

/**
 * Initialize the Tableau Extensions API for dashboard context detection
 */
export async function initializeTableauExtension(): Promise<boolean> {
  try {
    console.log("Checking for Tableau Extensions API...");
    
    // Wait for Tableau API to be available
    const waitForTableau = () => new Promise<void>((resolve) => {
      const checkTableau = () => {
        if (window.tableau && window.tableau.extensions) {
          resolve();
        } else {
          setTimeout(checkTableau, 100);
        }
      };
      checkTableau();
    });

    // Give up to 5 seconds for Tableau to load
    const timeout = new Promise<void>((_, reject) => {
      setTimeout(() => reject(new Error('Tableau API timeout')), 5000);
    });

    try {
      await Promise.race([waitForTableau(), timeout]);
    } catch (error) {
      console.log("Tableau Extensions API not detected");
      return false;
    }
    
    // Check if we're in a Tableau environment with Extensions API
    if (typeof window !== 'undefined' && window.tableau && window.tableau.extensions) {
      console.log("Tableau Extensions API detected");
      
      try {
        // Initialize the extension
        await window.tableau.extensions.initializeAsync();
        console.log("Tableau Extensions API initialized successfully");
        
        // Set up event listeners for dashboard changes
        setupEventListeners();
        return true;
      } catch (error) {
        console.error("Failed to initialize Tableau Extensions:", error);
        return false;
      }
    }
    
    console.log("Tableau Extensions API not detected");
    return false;
  } catch (error) {
    console.error("Failed to initialize Tableau Extensions API:", error);
    return false;
  }
}

/**
 * Set up event listeners for dashboard changes using Extensions API
 */
function setupEventListeners() {
  if (!window.tableau || !window.tableau.extensions) return;
  
  try {
    const dashboard = window.tableau.extensions.dashboardContent.dashboard;
    
    // Listen for filter changes on all worksheets
    dashboard.worksheets.forEach((worksheet: any) => {
      worksheet.addEventListener(window.tableau.TableauEventType.FilterChanged, handleDashboardChange);
      worksheet.addEventListener(window.tableau.TableauEventType.MarkSelectionChanged, handleDashboardChange);
    });
    
    // Listen for parameter changes
    dashboard.addEventListener(window.tableau.TableauEventType.ParameterChanged, handleDashboardChange);
    
    console.log("Tableau Extensions event listeners set up successfully");
  } catch (error) {
    console.error("Error setting up Tableau Extensions event listeners:", error);
  }
}

/**
 * Get the current dashboard context with comprehensive data extraction
 */
export async function getDashboardContext(): Promise<TableauDashboardContext | null> {
  // Check if Tableau Extensions API is available
  if (!window.tableau || !window.tableau.extensions || !window.tableau.extensions.dashboardContent) {
    console.log("Tableau Extensions API not available");
    return null;
  }
  
  try {
    const dashboard = window.tableau.extensions.dashboardContent.dashboard;
    
    // Get the active worksheet name (most recently selected or visible)
    const activeWorksheet = dashboard.worksheets.length > 0 ? dashboard.worksheets[0].name : dashboard.name;
    
    // Get basic dashboard info
    const context: TableauDashboardContext = {
      title: dashboard.name,
      url: window.location.href,
      currentSheet: dashboard.name,
      activeWorksheet: activeWorksheet,
      filters: [],
      parameters: [],
      elements: []
    };
    
    // Get detailed worksheet information with data
    const worksheetDetails = [];
    for (const worksheet of dashboard.worksheets) {
      try {
        // Get summary data from each worksheet
        const summaryData = await worksheet.getSummaryDataAsync();
        
        // Extract column information
        const columns = summaryData.columns.map((col: any) => ({
          fieldName: col.fieldName,
          dataType: col.dataType,
          index: col.index
        }));
        
        // Extract sample data (first 15 rows for better financial analysis)
        const dataRows = summaryData.data.slice(0, 15).map((row: any) => {
          const rowData: Record<string, any> = {};
          row.forEach((cell: any, index: number) => {
            if (columns[index]) {
              rowData[columns[index].fieldName] = cell.formattedValue || cell.value;
            }
          });
          return rowData;
        });
        
        console.log(`Dashboard data extracted for ${worksheet.name}:`, {
          columns: columns.map(c => c.fieldName),
          sampleData: dataRows.slice(0, 3),
          totalRows: summaryData.totalRowCount
        });
        
        worksheetDetails.push({
          title: worksheet.name,
          type: "worksheet",
          columns: columns,
          sampleData: dataRows,
          totalRows: summaryData.totalRowCount
        });
        
        console.log(`Data from ${worksheet.name}:`, { columns, sampleData: dataRows });
      } catch (dataError) {
        console.warn(`Could not retrieve data from worksheet ${worksheet.name}:`, dataError);
        worksheetDetails.push({
          title: worksheet.name,
          type: "worksheet",
          error: "Could not retrieve data"
        });
      }
    }
    context.elements = worksheetDetails;
    
    // Get filters from all worksheets with detailed information
    const allFilters: any[] = [];
    for (const worksheet of dashboard.worksheets) {
      try {
        const filters = await worksheet.getFiltersAsync();
        filters.forEach((filter: any) => {
          const filterInfo = {
            fieldName: filter.fieldName,
            filterType: filter.filterType || 'categorical',
            appliedValues: [],
            worksheetName: worksheet.name
          };
          
          // Extract applied values based on filter type
          if (filter.appliedValues && filter.appliedValues.length > 0) {
            filterInfo.appliedValues = filter.appliedValues.map((val: any) => val.value || val.formattedValue || val);
          }
          
          allFilters.push(filterInfo);
        });
      } catch (filterError) {
        console.warn(`Could not retrieve filters for worksheet ${worksheet.name}:`, filterError);
      }
    }
    context.filters = allFilters;
    
    // Get parameters with detailed information
    try {
      const parameters = await dashboard.getParametersAsync();
      context.parameters = parameters.map((param: any) => ({
        name: param.name,
        dataType: param.dataType,
        currentValue: param.currentValue ? param.currentValue.value : '',
        allowableValues: param.allowableValues ? param.allowableValues.map((v: any) => v.value) : []
      }));
    } catch (paramError) {
      console.warn("Could not retrieve parameters:", paramError);
    }
    
    console.log("Complete dashboard context:", context);
    return context;
  } catch (error) {
    console.error("Error getting dashboard context:", error);
    return null;
  }
}

/**
 * Handle dashboard changes with debouncing to prevent flooding
 */
function handleDashboardChange() {
  console.log("Dashboard context changed - debouncing...");
  
  // Clear any existing timeout
  clearTimeout(changeTimeout);
  
  // Set new timeout to debounce rapid changes
  changeTimeout = setTimeout(async () => {
    console.log("Processing debounced dashboard change");
    if (dashboardChangeCallback) {
      dashboardChangeCallback();
    }
  }, 500); // 500ms debounce delay
}

/**
 * Set a callback for dashboard context changes
 */
export function setDashboardChangeCallback(callback: () => void) {
  dashboardChangeCallback = callback;
}
