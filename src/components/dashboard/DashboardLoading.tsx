
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardLoadingProps {
  onEmergencyMode: () => void;
}

export function DashboardLoading({ onEmergencyMode }: DashboardLoadingProps) {
  return (
    <Layout>
      <div className="space-y-4 p-2 sm:p-4">
        <div className="text-center mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Loading your data safely...</p>
          
          {/* Emergency mode toggle */}
          <button 
            onClick={onEmergencyMode}
            className="mt-2 text-xs bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded"
          >
            Skip to Emergency Mode
          </button>
        </div>
        
        <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-3">
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
