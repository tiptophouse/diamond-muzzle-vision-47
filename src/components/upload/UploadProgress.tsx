
import { Progress } from "@/components/ui/progress";

interface UploadProgressProps {
  progress: number;
  uploading: boolean;
}

export function UploadProgress({ progress, uploading }: UploadProgressProps) {
  if (!uploading) return null;

  return (
    <div className="space-y-2">
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-gray-500 text-right">
        {Math.round(progress)}%
      </p>
    </div>
  );
}
