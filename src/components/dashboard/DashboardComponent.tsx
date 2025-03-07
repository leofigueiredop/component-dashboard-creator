
import { ComponentConfig } from "@/types/api";
import { ComparisonBlock } from "./ComparisonBlock";
import { BarChartComponent } from "./BarChartComponent";
import { CandlestickChartComponent } from "./CandlestickChartComponent";

interface DashboardComponentProps {
  config: ComponentConfig;
  id?: string; // Make id an optional prop
  className?: string;
}

export function DashboardComponent({ config, id, className }: DashboardComponentProps) {
  const baseClassName = `w-[${config.width}px] h-[${config.height}px] ${className || ''}`;
  
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
