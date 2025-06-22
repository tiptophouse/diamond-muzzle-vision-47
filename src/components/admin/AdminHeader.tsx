
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, UserPlus, Settings } from 'lucide-react';

interface AdminHeaderProps {
  onExportData: () => void;
  onAddUser: () => void;
}

export function AdminHeader({ onExportData, onAddUser }: AdminHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-lg p-6 shadow-sm border">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="h-6 w-6 text-blue-600" />
          Admin Dashboard
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Manage users, monitor activity, and control system settings
        </p>
      </div>
      {/* Ensure buttons never overlap, with gap and flexible wrapping */}
      <div className="flex flex-col w-full sm:w-auto sm:flex-row gap-2 sm:gap-4 mt-4 sm:mt-0">
        <Button
          onClick={onExportData}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center w-full sm:w-auto"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
        <Button
          onClick={onAddUser}
          className="bg-blue-600 hover:bg-blue-700 flex items-center justify-center w-full sm:w-auto"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>
    </div>
  );
}
