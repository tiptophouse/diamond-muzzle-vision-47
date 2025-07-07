
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, RotateCcw } from 'lucide-react';

interface FormActionsProps {
  onReset: () => void;
  isLoading?: boolean;
}

export function FormActions({ onReset, isLoading = false }: FormActionsProps) {
  return (
    <div className="flex flex-col gap-4 p-4 border-t bg-gray-50">
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3" />
            Uploading Diamond...
          </>
        ) : (
          <>
            <Upload className="h-5 w-5 mr-3" />
            Add Diamond to Inventory
          </>
        )}
      </Button>
      
      <Button
        type="button"
        variant="outline"
        onClick={onReset}
        disabled={isLoading}
        className="w-full h-12 text-base border-2 border-gray-300 hover:border-gray-400"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset Form
      </Button>
    </div>
  );
}
