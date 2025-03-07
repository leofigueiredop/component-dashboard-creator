
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCandlestickData, fetchDataForEndpoint } from "@/lib/api";
import { ComponentConfig } from "@/types/api";
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";

interface CandlestickChartComponentProps {
  config: ComponentConfig;
  id: string;
  className?: string;
}

const LINE_COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

export function CandlestickChartComponent({ config, id, className }: CandlestickChartComponentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      
      const { symbol, timeframe } = config.settings || {};
      
      if (!symbol || !timeframe) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Fetch candlestick data
        const candlestickData = await fetchCandlestickData(symbol, timeframe);
        
        // Fetch overlay data from additional sources
        const overlayPromises = (config.sources || []).map(async (source, index) => {
          try {
            const data = await fetchDataForEndpoint(source);
            return {
              name: `Overlay ${index + 1}`,
              data
            };
          } catch (error) {
            console.error(`Failed to load overlay data for source ${index}:`, error);
            return null;
          }
        });
        
        const overlayResults = await Promise.all(overlayPromises);
        const validOverlays = overlayResults.filter(Boolean);
        
        // Process the data for the chart
        if (candlestickData.length > 0) {
          const processedData = candlestickData.map((candle: any) => {
            const result: any = {
              date: candle.date,
              open: candle.open,
              high: candle.high,
              low: candle.low,
              close: candle.close,
              volume: candle.volume,
              // For candlestick representation in recharts
              candleHeight: candle.high - candle.low,
              candleY: candle.low,
              bodyHeight: Math.abs(candle.close - candle.open),
              bodyY: Math.min(candle.close, candle.open),
              color: candle.close >= candle.open ? "#00C49F" : "#FF4D4F"
            };
            
            // Add overlay data points if available
            validOverlays.forEach((overlay, index) => {
              if (!overlay) return;
              
              const matchingPoint = overlay.data.find((point: any) => 
                new Date(point.date).toDateString() === new Date(candle.date).toDateString()
              );
              
              if (matchingPoint) {
                result[`overlay${index + 1}`] = matchingPoint.value;
              }
            });
            
            return result;
          });
          
          setChartData(processedData);
        }
      } catch (error) {
        console.error("Failed to load candlestick chart data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [config]);

  return (
    <Card id={id} className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">
          {config.title || `${config.settings?.symbol || 'Crypto'} Chart`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : chartData.length > 0 ? (
          <div className="w-full h-[300px] animate-fade-in">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
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
                <YAxis 
                  yAxisId="price" 
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="volume" 
                  orientation="right" 
                  domain={['auto', 'auto']} 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'volume') return [Number(value).toLocaleString(), "Volume"];
                    if (name.startsWith('overlay')) return [Number(value).toLocaleString(), `Overlay ${name.slice(-1)}`];
                    return [Number(value).toFixed(2), name.charAt(0).toUpperCase() + name.slice(1)];
                  }}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                />
                <Legend />
                
                {/* Candlestick body */}
                <Bar
                  dataKey="bodyHeight"
                  yAxisId="price"
                  fill="#8884d8"
                  stroke="#000"
                  fillOpacity={1}
                  stackId="stack"
                  barSize={8}
                  shape={(props: any) => {
                    const { x, y, width, height, color } = props;
                    const item = chartData[props.index];
                    return (
                      <rect 
                        x={x - width / 2} 
                        y={item.bodyY} 
                        width={width} 
                        height={item.bodyHeight || 1}
                        fill={item.color}
                        stroke={item.color}
                      />
                    );
                  }}
                  name="Price"
                />
                
                {/* Candlestick wicks */}
                <Bar
                  dataKey="candleHeight"
                  yAxisId="price"
                  fill="none"
                  stroke="#000"
                  fillOpacity={0}
                  stackId="stack"
                  barSize={1}
                  shape={(props: any) => {
                    const { x, y, width, height } = props;
                    const item = chartData[props.index];
                    return (
                      <line 
                        x1={x} 
                        y1={item.candleY} 
                        x2={x} 
                        y2={item.candleY + item.candleHeight}
                        stroke={item.color}
                        strokeWidth={1}
                      />
                    );
                  }}
                  name="Price Range"
                />
                
                {/* Volume */}
                <Bar 
                  dataKey="volume" 
                  yAxisId="volume" 
                  fill="#8884d8" 
                  opacity={0.3} 
                  name="Volume"
                />
                
                {/* Overlays */}
                {(config.sources || []).map((_, index) => {
                  const overlayKey = `overlay${index + 1}`;
                  // Check if we have any data for this overlay
                  const hasData = chartData.some(item => item[overlayKey] !== undefined);
                  
                  if (!hasData) return null;
                  
                  return (
                    <Line
                      key={overlayKey}
                      type="monotone"
                      dataKey={overlayKey}
                      yAxisId="price"
                      stroke={LINE_COLORS[index % LINE_COLORS.length]}
                      dot={false}
                      name={`Overlay ${index + 1}`}
                    />
                  );
                })}
              </ComposedChart>
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
