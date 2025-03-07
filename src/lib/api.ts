import { toast } from "sonner";
import { 
  ApiEndpoint, 
  BarChartData, 
  CandlestickData, 
  ComparisonData, 
  Dashboard,
  DataPoint 
} from "@/types/api";
import Database from "better-sqlite3";

const API_BASE_URL = "https://alpha-datalake.azurewebsites.net/api";

// Initialize SQLite database
const db = new Database('dashboards.db');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS dashboards (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS components (
    id TEXT PRIMARY KEY,
    dashboardId TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    settings TEXT NOT NULL,
    FOREIGN KEY (dashboardId) REFERENCES dashboards(id) ON DELETE CASCADE
  );
  
  CREATE TABLE IF NOT EXISTS component_sources (
    componentId TEXT NOT NULL,
    source TEXT NOT NULL,
    PRIMARY KEY (componentId, source),
    FOREIGN KEY (componentId) REFERENCES components(id) ON DELETE CASCADE
  );
`);

// Prepare statements
const getDashboardsStmt = db.prepare('SELECT * FROM dashboards ORDER BY updatedAt DESC');
const getDashboardByIdStmt = db.prepare('SELECT * FROM dashboards WHERE id = ?');
const getComponentsStmt = db.prepare('SELECT * FROM components WHERE dashboardId = ?');
const getComponentSourcesStmt = db.prepare('SELECT source FROM component_sources WHERE componentId = ?');

const insertDashboardStmt = db.prepare('INSERT INTO dashboards (id, name, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)');
const updateDashboardStmt = db.prepare('UPDATE dashboards SET name = ?, description = ?, updatedAt = ? WHERE id = ?');
const deleteDashboardStmt = db.prepare('DELETE FROM dashboards WHERE id = ?');

const insertComponentStmt = db.prepare('INSERT INTO components (id, dashboardId, type, title, x, y, width, height, settings) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
const deleteComponentsStmt = db.prepare('DELETE FROM components WHERE dashboardId = ?');

const insertComponentSourceStmt = db.prepare('INSERT INTO component_sources (componentId, source) VALUES (?, ?)');
const deleteComponentSourcesStmt = db.prepare('DELETE FROM component_sources WHERE componentId = ?');

export async function fetchEndpoints(): Promise<ApiEndpoint[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/endpoints`);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch endpoints:", error);
    toast.error("Failed to load data sources");
    return [];
  }
}

export async function fetchDataForEndpoint(endpointUrl: string): Promise<DataPoint[]> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpointUrl}`);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch data for endpoint ${endpointUrl}:`, error);
    toast.error("Failed to load data");
    return [];
  }
}

export async function fetchComparisonData(
  endpointUrl: string,
  periodAStart: Date,
  periodAEnd: Date,
  periodBStart: Date,
  periodBEnd: Date
): Promise<ComparisonData | null> {
  try {
    const params = new URLSearchParams({
      periodAStart: periodAStart.toISOString(),
      periodAEnd: periodAEnd.toISOString(),
      periodBStart: periodBStart.toISOString(),
      periodBEnd: periodBEnd.toISOString()
    });
    
    const response = await fetch(`${API_BASE_URL}${endpointUrl}/compare?${params}`);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch comparison data:", error);
    toast.error("Failed to load comparison data");
    return null;
  }
}

export async function fetchBarChartData(
  endpointUrls: string[]
): Promise<BarChartData[]> {
  try {
    const promises = endpointUrls.map(async (url) => {
      const data = await fetchDataForEndpoint(url);
      return {
        source: url,
        data
      };
    });
    
    return await Promise.all(promises);
  } catch (error) {
    console.error("Failed to fetch bar chart data:", error);
    toast.error("Failed to load chart data");
    return [];
  }
}

export async function fetchCandlestickData(
  symbol: string,
  timeframe: string
): Promise<CandlestickData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/market/candlestick/${symbol}?timeframe=${timeframe}`);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch candlestick data:", error);
    toast.error("Failed to load market data");
    return [];
  }
}

export async function fetchDashboards(): Promise<Dashboard[]> {
  try {
    const dashboardsData = getDashboardsStmt.all();
    
    // For each dashboard, fetch its components
    const dashboards = dashboardsData.map((dashboardData: any) => {
      const componentsData = getComponentsStmt.all(dashboardData.id);
      
      // For each component, fetch its sources
      const components = componentsData.map((componentData: any) => {
        const sourcesData = getComponentSourcesStmt.all(componentData.id);
        const sources = sourcesData.map((sourceData: any) => sourceData.source);
        
        return {
          id: componentData.id,
          type: componentData.type,
          title: componentData.title,
          x: componentData.x,
          y: componentData.y,
          width: componentData.width,
          height: componentData.height,
          sources: sources,
          settings: JSON.parse(componentData.settings)
        };
      });
      
      return {
        id: dashboardData.id,
        name: dashboardData.name,
        description: dashboardData.description,
        createdAt: dashboardData.createdAt,
        updatedAt: dashboardData.updatedAt,
        components: components
      };
    });
    
    return dashboards;
  } catch (error) {
    console.error("Failed to fetch dashboards:", error);
    toast.error("Failed to load dashboards");
    return [];
  }
}

export async function saveDashboard(dashboard: Dashboard) {
  try {
    const transaction = db.transaction(() => {
      const isUpdate = getDashboardByIdStmt.get(dashboard.id) !== undefined;
      
      if (isUpdate) {
        // Update dashboard
        updateDashboardStmt.run(
          dashboard.name,
          dashboard.description,
          dashboard.updatedAt,
          dashboard.id
        );
        
        // Delete existing components and their sources
        deleteComponentsStmt.run(dashboard.id);
      } else {
        // Insert new dashboard
        insertDashboardStmt.run(
          dashboard.id || `dash_${Date.now()}`,
          dashboard.name,
          dashboard.description,
          dashboard.createdAt || new Date().toISOString(),
          dashboard.updatedAt || new Date().toISOString()
        );
      }
      
      // Insert components
      dashboard.components.forEach(component => {
        // Insert component
        insertComponentStmt.run(
          component.id,
          dashboard.id,
          component.type,
          component.title,
          component.x,
          component.y,
          component.width,
          component.height,
          JSON.stringify(component.settings)
        );
        
        // Insert component sources
        component.sources.forEach(source => {
          insertComponentSourceStmt.run(component.id, source);
        });
      });
      
      // Return the updated or new dashboard
      return dashboard;
    });
    
    return transaction();
  } catch (error) {
    console.error("Failed to save dashboard:", error);
    toast.error("Failed to save dashboard");
    throw error;
  }
}

export async function deleteDashboard(id: string) {
  try {
    const transaction = db.transaction(() => {
      deleteDashboardStmt.run(id);
      return { success: true };
    });
    
    return transaction();
  } catch (error) {
    console.error("Failed to delete dashboard:", error);
    toast.error("Failed to delete dashboard");
    throw error;
  }
}
