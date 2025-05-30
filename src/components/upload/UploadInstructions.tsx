
interface UploadInstructionsProps {
  userId?: number;
}

export function UploadInstructions({ userId }: UploadInstructionsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Instructions</h3>
      <div className="space-y-2 text-sm text-gray-700">
        <p>Please ensure your CSV file follows the required format:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          <li>One diamond per row</li>
          <li>Required columns: Stock #, Shape, Carat (or Weight), Color, Clarity, Price</li>
          <li>Optional columns: Cut, Certificate, Status</li>
          <li>First row should contain column headers</li>
        </ul>
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Ready:</strong> Your CSV data will be uploaded directly to your FastAPI backend 
            and filtered by your user ID ({userId}).
          </p>
        </div>
        <p className="mt-4 text-gray-500 text-xs">
          Need a template? <a href="#" className="text-diamond-600 hover:underline">Download sample CSV</a>
        </p>
      </div>
    </div>
  );
}
