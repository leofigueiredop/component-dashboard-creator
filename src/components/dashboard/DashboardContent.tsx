
import { useState } from "react";
import { GridLayout } from "@/components/GridLayout";
import { DashboardComponent } from "@/components/dashboard/DashboardComponent";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { EditComponentModal } from "@/components/dashboard/EditComponentModal";
import { ApiEndpoint, ComponentConfig } from "@/types/api";

interface DashboardContentProps {
  components: ComponentConfig[];
  isEditMode: boolean;
  onComponentsChange: (components: ComponentConfig[]) => void;
  onAddComponentClick: () => void;
  endpoints: ApiEndpoint[];
}

export function DashboardContent({ 
  components, 
  isEditMode, 
  onComponentsChange, 
  onAddComponentClick,
  endpoints
}: DashboardContentProps) {
  const [editingComponent, setEditingComponent] = useState<ComponentConfig | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditComponent = (component: ComponentConfig) => {
    setEditingComponent(component);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedComponent = (editedComponent: ComponentConfig) => {
    const updatedComponents = components.map(comp => 
      comp.id === editedComponent.id ? editedComponent : comp
    );
    onComponentsChange(updatedComponents);
    setIsEditModalOpen(false);
    setEditingComponent(null);
  };

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
                isEditMode={isEditMode}
                onEdit={handleEditComponent}
              />
            ))}
          </GridLayout>
        </div>
      )}

      <EditComponentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEditedComponent}
        component={editingComponent}
        endpoints={endpoints}
      />
    </div>
  );
}
