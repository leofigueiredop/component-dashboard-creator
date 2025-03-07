
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, Save, Trash2, Settings } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { AddComponentModal } from "@/components/dashboard/AddComponentModal";
import { GridLayout } from "@/components/GridLayout";
import { DashboardComponent } from "@/components/dashboard/DashboardComponent";
import { ApiEndpoint, ComponentConfig, Dashboard as DashboardType } from "@/types/api";
import { fetchEndpoints, fetchDashboards, saveDashboard, deleteDashboard } from "@/lib/api";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-1/2">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-64 bg-muted/50 rounded"></div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Dashboard not found</h1>
          <Button asChild>
            <a href="/">Go back to dashboard list</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/")}
              className="hover:bg-background/80"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            {isEditMode ? (
              <div className="space-y-2">
                <Input
                  value={dashboardName}
                  onChange={(e) => setDashboardName(e.target.value)}
                  placeholder="Dashboard name"
                  className="text-xl font-bold h-auto py-1 px-2"
                />
                <Input
                  value={dashboardDescription}
                  onChange={(e) => setDashboardDescription(e.target.value)}
                  placeholder="Dashboard description"
                  className="text-sm text-muted-foreground h-auto py-1 px-2"
                />
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold">{dashboard.name}</h1>
                <p className="text-sm text-muted-foreground">{dashboard.description}</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDashboardName(dashboard.name);
                    setDashboardDescription(dashboard.description);
                    setIsEditMode(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveDashboard}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Dashboard"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditMode(true)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Dashboard
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your dashboard and all its components.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteDashboard}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
        
        {isEditMode && (
          <div className="mb-6 flex justify-center">
            <Button 
              onClick={() => setIsAddComponentModalOpen(true)}
              size="lg"
              className="animate-fade-in shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Component
            </Button>
          </div>
        )}
        
        <div className="mb-8">
          {dashboard.components.length === 0 ? (
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
                <Button onClick={() => setIsAddComponentModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Component
                </Button>
              )}
            </div>
          ) : (
            <div className="min-h-[500px] glass rounded-lg p-4">
              <GridLayout
                components={dashboard.components}
                onComponentsChange={handleComponentsChange}
                editable={isEditMode}
              >
                {dashboard.components.map((component) => (
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
