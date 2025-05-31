
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface InsightsHeaderProps {
  totalDiamonds: number;
  loading: boolean;
  onRefresh: () => void;
}

export function InsightsHeader({ totalDiamonds, loading, onRefresh }: InsightsHeaderProps) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold">Market Insights</h1>
        <p className="text-muted-foreground">
          Real-time analytics from your {totalDiamonds} diamonds
        </p>
      </div>
      
      <Button onClick={onRefresh} disabled={loading}>
        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
    </div>
  );
}
