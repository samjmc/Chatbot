// Tableau Web API for reading dashboard data via Web Page object
// This works differently from Extensions API - it can access parent window data

interface TableauDashboardData {
  title: string;
  worksheets: Array<{
    name: string;
    data: any[];
  }>;
  filters: Array<{
    field: string;
    values: string[];
  }>;
}

/**
 * Attempt to read Tableau dashboard data from parent window
 * This works when embedded as a Web Page object in Tableau
 */
export async function readTableauDashboard(): Promise<TableauDashboardData | null> {
  try {
    // Check if we're in an iframe (embedded in Tableau)
    if (window.parent === window) {
      console.log("Not embedded - no parent window data available");
      return null;
    }

    // Try to access parent window's Tableau object
    const parentTableau = (window.parent as any)?.tableau;
    if (!parentTableau) {
      console.log("Parent window doesn't have Tableau object");
      return null;
    }

    // Get the viz (visualization) from parent
    const viz = parentTableau.VizManager?.getVizs()?.[0];
    if (!viz) {
      console.log("No visualization found in parent window");
      return null;
    }

    const workbook = viz.getWorkbook();
    const activeSheet = workbook.getActiveSheet();
    
    console.log("Successfully connected to Tableau dashboard:", activeSheet.getName());

    // Extract worksheet data
    const worksheets = [];
    if (activeSheet.getSheetType() === 'dashboard') {
      const dashboard = activeSheet;
      const dashboardObjects = dashboard.getObjects();
      
      for (const obj of dashboardObjects) {
        if (obj.getObjectType() === 'worksheet') {
          const worksheet = obj.getWorksheet();
          try {
            const data = await getWorksheetData(worksheet);
            worksheets.push({
              name: worksheet.getName(),
              data: data
            });
          } catch (error) {
            console.warn(`Could not get data for worksheet ${worksheet.getName()}:`, error);
          }
        }
      }
    }

    // Get active filters
    const filters = await getActiveFilters(workbook);

    return {
      title: workbook.getName(),
      worksheets,
      filters
    };

  } catch (error) {
    console.error("Error reading Tableau dashboard:", error);
    return null;
  }
}

/**
 * Get data from a specific worksheet
 */
async function getWorksheetData(worksheet: any): Promise<any[]> {
  return new Promise((resolve, reject) => {
    worksheet.getSummaryDataAsync().then((dataTable: any) => {
      const data = [];
      const columns = dataTable.getColumns();
      
      for (let i = 0; i < dataTable.getData().length; i++) {
        const row: any = {};
        const rowData = dataTable.getData()[i];
        
        for (let j = 0; j < columns.length; j++) {
          row[columns[j].getFieldName()] = rowData[j].value;
        }
        data.push(row);
      }
      
      resolve(data);
    }).catch(reject);
  });
}

/**
 * Get active filters from the workbook
 */
async function getActiveFilters(workbook: any): Promise<Array<{field: string, values: string[]}>> {
  try {
    const filters = [];
    const activeSheet = workbook.getActiveSheet();
    
    if (activeSheet.getSheetType() === 'dashboard') {
      const dashboard = activeSheet;
      const objects = dashboard.getObjects();
      
      for (const obj of objects) {
        if (obj.getObjectType() === 'worksheet') {
          const worksheet = obj.getWorksheet();
          const worksheetFilters = await worksheet.getFiltersAsync();
          
          for (const filter of worksheetFilters) {
            filters.push({
              field: filter.getFieldName(),
              values: filter.getAppliedValues().map((v: any) => v.value)
            });
          }
        }
      }
    }
    
    return filters;
  } catch (error) {
    console.warn("Could not get filters:", error);
    return [];
  }
}

/**
 * Check if we can access Tableau data
 */
export function canAccessTableauData(): boolean {
  try {
    return window.parent !== window && !!(window.parent as any)?.tableau;
  } catch (error) {
    return false;
  }
}