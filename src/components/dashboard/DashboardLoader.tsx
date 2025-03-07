
export function DashboardLoader() {
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
