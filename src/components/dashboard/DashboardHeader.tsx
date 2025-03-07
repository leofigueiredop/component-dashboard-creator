
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Settings, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Dashboard } from "@/types/api";

interface DashboardHeaderProps {
  dashboard: Dashboard;
  isEditMode: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  dashboardName: string;
  dashboardDescription: string;
  setDashboardName: (name: string) => void;
  setDashboardDescription: (description: string) => void;
}

export function DashboardHeader({
  dashboard,
  isEditMode,
  isSaving,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  dashboardName,
  dashboardDescription,
  setDashboardName,
  setDashboardDescription
}: DashboardHeaderProps) {
  const navigate = useNavigate();

  return (
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
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Dashboard"}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={onEdit}
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
                  <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </div>
  );
}
