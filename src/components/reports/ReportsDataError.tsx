
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportsDataErrorProps {
  error: string;
  retryCount: number;
  onRetry: () => void;
}

export function ReportsDataError({ error, retryCount, onRetry }: ReportsDataErrorProps) {
  return (
    <div className="flex items-center justify-center min-h-64 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-orange-600">Data Loading Error</CardTitle>
          <CardDescription>
            Failed to load report data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            {error}
          </p>
          <div className="flex gap-2">
            <Button onClick={onRetry} className="flex-1" disabled={retryCount >= 3}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry ({3 - retryCount} left)
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline" className="flex-1">
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
