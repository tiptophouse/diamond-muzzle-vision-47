
import { CheckCircle, AlertCircle } from "lucide-react";

interface UploadResultProps {
  result: {
    success: boolean;
    message: string;
    processedCount?: number;
    errors?: string[];
  } | null;
}

export function UploadResult({ result }: UploadResultProps) {
  if (!result) return null;

  return (
    <div className={`border rounded-lg p-4 space-y-3 ${
      result.success 
        ? 'bg-green-50 border-green-200' 
        : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-center">
        {result.success ? (
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
        ) : (
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
        )}
        <p className="text-sm font-medium">
          {result.success ? 'Upload Successful' : 'Upload Failed'}
        </p>
      </div>
      
      <div className="text-sm">
        <p className={result.success ? 'text-green-700' : 'text-red-700'}>
          {result.message}
        </p>
      </div>
      
      {result.processedCount && (
        <div className="text-sm">
          <p className="text-gray-600">
            Processed {result.processedCount} items
          </p>
        </div>
      )}
      
      {result.errors && result.errors.length > 0 && (
        <div className="text-sm">
          <p className="text-gray-500 font-medium">Errors:</p>
          <ul className="list-disc list-inside text-red-600 text-xs mt-1">
            {result.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
