
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { backendHealthService } from "@/services/backendHealthService";
import { RefreshCw, Server, Database, AlertTriangle } from "lucide-react";

export function BackendStatusIndicator() {
  const [status, setStatus] = useState(backendHealthService.getStatus());
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      setIsChecking(true);
      const newStatus = await backendHealthService.checkBackendHealth();
      setStatus(newStatus);
      setIsChecking(false);
    };

    checkHealth();
    
    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (status.fastApiAvailable && status.supabaseAvailable) return "bg-green-500";
    if (status.fastApiAvailable || status.supabaseAvailable) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusText = () => {
    if (status.fastApiAvailable && status.supabaseAvailable) return "All Systems Online";
    if (status.fastApiAvailable) return "FastAPI Only";
    if (status.supabaseAvailable) return "Supabase Only";
    return "Systems Down";
  };

  const getIcon = () => {
    if (isChecking) return <RefreshCw className="h-3 w-3 animate-spin" />;
    if (status.recommendedMethod === 'fastapi') return <Server className="h-3 w-3" />;
    if (status.recommendedMethod === 'supabase') return <Database className="h-3 w-3" />;
    return <AlertTriangle className="h-3 w-3" />;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`${getStatusColor()} text-white border-none`}
          >
            {getIcon()}
            <span className="ml-1 text-xs">{status.recommendedMethod.toUpperCase()}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm space-y-1">
            <p className="font-medium">{getStatusText()}</p>
            <p>FastAPI: {status.fastApiAvailable ? '✅' : '❌'}</p>
            <p>Supabase: {status.supabaseAvailable ? '✅' : '❌'}</p>
            <p>Using: {status.recommendedMethod}</p>
            <p className="text-xs text-muted-foreground">
              Last checked: {status.lastChecked.toLocaleTimeString()}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
