
interface DashboardHeaderProps {
  emergencyMode: boolean;
}

export function DashboardHeader({ emergencyMode }: DashboardHeaderProps) {
  return (
    <div className="text-center mb-4">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Real-time insights and analytics
      </p>
      
      {/* Emergency mode indicator */}
      {emergencyMode && (
        <div className="mt-2 text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded">
          Emergency Mode: Using fallback data
        </div>
      )}
    </div>
  );
}
