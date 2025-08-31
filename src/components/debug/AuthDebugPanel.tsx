
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, Clock, SkipForward } from 'lucide-react';

interface AuthDebugStep {
  step: string;
  status: 'pending' | 'success' | 'error' | 'skipped';
  message: string;
  timestamp: number;
  error?: string;
}

interface AuthDebugPanelProps {
  debugSteps: AuthDebugStep[];
  user: any;
  isAuthenticated: boolean;
  error: string | null;
}

export function AuthDebugPanel({ debugSteps, user, isAuthenticated, error }: AuthDebugPanelProps) {
  const getStatusIcon = (status: AuthDebugStep['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'skipped':
        return <SkipForward className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: AuthDebugStep['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'skipped':
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔍 Authentication Debug Panel
            <Badge variant={isAuthenticated ? "default" : "destructive"}>
              {isAuthenticated ? "Authenticated" : "Failed"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800">Current User:</h4>
              <p className="text-sm text-blue-700">
                {user.first_name} {user.last_name} (ID: {user.id})
              </p>
              {user.username && (
                <p className="text-sm text-blue-600">@{user.username}</p>
              )}
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800">Error:</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <ScrollArea className="h-80">
            <div className="space-y-2">
              {debugSteps.map((step, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${getStatusColor(step.status)}`}
                >
                  <div className="flex items-start gap-2">
                    {getStatusIcon(step.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm capitalize">
                          {step.step.replace('-', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(step.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{step.message}</p>
                      {step.error && (
                        <p className="text-xs text-red-600 mt-1 font-mono bg-red-50 p-1 rounded">
                          {step.error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
