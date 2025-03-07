
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

// Mock data for endpoints in case the API fails
const MOCK_ENDPOINTS: ApiEndpoint[] = [
  {
    id: "endpoint_1",
    name: "Bitcoin Price",
    url: "/crypto/bitcoin/price",
    description: "Current and historical Bitcoin prices"
  },
  {
    id: "endpoint_2",
    name: "Ethereum Price",
    url: "/crypto/ethereum/price",
    description: "Current and historical Ethereum prices"
  },
  {
    id: "endpoint_3",
    name: "Daily Trading Volume",
    url: "/market/trading/volume/daily",
    description: "Daily trading volume across major exchanges"
  },
  {
    id: "endpoint_4",
    name: "Market Sentiment",
    url: "/market/sentiment",
    description: "Market sentiment indicators based on social media and news"
  },
  {
    id: "endpoint_5",
    name: "User Registrations",
    url: "/users/registrations",
    description: "New user registrations over time"
  }
];

// Mock data for data points
const generateMockDataPoints = (count: number): DataPoint[] => {
  const result: DataPoint[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    result.push({
      date: date.toISOString(),
      value: Math.floor(Math.random() * 10000) / 100
    });
  }
  
  return result;
};

// Mock candlestick data
const generateMockCandlestickData = (count: number): CandlestickData[] => {
  const result: CandlestickData[] = [];
  const now = new Date();
  let lastClose = 50000 + Math.random() * 1000;
  
  for (let i = 0; i < count; i++) {
    const date = new Date(now);
    date.setHours(date.getHours() - (i * 4)); // For 4h timeframe
    
    const changePercent = (Math.random() * 5) - 2.5; // -2.5% to +2.5%
    const close = lastClose * (1 + (changePercent / 100));
    const open = lastClose;
    const high = Math.max(open, close) * (1 + (Math.random() * 1) / 100);
    const low = Math.min(open, close) * (1 - (Math.random() * 1) / 100);
    const volume = Math.floor(Math.random() * 1000) + 500;
    
    result.push({
      date: date.toISOString(),
      open,
      high,
      low,
      close,
      volume
    });
    
    lastClose = close;
  }
  
  return result.reverse(); // Most recent last
};

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
    // Try to fetch from the API first
    const response = await fetch(`${API_BASE_URL}/endpoints`);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch endpoints from API, using mock data:", error);
    toast.info("Using sample data sources");
    return MOCK_ENDPOINTS;
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
    console.error(`Failed to fetch data for endpoint ${endpointUrl}, using mock data:`, error);
    toast.info("Using sample data for visualization");
    return generateMockDataPoints(30); // Generate 30 sample data points
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
    console.error("Failed to fetch comparison data, using mock data:", error);
    toast.info("Using sample comparison data");
    
    // Generate mock comparison data
    const valueA = Math.floor(Math.random() * 10000) / 100;
    const valueB = Math.floor(Math.random() * 10000) / 100;
    const percentageChange = ((valueB - valueA) / valueA) * 100;
    
    return {
      periodA: {
        startDate: periodAStart.toISOString(),
        endDate: periodAEnd.toISOString(),
        value: valueA
      },
      periodB: {
        startDate: periodBStart.toISOString(),
        endDate: periodBEnd.toISOString(),
        value: valueB
      },
      percentageChange
    };
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
    console.error("Failed to fetch candlestick data, using mock data:", error);
    toast.info("Using sample market data");
    return generateMockCandlestickData(50); // Generate 50 candlestick data points
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
