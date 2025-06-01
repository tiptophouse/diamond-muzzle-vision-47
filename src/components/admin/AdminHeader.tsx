
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, UserPlus, Sparkles } from 'lucide-react';

interface AdminHeaderProps {
  onExportData: () => void;
  onAddUser: () => void;
}

export function AdminHeader({ onExportData, onAddUser }: AdminHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold cosmic-text flex items-center gap-3">
          🦄 Cosmic User Control
          <Sparkles className="h-8 w-8 text-purple-400 animate-pulse" />
        </h1>
        <p className="text-cyan-300 text-sm sm:text-base">
          Master the unicorn realm with ultimate user management powers
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Button 
          onClick={onExportData} 
          variant="outline" 
          className="glass-card border-purple-500/30 text-purple-300 hover:bg-purple-500/20 w-full sm:w-auto"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
        <Button onClick={onAddUser} className="cosmic-button w-full sm:w-auto">
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>
    </div>
  );
}
