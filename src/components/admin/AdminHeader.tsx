
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Download, UserPlus } from 'lucide-react';

interface AdminHeaderProps {
  onExportData: () => void;
  onAddUser: () => void;
}

export function AdminHeader({ onExportData, onAddUser }: AdminHeaderProps) {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-700 rounded-xl">
            <Settings className="h-8 w-8 text-slate-300" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400 mt-1">Manage users, monitor activity, and control system settings</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={onExportData}
            variant="outline"
            className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button
            onClick={onAddUser}
            className="bg-slate-700 hover:bg-slate-600 text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>
    </div>
  );
}
