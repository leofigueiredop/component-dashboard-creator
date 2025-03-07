
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DashboardEmptyStateProps {
  isEditMode: boolean;
  onAddComponent: () => void;
}

export function DashboardEmptyState({ isEditMode, onAddComponent }: DashboardEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 glass rounded-lg">
      <div className="mb-4 opacity-70">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto animate-float"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="9" y1="3" x2="9" y2="21" />
          <line x1="3" y1="9" x2="21" y2="9" />
        </svg>
      </div>
      <h3 className="text-lg font-medium mb-2">This dashboard is empty</h3>
      <p className="text-muted-foreground text-center max-w-md mb-4">
        Add components to your dashboard to start visualizing your data
      </p>
      {isEditMode && (
        <Button onClick={onAddComponent}>
          <Plus className="mr-2 h-4 w-4" />
          Add Component
        </Button>
      )}
    </div>
  );
}
