
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ApiEndpoint, ComponentConfig, Dashboard as DashboardType } from "@/types/api";
import { fetchEndpoints, fetchDashboards, saveDashboard, deleteDashboard } from "@/lib/api";
import { AddComponentModal } from "@/components/dashboard/AddComponentModal";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardControls } from "@/components/dashboard/DashboardControls";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { DashboardLoader } from "@/components/dashboard/DashboardLoader";
import { DashboardNotFound } from "@/components/dashboard/DashboardNotFound";

const Dashboard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [dashboard, setDashboard] = useState<DashboardType | null>(null);
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddComponentModalOpen, setIsAddComponentModalOpen] = useState(false);
  const [dashboardName, setDashboardName] = useState("");
  const [dashboardDescription, setDashboardDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Load endpoints
        const endpointsData = await fetchEndpoints();
        setEndpoints(endpointsData);
        
        // Load dashboard
        const dashboardsData = await fetchDashboards();
        const dashboard = dashboardsData.find(d => d.id === id);
        
        if (dashboard) {
          setDashboard(dashboard);
          setDashboardName(dashboard.name);
          setDashboardDescription(dashboard.description);
        } else {
          toast.error("Dashboard not found");
          navigate("/");
        }
      } catch (error) {
        console.error("Failed to load dashboard:", error);
        toast.error("Failed to load dashboard");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadDashboard();
  }, [id, navigate]);

  const handleAddComponent = (component: ComponentConfig) => {
    if (!dashboard) return;
    
    setDashboard({
      ...dashboard,
      components: [...dashboard.components, component]
    });
    
    toast.success("Component added successfully");
  };

  const handleComponentsChange = (updatedComponents: ComponentConfig[]) => {
    if (!dashboard) return;
    
    setDashboard({
      ...dashboard,
      components: updatedComponents
    });
  };

  const handleSaveDashboard = async () => {
    if (!dashboard) return;
    
    setIsSaving(true);
    try {
      const updatedDashboard = {
        ...dashboard,
        name: dashboardName,
        description: dashboardDescription,
        updatedAt: new Date().toISOString()
      };
      
      await saveDashboard(updatedDashboard);
      setDashboard(updatedDashboard);
      toast.success("Dashboard saved successfully");
      setIsEditMode(false);
    } catch (error) {
      console.error("Failed to save dashboard:", error);
      toast.error("Failed to save dashboard");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDashboard = async () => {
    if (!dashboard) return;
    
    try {
      await deleteDashboard(dashboard.id);
      toast.success("Dashboard deleted successfully");
      navigate("/");
    } catch (error) {
      console.error("Failed to delete dashboard:", error);
      toast.error("Failed to delete dashboard");
    }
  };

  const handleCancelEdit = () => {
    setDashboardName(dashboard?.name || "");
    setDashboardDescription(dashboard?.description || "");
    setIsEditMode(false);
  };

  if (isLoading) {
    return <DashboardLoader />;
  }

  if (!dashboard) {
    return <DashboardNotFound />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto py-8 px-4">
        <DashboardHeader
          dashboard={dashboard}
          isEditMode={isEditMode}
          isSaving={isSaving}
          onEdit={() => setIsEditMode(true)}
          onCancel={handleCancelEdit}
          onSave={handleSaveDashboard}
          onDelete={handleDeleteDashboard}
          dashboardName={dashboardName}
          dashboardDescription={dashboardDescription}
          setDashboardName={setDashboardName}
          setDashboardDescription={setDashboardDescription}
        />
        
        <DashboardControls 
          isEditMode={isEditMode}
          onAddComponent={() => setIsAddComponentModalOpen(true)}
        />
        
        <DashboardContent
          components={dashboard.components}
          isEditMode={isEditMode}
          onComponentsChange={handleComponentsChange}
          onAddComponentClick={() => setIsAddComponentModalOpen(true)}
          endpoints={endpoints}
        />
        
        <AddComponentModal
          isOpen={isAddComponentModalOpen}
          onClose={() => setIsAddComponentModalOpen(false)}
          onAddComponent={handleAddComponent}
          endpoints={endpoints}
        />
      </div>
    </div>
  );
};

export default Dashboard;
