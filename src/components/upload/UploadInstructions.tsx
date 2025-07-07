
interface UploadInstructionsProps {
  userId?: number;
}

export function UploadInstructions({ userId }: UploadInstructionsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">🧠 Smart CSV Processing</h3>
      <div className="space-y-2 text-sm text-gray-700">
        <p>Our intelligent system automatically maps your CSV columns - no need to format your file!</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          <li><strong>Any Format Welcome:</strong> Upload your existing CSV files as-is</li>
          <li><strong>Smart Field Detection:</strong> Automatically maps columns like "Carat", "Weight", "Size", etc.</li>
          <li><strong>Multiple Languages:</strong> Supports field names in English, Spanish, French, Portuguese</li>
          <li><strong>Flexible Headers:</strong> Works with "Stock Number", "SKU", "ID", "Reference", etc.</li>
          <li><strong>Auto-Complete Missing:</strong> Fills in standard values for unmapped fields</li>
        </ul>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>🎯 Supported Fields:</strong> Stock/SKU, Shape, Carat/Weight, Color, Clarity, Cut, Price, 
            Lab, Certificate#, Fluorescence, Length, Width, Depth, Table%, and many more variations!
          </p>
        </div>
        
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>✅ Ready:</strong> Your processed data uploads directly to your FastAPI backend 
            (User ID: {userId}) with intelligent field mapping applied.
          </p>
        </div>
        
        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            <strong>💡 Pro Tip:</strong> After upload, check the mapping details to see exactly how your fields were processed. 
            The system shows confidence levels for each mapping.
          </p>
        </div>
      </div>
    </div>
  );
}
