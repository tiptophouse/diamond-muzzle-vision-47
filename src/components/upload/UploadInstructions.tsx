
interface UploadInstructionsProps {
  userId?: number;
}

export function UploadInstructions({ userId }: UploadInstructionsProps) {
  return (
    <div className="space-y-4">
      <details className="group">
        <summary className="cursor-pointer list-none">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation">
            <h3 className="text-lg font-medium">🧠 Smart CSV Processing</h3>
            <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
          </div>
        </summary>
        
        <div className="mt-4 space-y-3 px-2">
          <p className="text-sm sm:text-base text-gray-700">
            Our intelligent system automatically maps your CSV columns - no need to format your file!
          </p>
          
          <div className="grid gap-3 sm:gap-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>🎯 Smart Detection:</strong> Automatically recognizes Stock/SKU, Shape, Carat/Weight, 
                Color, Clarity, Cut, Price, Lab, Certificate#, and more!
              </p>
            </div>
            
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>✅ Multi-Language:</strong> Supports field names in English, Spanish, French, Portuguese
              </p>
            </div>
            
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>💡 Mobile Ready:</strong> Optimized for phone and tablet uploads with intelligent processing
              </p>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 text-center mt-4 p-2 bg-gray-100 rounded">
            User ID: {userId} • Uploads to FastAPI with smart mapping
          </div>
        </div>
      </details>
    </div>
  );
}
