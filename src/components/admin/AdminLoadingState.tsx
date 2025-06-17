
import React from 'react';
import { Settings } from 'lucide-react';

export function AdminLoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="text-center py-12">
        <div className="relative inline-block">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
          <Settings className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-600" />
        </div>
        <div className="text-xl font-semibold text-gray-900">Loading admin data...</div>
        <div className="text-sm text-gray-600 mt-2">Connecting to user database</div>
      </div>
    </div>
  );
}
