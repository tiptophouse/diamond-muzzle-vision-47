
import { usePlatformDiamondCount } from '@/hooks/usePlatformDiamondCount';
import { Card, CardContent } from '@/components/ui/card';
import { Diamond, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function PlatformDiamondCount() {
  const { count, loading, error, refreshCount } = usePlatformDiamondCount();

  if (error) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-destructive">
            <Diamond className="h-4 w-4" />
            <span className="text-sm">Error loading count</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Diamond className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                {loading ? (
                  <div className="h-6 w-16 bg-blue-200 animate-pulse rounded" />
                ) : (
                  <span className="text-2xl font-bold text-blue-900">
                    {count.toLocaleString()}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshCount}
                  disabled={loading}
                  className="h-6 w-6 p-0 hover:bg-blue-100"
                >
                  <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
                </Button>
              </div>
              <p className="text-sm text-blue-700 font-medium">
                Total Diamonds on Platform
              </p>
              <p className="text-xs text-blue-600">
                Available for viewing and purchase
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
