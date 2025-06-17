
import React from 'react';

interface AdminDataSourceStatusProps {
  dataSource: 'fastapi' | 'supabase';
  usersCount: number;
  stats?: {
    activeUsers: number;
    premiumUsers: number;
    totalRevenue: number;
  } | null;
}

export function AdminDataSourceStatus({ dataSource, usersCount, stats }: AdminDataSourceStatusProps) {
  return (
    <div className={`border rounded-lg p-4 mb-6 ${dataSource === 'fastapi' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${dataSource === 'fastapi' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
        <span className={`font-medium ${dataSource === 'fastapi' ? 'text-green-800' : 'text-blue-800'}`}>
          {dataSource === 'fastapi' ? 'FastAPI Backend Connected' : 'Supabase Database Connected'}: {usersCount} users loaded
        </span>
      </div>
      {stats && (
        <div className={`text-sm mt-2 ${dataSource === 'fastapi' ? 'text-green-700' : 'text-blue-700'}`}>
          Active Users: {stats.activeUsers} • 
          Premium Users: {stats.premiumUsers} • 
          Revenue: ${stats.totalRevenue.toFixed(2)}
        </div>
      )}
    </div>
  );
}
