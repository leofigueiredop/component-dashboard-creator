
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiEndpoint, ComponentConfig } from "@/types/api";
import { BarChartConfig } from "./componentConfig/BarChartConfig";
import { CandlestickConfig } from "./componentConfig/CandlestickConfig";
import { ComparisonConfig } from "./componentConfig/ComparisonConfig";
import { Button } from "@/components/ui/button";

interface EditComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (component: ComponentConfig) => void;
  component: ComponentConfig | null;
  endpoints: ApiEndpoint[];
}

export function EditComponentModal({
  isOpen,
  onClose,
  onSave,
  component,
  endpoints
}: EditComponentModalProps) {
  const [editedComponent, setEditedComponent] = useState<ComponentConfig | null>(null);
  const [activeTab, setActiveTab] = useState<string>("comparison");
  
  useEffect(() => {
    if (component) {
      setEditedComponent(component);
      setActiveTab(component.type);
    }
  }, [component]);
  
  if (!editedComponent) {
    return null;
  }
  
  const handleSave = () => {
    if (editedComponent) {
      onSave(editedComponent);
    }
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Component</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            <TabsTrigger value="candlestick">Candlestick</TabsTrigger>
          </TabsList>
          
          <TabsContent value="comparison">
            <ComparisonConfig
              component={editedComponent.type === "comparison" ? editedComponent : undefined}
              onChange={setEditedComponent}
              endpoints={endpoints}
            />
          </TabsContent>
          
          <TabsContent value="bar">
            <BarChartConfig
              component={editedComponent.type === "bar" ? editedComponent : undefined}
              onChange={setEditedComponent}
              endpoints={endpoints}
            />
          </TabsContent>
          
          <TabsContent value="candlestick">
            <CandlestickConfig
              component={editedComponent.type === "candlestick" ? editedComponent : undefined}
              onChange={setEditedComponent}
              endpoints={endpoints}
            />
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
