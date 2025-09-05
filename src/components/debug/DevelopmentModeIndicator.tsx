import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Code2, Zap, Users } from 'lucide-react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

export function DevelopmentModeIndicator() {
  const { user, isAuthenticated, isTelegramEnvironment } = useTelegramAuth();
  const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
  
  if (!isDevelopment) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800 shadow-lg">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Code2 className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <Badge variant="outline" className="text-yellow-700 border-yellow-300 dark:text-yellow-300 dark:border-yellow-700">
              Development Mode
            </Badge>
          </div>
          
          <div className="space-y-1 text-xs text-yellow-700 dark:text-yellow-300">
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3" />
              <span>Mock Auth: {isAuthenticated ? 'Active' : 'Inactive'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="w-3 h-3" />
              <span>User: {user?.first_name || 'None'} ({user?.id || 'N/A'})</span>
            </div>
            
            <div className="text-xs opacity-75">
              Telegram: {isTelegramEnvironment ? 'Yes' : 'No'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}