
import { toast } from "sonner";
import { 
  ApiEndpoint, 
  BarChartData, 
  CandlestickData, 
  ComparisonData, 
  Dashboard,
  DataPoint 
} from "@/types/api";

const API_BASE_URL = "https://alpha-datalake.azurewebsites.net/api";

// Use localStorage for browser-compatible storage
const DASHBOARDS_STORAGE_KEY = "dashboards";

// Helper functions for localStorage
function getDashboardsFromStorage(): Dashboard[] {
  try {
    const storedData = localStorage.getItem(DASHBOARDS_STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error("Failed to read dashboards from storage:", error);
    return [];
  }
}

function saveDashboardsToStorage(dashboards: Dashboard[]): void {
  try {
    localStorage.setItem(DASHBOARDS_STORAGE_KEY, JSON.stringify(dashboards));
  } catch (error) {
    console.error("Failed to save dashboards to storage:", error);
    toast.error("Failed to save dashboard data");
  }
}

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
    return getDashboardsFromStorage();
  } catch (error) {
    console.error("Failed to fetch dashboards:", error);
    toast.error("Failed to load dashboards");
    return [];
  }
}

export async function saveDashboard(dashboard: Partial<Dashboard>): Promise<Dashboard> {
  try {
    const dashboards = getDashboardsFromStorage();
    
    // Generate an ID if it doesn't exist
    const dashboardWithId: Dashboard = {
      id: dashboard.id || `dash_${Date.now()}`,
      name: dashboard.name || "Untitled Dashboard",
      description: dashboard.description || "",
      components: dashboard.components || [],
      createdAt: dashboard.createdAt || new Date().toISOString(),
      updatedAt: dashboard.updatedAt || new Date().toISOString()
    };
    
    // Check if the dashboard already exists to update it
    const existingIndex = dashboards.findIndex(d => d.id === dashboardWithId.id);
    
    if (existingIndex >= 0) {
      // Update existing dashboard
      dashboards[existingIndex] = dashboardWithId;
    } else {
      // Add new dashboard
      dashboards.push(dashboardWithId);
    }
    
    saveDashboardsToStorage(dashboards);
    return dashboardWithId;
  } catch (error) {
    console.error("Failed to save dashboard:", error);
    toast.error("Failed to save dashboard");
    throw error;
  }
}

export async function deleteDashboard(id: string): Promise<{ success: boolean }> {
  try {
    const dashboards = getDashboardsFromStorage();
    const updatedDashboards = dashboards.filter(d => d.id !== id);
    saveDashboardsToStorage(updatedDashboards);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete dashboard:", error);
    toast.error("Failed to delete dashboard");
    throw error;
  }
}
