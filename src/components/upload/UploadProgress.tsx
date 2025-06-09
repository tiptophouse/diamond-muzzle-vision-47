
import { Progress } from "@/components/ui/progress";

interface UploadProgressProps {
  progress: number;
  uploading?: boolean;
}

export function UploadProgress({ progress, uploading = false }: UploadProgressProps) {
  if (!uploading && progress === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-700">Upload Progress</h4>
        <span className="text-sm text-slate-500">{Math.round(progress)}%</span>
      </div>
      <div className="relative">
        <Progress value={progress} className="h-3" />
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      {uploading && (
        <p className="text-xs text-slate-500 text-center">
          Processing your diamonds...
        </p>
      )}
    </div>
  );
}
