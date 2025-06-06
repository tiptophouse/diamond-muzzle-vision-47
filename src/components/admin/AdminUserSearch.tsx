
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface AdminUserSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function AdminUserSearch({ searchTerm, onSearchChange }: AdminUserSearchProps) {
  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
      <Input
        placeholder="Search by name, Telegram ID, username, or phone..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 pl-10 focus:border-slate-500 focus:ring-slate-500"
      />
    </div>
  );
}
