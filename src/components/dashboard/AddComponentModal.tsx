
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComparisonConfig } from "./componentConfig/ComparisonConfig";
import { BarChartConfig } from "./componentConfig/BarChartConfig";
import { CandlestickConfig } from "./componentConfig/CandlestickConfig";
import { ApiEndpoint, ChartType, ComponentConfig } from "@/types/api";

interface AddComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddComponent: (component: ComponentConfig) => void;
  endpoints: ApiEndpoint[];
}

export function AddComponentModal({
  isOpen,
  onClose,
  onAddComponent,
  endpoints
}: AddComponentModalProps) {
  const [activeTab, setActiveTab] = useState<ChartType>("comparison");

  const handleConfigure = (config: any) => {
    // Add a unique ID and position to the component config
    const componentConfig: ComponentConfig = {
      id: `component_${Date.now()}`,
      x: 0,
      y: 0,
      ...config
    };
    
    onAddComponent(componentConfig);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add Dashboard Component</DialogTitle>
          <DialogDescription>
            Choose the type of component you want to add to your dashboard
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ChartType)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="comparison">Comparison Block</TabsTrigger>
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            <TabsTrigger value="candlestick">Market Chart</TabsTrigger>
          </TabsList>
          
          <TabsContent value="comparison" className="mt-4">
            <ComparisonConfig 
              endpoints={endpoints} 
              onConfigure={handleConfigure}
              onCancel={onClose}
            />
          </TabsContent>
          
          <TabsContent value="bar" className="mt-4">
            <BarChartConfig 
              endpoints={endpoints} 
              onConfigure={handleConfigure}
              onCancel={onClose}
            />
          </TabsContent>
          
          <TabsContent value="candlestick" className="mt-4">
            <CandlestickConfig 
              endpoints={endpoints} 
              onConfigure={handleConfigure}
              onCancel={onClose}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
