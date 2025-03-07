
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DashboardControlsProps {
  isEditMode: boolean;
  onAddComponent: () => void;
}

export function DashboardControls({ isEditMode, onAddComponent }: DashboardControlsProps) {
  if (!isEditMode) return null;
  
  return (
    <div className="mb-6 flex justify-center">
      <Button 
        onClick={onAddComponent}
        size="lg"
        className="animate-fade-in shadow-md hover:shadow-lg transition-all duration-300"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Component
      </Button>
    </div>
  );
}
