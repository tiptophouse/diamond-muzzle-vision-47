
import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, RefreshCw, Server } from "lucide-react";
import { diagnoseFastAPIBackend, BackendDiagnosticResult } from "@/services/backendDiagnostics";

export function BackendStatusIndicator() {
  const [diagnostics, setDiagnostics] = useState<BackendDiagnosticResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const runDiagnostics = async () => {
    setIsLoading(true);
    try {
      const result = await diagnoseFastAPIBackend();
      setDiagnostics(result);
      
      // Auto-show details if there are issues
      if (!result.isReachable || !result.hasAuth || !result.hasData) {
        setShowDetails(true);
      }
    } catch (error) {
      console.error('Failed to run diagnostics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  if (!diagnostics && !isLoading) {
    return null;
  }

  const getStatusColor = () => {
    if (!diagnostics) return 'default';
    if (diagnostics.isReachable && diagnostics.hasAuth && diagnostics.hasData) {
      return 'default';
    }
    return 'destructive';
  };

  const getStatusIcon = () => {
    if (isLoading) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (!diagnostics) return <Server className="h-4 w-4" />;
    if (diagnostics.isReachable && diagnostics.hasAuth && diagnostics.hasData) {
      return <CheckCircle className="h-4 w-4" />;
    }
    return <AlertCircle className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (isLoading) return 'Checking...';
    if (!diagnostics) return 'Backend Status';
    if (diagnostics.isReachable && diagnostics.hasAuth && diagnostics.hasData) {
      return `Connected (${diagnostics.userDiamondCount} diamonds)`;
    }
    return 'Backend Issues';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant={getStatusColor()} className="flex items-center gap-1">
          {getStatusIcon()}
          {getStatusText()}
        </Badge>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs"
        >
          {showDetails ? 'Hide' : 'Details'}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={runDiagnostics}
          disabled={isLoading}
          className="text-xs"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {showDetails && diagnostics && (
        <Alert className={diagnostics.isReachable && diagnostics.hasAuth && diagnostics.hasData ? 'border-green-200' : 'border-red-200'}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <div className="text-sm">
              <div className="font-medium mb-2">Backend Status:</div>
              <ul className="space-y-1 text-xs">
                <li className="flex items-center gap-2">
                  {diagnostics.isReachable ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-red-500" />
                  )}
                  Server Reachable: {diagnostics.isReachable ? 'Yes' : 'No'}
                </li>
                <li className="flex items-center gap-2">
                  {diagnostics.hasAuth ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-red-500" />
                  )}
                  Authentication: {diagnostics.hasAuth ? 'Configured' : 'Missing'}
                </li>
                <li className="flex items-center gap-2">
                  {diagnostics.hasData ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-red-500" />
                  )}
                  Data Access: {diagnostics.hasData ? `${diagnostics.userDiamondCount} diamonds` : 'No data'}
                </li>
              </ul>
            </div>
            
            {diagnostics.recommendations.length > 0 && (
              <div className="text-sm">
                <div className="font-medium mb-1">Recommendations:</div>
                <ul className="space-y-1 text-xs">
                  {diagnostics.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {diagnostics.errorDetails && (
              <div className="text-sm">
                <div className="font-medium mb-1">Error Details:</div>
                <div className="text-xs text-red-600">{diagnostics.errorDetails}</div>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
