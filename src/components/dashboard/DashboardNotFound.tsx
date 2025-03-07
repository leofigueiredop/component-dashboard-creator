
import { Button } from "@/components/ui/button";

export function DashboardNotFound() {
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
