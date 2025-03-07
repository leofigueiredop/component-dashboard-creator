
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddComponentModal } from "@/components/dashboard/AddComponentModal";
import { ComponentConfig, Dashboard } from "@/types/api";
import { fetchEndpoints, fetchDashboards, saveDashboard } from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Index = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboards() {
      setIsLoading(true);
      try {
        const data = await fetchDashboards();
        setDashboards(data);
      } catch (error) {
        console.error("Failed to load dashboards:", error);
        toast.error("Failed to load dashboards");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadDashboards();
  }, []);

  const handleCreateDashboard = async () => {
    try {
      const newDashboard = {
        name: "New Dashboard",
        description: "A new dashboard",
        components: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const savedDashboard = await saveDashboard(newDashboard);
      toast.success("Dashboard created successfully");
      
      // Redirect to the new dashboard
      window.location.href = `/dashboard/${savedDashboard.id}`;
    } catch (error) {
      console.error("Failed to create dashboard:", error);
      toast.error("Failed to create dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto py-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-2 text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter animate-fade-in">
              Custom Dashboard Creator
            </h1>
            <p className="text-muted-foreground animate-fade-in delay-100">
              Create and customize your own dashboards with powerful data visualization components
            </p>
          </div>
          
          <div className="flex justify-center mb-12">
            <Button 
              size="lg" 
              onClick={handleCreateDashboard}
              className="animate-fade-in delay-200 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Dashboard
            </Button>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-1/3"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted/50 rounded"></div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-10 bg-muted rounded w-1/4"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : dashboards.length > 0 ? (
            <div className="space-y-6">
              <h2 className="text-xl font-medium mb-4">Your Dashboards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboards.map((dashboard) => (
                  <Card key={dashboard.id} className="glass card-hover animate-fade-in">
                    <CardHeader>
                      <CardTitle>{dashboard.name}</CardTitle>
                      <CardDescription>{dashboard.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {dashboard.components.length} components
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Last updated: {new Date(dashboard.updatedAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button asChild>
                        <Link to={`/dashboard/${dashboard.id}`}>
                          Open Dashboard
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 animate-fade-in">
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
                  className="mx-auto"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">No dashboards yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first dashboard to get started
              </p>
              <Button onClick={handleCreateDashboard}>
                <Plus className="mr-2 h-4 w-4" />
                Create Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
