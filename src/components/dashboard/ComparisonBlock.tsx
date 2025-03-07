
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchComparisonData } from "@/lib/api";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ComponentConfig } from "@/types/api";

interface ComparisonBlockProps {
  config: ComponentConfig;
  id: string;
  className?: string;
}

export function ComparisonBlock({ config, id, className }: ComparisonBlockProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [comparisonData, setComparisonData] = useState<{
    periodA: { value: number; startDate: string; endDate: string };
    periodB: { value: number; startDate: string; endDate: string };
    percentageChange: number;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      
      if (!config.sources?.[0]) {
        setIsLoading(false);
        return;
      }
      
      const { comparisonType, customDates } = config.settings || {};
      
      // Calculate date ranges based on comparison type
      const now = new Date();
      let periodAStart: Date, periodAEnd: Date, periodBStart: Date, periodBEnd: Date;
      
      if (comparisonType === 'custom' && customDates) {
        periodAStart = new Date(customDates.periodAStart);
        periodAEnd = new Date(customDates.periodAEnd);
        periodBStart = new Date(customDates.periodBStart);
        periodBEnd = new Date(customDates.periodBEnd);
      } else if (comparisonType === 'month-over-month') {
        // Current month
        periodAStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodAEnd = now;
        
        // Previous month
        periodBStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        periodBEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      } else {
        // Default: year-over-year
        periodAStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodAEnd = now;
        
        // Same month last year
        periodBStart = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        periodBEnd = new Date(now.getFullYear() - 1, now.getMonth() + 1, 0);
      }
      
      try {
        const data = await fetchComparisonData(
          config.sources[0],
          periodAStart,
          periodAEnd,
          periodBStart,
          periodBEnd
        );
        
        setComparisonData(data);
      } catch (error) {
        console.error("Failed to load comparison data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [config]);

  return (
    <Card id={id} className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{config.title || "Comparison"}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        ) : comparisonData ? (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {formatDate(comparisonData.periodA.startDate)} - {formatDate(comparisonData.periodA.endDate)}
                </p>
                <p className="text-2xl font-bold">{comparisonData.periodA.value.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {formatDate(comparisonData.periodB.startDate)} - {formatDate(comparisonData.periodB.endDate)}
                </p>
                <p className="text-2xl font-bold">{comparisonData.periodB.value.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-start">
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                comparisonData.percentageChange >= 0 
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              }`}>
                {comparisonData.percentageChange >= 0 ? (
                  <ArrowUpIcon className="w-3 h-3" />
                ) : (
                  <ArrowDownIcon className="w-3 h-3" />
                )}
                <span>{Math.abs(comparisonData.percentageChange).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
