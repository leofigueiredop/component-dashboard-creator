
import { ComponentConfig } from "@/types/api";
import { ComparisonBlock } from "./ComparisonBlock";
import { BarChartComponent } from "./BarChartComponent";
import { CandlestickChartComponent } from "./CandlestickChartComponent";
import { Button } from "@/components/ui/button";
import { PenIcon } from "lucide-react";

interface DashboardComponentProps {
  config: ComponentConfig;
  id?: string; // Make id an optional prop
  className?: string;
  isEditMode?: boolean;
  onEdit?: (component: ComponentConfig) => void;
}

export function DashboardComponent({ 
  config, 
  id, 
  className, 
  isEditMode = false,
  onEdit
}: DashboardComponentProps) {
  const baseClassName = `w-[${config.width}px] h-[${config.height}px] ${className || ''}`;
  
  const handleEdit = () => {
    if (onEdit) {
      onEdit(config);
    }
  };

  return (
    <div className="relative group">
      {isEditMode && (
        <Button 
          size="icon" 
          variant="secondary" 
          className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-primary/80 text-primary-foreground hover:bg-primary"
          onClick={handleEdit}
        >
          <PenIcon className="h-4 w-4" />
        </Button>
      )}
      
      {renderComponent()}
    </div>
  );
  
  function renderComponent() {
    switch (config.type) {
      case 'comparison':
        return <ComparisonBlock config={config} id={id || config.id} className={baseClassName} />;
      case 'bar':
        return <BarChartComponent config={config} id={id || config.id} className={baseClassName} />;
      case 'candlestick':
        return <CandlestickChartComponent config={config} id={id || config.id} className={baseClassName} />;
      default:
        return <div className={`${baseClassName} bg-red-100 p-4 rounded-lg`}>Unknown component type</div>;
    }
  }
}
