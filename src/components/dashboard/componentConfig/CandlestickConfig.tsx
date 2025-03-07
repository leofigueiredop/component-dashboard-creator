
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ApiEndpoint } from "@/types/api";
import { X } from "lucide-react";

interface CandlestickConfigProps {
  endpoints: ApiEndpoint[];
  onConfigure: (config: any) => void;
  onCancel: () => void;
}

const CRYPTO_SYMBOLS = [
  { value: "BTC", label: "Bitcoin (BTC)" },
  { value: "ETH", label: "Ethereum (ETH)" },
  { value: "BNB", label: "Binance Coin (BNB)" },
  { value: "SOL", label: "Solana (SOL)" },
  { value: "ADA", label: "Cardano (ADA)" }
];

const TIMEFRAMES = [
  { value: "1d", label: "1 Day" },
  { value: "4h", label: "4 Hours" },
  { value: "1h", label: "1 Hour" },
  { value: "15m", label: "15 Minutes" }
];

export function CandlestickConfig({ endpoints, onConfigure, onCancel }: CandlestickConfigProps) {
  const [title, setTitle] = useState("");
  const [symbol, setSymbol] = useState<string>("");
  const [timeframe, setTimeframe] = useState<string>("1d");
  const [selectedEndpoints, setSelectedEndpoints] = useState<string[]>([]);
  const [currentEndpoint, setCurrentEndpoint] = useState<string>("");

  const addEndpoint = () => {
    if (currentEndpoint && !selectedEndpoints.includes(currentEndpoint) && selectedEndpoints.length < 3) {
      setSelectedEndpoints([...selectedEndpoints, currentEndpoint]);
      setCurrentEndpoint("");
    }
  };

  const removeEndpoint = (endpoint: string) => {
    setSelectedEndpoints(selectedEndpoints.filter(e => e !== endpoint));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const config = {
      type: 'candlestick',
      title: title || `${symbol} Market Chart`,
      sources: selectedEndpoints,
      settings: {
        symbol,
        timeframe
      },
      width: 600,
      height: 400
    };
    
    onConfigure(config);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto animate-fade-in">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Component Title (Optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter component title or leave blank for default"
              className="max-w-md"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="symbol">Crypto Symbol</Label>
            <Select value={symbol} onValueChange={setSymbol}>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Select a cryptocurrency" />
              </SelectTrigger>
              <SelectContent>
                {CRYPTO_SYMBOLS.map((crypto) => (
                  <SelectItem key={crypto.value} value={crypto.value}>
                    {crypto.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="timeframe">Timeframe</Label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Select a timeframe" />
              </SelectTrigger>
              <SelectContent>
                {TIMEFRAMES.map((tf) => (
                  <SelectItem key={tf.value} value={tf.value}>
                    {tf.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-4">
            <Label>Overlay Data Sources (Optional, Max 3)</Label>
            
            <div className="flex items-center gap-2">
              <Select value={currentEndpoint} onValueChange={setCurrentEndpoint}>
                <SelectTrigger className="max-w-md">
                  <SelectValue placeholder="Select an endpoint for overlay" />
                </SelectTrigger>
                <SelectContent>
                  {endpoints
                    .filter(endpoint => !selectedEndpoints.includes(endpoint.url))
                    .map((endpoint) => (
                      <SelectItem key={endpoint.id} value={endpoint.url}>
                        {endpoint.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              
              <Button 
                type="button" 
                onClick={addEndpoint}
                disabled={!currentEndpoint || selectedEndpoints.length >= 3}
              >
                Add
              </Button>
            </div>
            
            <div className="space-y-2">
              {selectedEndpoints.length > 0 ? (
                <div className="space-y-2">
                  {selectedEndpoints.map((endpoint, index) => {
                    const endpointInfo = endpoints.find(e => e.url === endpoint);
                    return (
                      <div 
                        key={endpoint} 
                        className="flex items-center justify-between p-2 bg-secondary rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ 
                            backgroundColor: ['#8884d8', '#82ca9d', '#ffc658'][index % 3] 
                          }} />
                          <span>{endpointInfo?.name || endpoint}</span>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeEndpoint(endpoint)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No overlay data sources selected</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!symbol}
            >
              Add Component
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
