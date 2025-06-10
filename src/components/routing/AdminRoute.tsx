
import { ReactNode } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Navigate } from 'react-router-dom';
import { Crown, AlertTriangle } from 'lucide-react';

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isAdmin, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4 border">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Verifying Admin Access</h3>
          <p className="text-gray-600 text-sm">Checking administrator permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-center gap-3 p-4">
          <Crown className="h-5 w-5 text-yellow-600" />
          <span className="font-semibold text-gray-900">
            Admin Dashboard - Welcome, {user?.first_name}
          </span>
          <div className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">
            Verified ID: {user?.id}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
