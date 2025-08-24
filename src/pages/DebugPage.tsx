
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FastApiTester } from '@/components/debug/FastApiTester';
import { ApiTestButton } from '@/components/ui/ApiTestButton';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Badge } from '@/components/ui/badge';

export default function DebugPage() {
  const { user, isAuthenticated, isTelegramEnvironment } = useTelegramAuth();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <span>Authentication:</span>
              <Badge variant={isAuthenticated ? "default" : "destructive"}>
                {isAuthenticated ? "✅ Authenticated" : "❌ Not Authenticated"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Telegram Environment:</span>
              <Badge variant={isTelegramEnvironment ? "default" : "secondary"}>
                {isTelegramEnvironment ? "✅ Telegram" : "⚠️ Browser"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>User ID:</span>
              <Badge variant="outline">
                {user?.id || 'None'}
              </Badge>
            </div>
          </div>
          
          {user && (
            <div className="text-sm text-muted-foreground">
              Logged in as: {user.first_name} {user.last_name} (@{user.username})
            </div>
          )}
        </CardContent>
      </Card>

      <ApiTestButton />
      
      <FastApiTester />
    </div>
  );
}
