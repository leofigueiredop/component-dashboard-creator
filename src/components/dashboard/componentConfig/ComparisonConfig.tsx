
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { ApiEndpoint } from "@/types/api";
import { cn } from "@/lib/utils";

interface ComparisonConfigProps {
  endpoints: ApiEndpoint[];
  onConfigure: (config: any) => void;
  onCancel: () => void;
}

export function ComparisonConfig({ endpoints, onConfigure, onCancel }: ComparisonConfigProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("");
  const [title, setTitle] = useState("Comparison");
  const [comparisonType, setComparisonType] = useState<string>("month-over-month");
  const [customDates, setCustomDates] = useState({
    periodAStart: "",
    periodAEnd: "",
    periodBStart: "",
    periodBEnd: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const config = {
      type: 'comparison',
      title,
      sources: [selectedEndpoint],
      settings: {
        comparisonType,
        customDates: comparisonType === 'custom' ? customDates : undefined
      },
      width: 400,
      height: 200
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
          
          <div className="space-y-2">
            <Label htmlFor="endpoint">Select Data Source</Label>
            <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Select an endpoint" />
              </SelectTrigger>
              <SelectContent>
                {endpoints.map((endpoint) => (
                  <SelectItem key={endpoint.id} value={endpoint.url}>
                    {endpoint.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-4">
            <Label>Comparison Type</Label>
            <RadioGroup 
              value={comparisonType} 
              onValueChange={setComparisonType}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="month-over-month" id="month-over-month" />
                <Label htmlFor="month-over-month" className="font-normal cursor-pointer">
                  Current month vs previous month
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="year-over-year" id="year-over-year" />
                <Label htmlFor="year-over-year" className="font-normal cursor-pointer">
                  Current month vs same month last year
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="font-normal cursor-pointer">
                  Custom date range
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className={cn("space-y-4", comparisonType !== 'custom' && "opacity-50 pointer-events-none")}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Period A (Recent)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="periodAStart" className="text-xs">Start Date</Label>
                    <Input
                      id="periodAStart"
                      type="date"
                      value={customDates.periodAStart}
                      onChange={(e) => setCustomDates({...customDates, periodAStart: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="periodAEnd" className="text-xs">End Date</Label>
                    <Input
                      id="periodAEnd"
                      type="date"
                      value={customDates.periodAEnd}
                      onChange={(e) => setCustomDates({...customDates, periodAEnd: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Period B (Comparison)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="periodBStart" className="text-xs">Start Date</Label>
                    <Input
                      id="periodBStart"
                      type="date"
                      value={customDates.periodBStart}
                      onChange={(e) => setCustomDates({...customDates, periodBStart: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="periodBEnd" className="text-xs">End Date</Label>
                    <Input
                      id="periodBEnd"
                      type="date"
                      value={customDates.periodBEnd}
                      onChange={(e) => setCustomDates({...customDates, periodBEnd: e.target.value})}
                    />
                  </div>
                </div>
              </div>
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
              disabled={!selectedEndpoint}
            >
              Add Component
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
