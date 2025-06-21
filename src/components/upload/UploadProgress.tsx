
import { Progress } from '@/components/ui/progress';
import { Loader2, Upload, CheckCircle, Database } from 'lucide-react';

interface UploadProgressProps {
  progress: number;
  uploading: boolean;
}

export function UploadProgress({ progress, uploading }: UploadProgressProps) {
  if (!uploading && progress === 0) return null;

  const getProgressStage = () => {
    if (progress < 30) return { stage: 'Parsing CSV file...', icon: Upload };
    if (progress < 50) return { stage: 'Processing diamonds...', icon: Database };
    if (progress < 100) return { stage: 'Uploading to secure storage...', icon: Loader2 };
    return { stage: 'Upload complete!', icon: CheckCircle };
  };

  const { stage, icon: Icon } = getProgressStage();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex-shrink-0">
          <Icon 
            className={`h-5 w-5 text-blue-600 ${
              uploading && progress < 100 ? 'animate-spin' : ''
            }`} 
          />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-900">{stage}</span>
            <span className="text-sm font-bold text-blue-700">{Math.round(progress)}%</span>
          </div>
          <Progress 
            value={progress} 
            className="h-2 bg-blue-100" 
          />
        </div>
      </div>

      {uploading && (
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Please keep this tab open while uploading...
          </p>
        </div>
      )}
    </div>
  );
}
