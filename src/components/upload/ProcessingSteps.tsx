import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProcessingStep {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

interface ProcessingStepsProps {
  progress: number;
  uploading: boolean;
}

export function ProcessingSteps({ progress, uploading }: ProcessingStepsProps) {
  if (!uploading) return null;

  const getSteps = (progress: number): ProcessingStep[] => [
    {
      id: 'parse',
      label: 'Parsing File',
      description: 'Reading CSV/XLSX data',
      status: progress >= 20 ? 'completed' : progress >= 0 ? 'active' : 'pending'
    },
    {
      id: 'map',
      label: 'Smart Field Mapping',
      description: 'AI-powered column detection',
      status: progress >= 30 ? 'completed' : progress >= 20 ? 'active' : 'pending'
    },
    {
      id: 'enhance',
      label: 'Data Enhancement',
      description: 'Validating diamond properties',
      status: progress >= 70 ? 'completed' : progress >= 30 ? 'active' : 'pending'
    },
    {
      id: 'upload',
      label: 'Uploading Diamonds',
      description: 'Adding to your inventory',
      status: progress >= 95 ? 'completed' : progress >= 70 ? 'active' : 'pending'
    },
    {
      id: 'summary',
      label: 'Generating Summary',
      description: 'Creating AI analysis',
      status: progress >= 100 ? 'completed' : progress >= 95 ? 'active' : 'pending'
    }
  ];

  const steps = getSteps(progress);

  return (
    <div className="space-y-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
        <h3 className="text-sm font-semibold text-blue-800">Processing Your Upload</h3>
        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
          {Math.round(progress)}%
        </span>
      </div>

      <Progress value={progress} className="h-2 mb-4" />

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {step.status === 'completed' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : step.status === 'active' ? (
                <div className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
              ) : step.status === 'error' ? (
                <AlertCircle className="h-5 w-5 text-red-600" />
              ) : (
                <Clock className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${
                step.status === 'completed' ? 'text-green-700' :
                step.status === 'active' ? 'text-blue-700' :
                step.status === 'error' ? 'text-red-700' :
                'text-gray-500'
              }`}>
                {step.label}
              </p>
              <p className="text-xs text-gray-600">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}