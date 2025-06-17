
import React from 'react';

interface AdminErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function AdminErrorState({ error, onRetry }: AdminErrorStateProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="text-center py-12">
        <div className="text-xl font-semibold text-red-900 mb-4">Failed to Load Admin Data</div>
        <div className="text-sm text-red-600 mb-6">{error}</div>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
}
