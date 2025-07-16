import { Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  emergencyMode: boolean;
}

export function DashboardHeader({
  emergencyMode
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-card border-b border-border">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#0088cc] rounded-full flex items-center justify-center">
          <span className="text-white text-lg font-bold">D</span>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
          <p className="text-xs text-muted-foreground">Diamond Inventory</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#0088cc] rounded-full"></span>
        </Button>
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
      
      {emergencyMode && (
        <div className="mt-2 text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded">
          Emergency Mode: Using fallback data
        </div>
      )}
    </div>
  );
}