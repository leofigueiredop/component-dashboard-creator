
import { GridLayout } from "@/components/GridLayout";
import { DashboardComponent } from "@/components/dashboard/DashboardComponent";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { ComponentConfig } from "@/types/api";

interface DashboardContentProps {
  components: ComponentConfig[];
  isEditMode: boolean;
  onComponentsChange: (components: ComponentConfig[]) => void;
  onAddComponentClick: () => void;
}

export function DashboardContent({ 
  components, 
  isEditMode, 
  onComponentsChange, 
  onAddComponentClick 
}: DashboardContentProps) {
  return (
    <div className="mb-8">
      {components.length === 0 ? (
        <DashboardEmptyState 
          isEditMode={isEditMode} 
          onAddComponent={onAddComponentClick} 
        />
      ) : (
        <div className="min-h-[500px] glass rounded-lg p-4">
          <GridLayout
            components={components}
            onComponentsChange={onComponentsChange}
            editable={isEditMode}
          >
            {components.map((component) => (
              <DashboardComponent
                key={component.id}
                id={component.id}
                config={component}
                className="bg-white dark:bg-gray-800 animate-fade-in"
              />
            ))}
          </GridLayout>
        </div>
      )}
    </div>
  );
}
