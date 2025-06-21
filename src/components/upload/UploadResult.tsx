
import { CheckCircle, XCircle, AlertTriangle, TrendingUp, Diamond } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface UploadResult {
  success: boolean;
  message: string;
  processedCount?: number;
  errors?: string[];
  uploadedCount?: number;
  failedCount?: number;
}

interface UploadResultProps {
  result: UploadResult | null;
}

export function UploadResult({ result }: UploadResultProps) {
  if (!result) return null;

  return (
    <div className="space-y-4">
      {result.success ? (
        <div className="space-y-4">
          {/* Success Header */}
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800 font-medium">
              {result.message}
            </AlertDescription>
          </Alert>

          {/* Upload Statistics */}
          {(result.uploadedCount !== undefined || result.failedCount !== undefined) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Diamond className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-700">
                        {result.uploadedCount || 0}
                      </p>
                      <p className="text-sm text-green-600">Successfully Uploaded</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {result.failedCount ? (
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-full">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-orange-700">
                          {result.failedCount}
                        </p>
                        <p className="text-sm text-orange-600">Failed to Upload</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-700">
                        {result.processedCount || 0}
                      </p>
                      <p className="text-sm text-blue-600">Total Processed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Success Actions */}
          <div className="flex items-center justify-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <div className="text-center">
              <div className="text-green-600 mb-2">
                <CheckCircle className="h-8 w-8 mx-auto animate-pulse" />
              </div>
              <p className="text-sm font-medium text-gray-700">
                Your diamonds are now securely stored in your inventory
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Error Header */}
          <Alert className="border-red-200 bg-red-50" variant="destructive">
            <XCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800 font-medium">
              {result.message}
            </AlertDescription>
          </Alert>

          {/* Error Details */}
          {result.errors && result.errors.length > 0 && (
            <Card className="border-red-200">
              <CardContent className="pt-4">
                <h4 className="font-medium text-red-800 mb-2">Error Details:</h4>
                <div className="space-y-1">
                  {result.errors.map((error, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs">
                        Error {index + 1}
                      </Badge>
                      <span className="text-sm text-red-700">{error}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Troubleshooting Tips */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-4">
              <h4 className="font-medium text-yellow-800 mb-2">💡 Troubleshooting Tips:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Ensure your CSV has required columns: Stock Number, Shape, Carat, Color, Clarity, Cut, Price</li>
                <li>• Check that numeric values (carat, price) are properly formatted</li>
                <li>• Verify your internet connection is stable</li>
                <li>• Try uploading a smaller batch if the file is large</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
