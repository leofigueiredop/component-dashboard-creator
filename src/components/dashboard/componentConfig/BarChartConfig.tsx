
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ApiEndpoint } from "@/types/api";
import { X } from "lucide-react";

interface BarChartConfigProps {
  endpoints: ApiEndpoint[];
  onConfigure: (config: any) => void;
  onCancel: () => void;
}

export function BarChartConfig({ endpoints, onConfigure, onCancel }: BarChartConfigProps) {
  const [title, setTitle] = useState("Bar Chart");
  const [selectedEndpoints, setSelectedEndpoints] = useState<string[]>([]);
  const [currentEndpoint, setCurrentEndpoint] = useState<string>("");
  const [stacked, setStacked] = useState(false);

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
      type: 'bar',
      title,
      sources: selectedEndpoints,
      settings: {
        stacked
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
            <Label htmlFor="title">Component Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter component title"
              className="max-w-md"
            />
          </div>
          
          <div className="space-y-4">
            <Label>Data Sources (Max 3)</Label>
            
            <div className="flex items-center gap-2">
              <Select value={currentEndpoint} onValueChange={setCurrentEndpoint}>
                <SelectTrigger className="max-w-md">
                  <SelectValue placeholder="Select an endpoint" />
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
                            backgroundColor: ['#0088FE', '#00C49F', '#FFBB28'][index % 3] 
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
                <p className="text-sm text-muted-foreground">No data sources selected</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="stacked"
              checked={stacked}
              onCheckedChange={(checked) => setStacked(checked === true)}
            />
            <Label htmlFor="stacked" className="font-normal cursor-pointer">
              Stack bars instead of grouping them
            </Label>
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
              disabled={selectedEndpoints.length === 0}
            >
              Add Component
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
