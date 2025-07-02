
import { CheckCircle } from "lucide-react";

interface UploadResultProps {
  result: {
    totalItems: number;
    matchedPairs: number;
    errors: string[];
  } | null;
}

export function UploadResult({ result }: UploadResultProps) {
  if (!result) return null;

  return (
    <div className="bg-diamond-50 border border-diamond-100 rounded-lg p-4 space-y-3">
      <div className="flex items-center">
        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
        <p className="text-sm font-medium">File processed</p>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-gray-500">Total Items</p>
          <p className="font-medium">{result.totalItems}</p>
        </div>
        <div>
          <p className="text-gray-500">Status</p>
          <p className="font-medium text-green-600">Uploaded Successfully</p>
        </div>
      </div>
      
      {result.errors.length > 0 && (
        <div className="text-sm">
          <p className="text-gray-500">Errors</p>
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
