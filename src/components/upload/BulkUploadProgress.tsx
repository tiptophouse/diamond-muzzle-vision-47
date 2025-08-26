
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

export function BulkUploadProgress() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div>
              <h3 className="font-medium">Processing CSV File</h3>
              <p className="text-sm text-muted-foreground">
                Analyzing columns and validating diamond data...
              </p>
            </div>
          </div>
          <Progress value={undefined} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
