
import { toast } from "@/components/ui/sonner";
import { 
  ApiEndpoint, 
  BarChartData, 
  CandlestickData, 
  ComparisonData, 
  DataPoint 
} from "@/types/api";

const API_BASE_URL = "https://alpha-datalake.azurewebsites.net/api";

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

// Simulated API for dashboards (would be replaced with real API)
let mockDashboards: any[] = [];

export async function fetchDashboards() {
  return mockDashboards;
}

export async function saveDashboard(dashboard: any) {
  const isUpdate = mockDashboards.some(d => d.id === dashboard.id);
  
  if (isUpdate) {
    mockDashboards = mockDashboards.map(d => 
      d.id === dashboard.id ? dashboard : d
    );
  } else {
    dashboard.id = `dash_${Date.now()}`;
    dashboard.createdAt = new Date().toISOString();
    mockDashboards.push(dashboard);
  }
  
  dashboard.updatedAt = new Date().toISOString();
  return dashboard;
}

export async function deleteDashboard(id: string) {
  mockDashboards = mockDashboards.filter(d => d.id !== id);
  return { success: true };
}
