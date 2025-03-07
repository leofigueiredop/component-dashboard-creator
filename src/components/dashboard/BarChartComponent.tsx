
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchBarChartData } from "@/lib/api";
import { ComponentConfig } from "@/types/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface BarChartComponentProps {
  config: ComponentConfig;
  id: string;
  className?: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

export function BarChartComponent({ config, id, className }: BarChartComponentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      
      if (!config.sources?.length) {
        setIsLoading(false);
        return;
      }
      
      try {
        const data = await fetchBarChartData(config.sources);
        
        // Process the data into a format suitable for recharts
        if (data.length > 0) {
          // Get unique dates from all sources
          const allDates = new Set<string>();
          data.forEach(source => {
            source.data.forEach((point: any) => {
              allDates.add(point.date);
            });
          });
          
          // Create map of dates to values for each source
          const dateMap: Record<string, Record<string, number>> = {};
          Array.from(allDates).forEach(date => {
            dateMap[date] = {};
          });
          
          // Populate the map
          data.forEach((source, index) => {
            const sourceName = `Source ${index + 1}`;
            source.data.forEach((point: any) => {
              dateMap[point.date][sourceName] = point.value;
            });
          });
          
          // Transform map into array
          const processedData = Object.entries(dateMap).map(([date, values]) => ({
            date,
            ...values
          }));
          
          // Sort by date
          processedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          setChartData(processedData);
        }
      } catch (error) {
        console.error("Failed to load bar chart data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [config]);

  return (
    <Card id={id} className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{config.title || "Bar Chart"}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : chartData.length > 0 ? (
          <div className="w-full h-[300px] animate-fade-in">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#888" opacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => [Number(value).toLocaleString(), ""]}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                />
                <Legend />
                {config.sources.map((_, index) => (
                  <Bar
                    key={`Source ${index + 1}`}
                    dataKey={`Source ${index + 1}`}
                    fill={COLORS[index % COLORS.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
