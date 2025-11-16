import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function TestAuth() {
  const { user, isAuthenticated, isLoading } = useTelegramAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center">Auth Debug</h1>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between p-2 bg-muted rounded">
            <span>Loading:</span>
            <strong>{isLoading ? '🔄 Yes' : '✅ No'}</strong>
          </div>
          
          <div className="flex justify-between p-2 bg-muted rounded">
            <span>Authenticated:</span>
            <strong>{isAuthenticated ? '✅ Yes' : '❌ No'}</strong>
          </div>
          
          <div className="flex justify-between p-2 bg-muted rounded">
            <span>User ID:</span>
            <strong>{user?.id || '❌ NULL'}</strong>
          </div>
          
          <div className="flex justify-between p-2 bg-muted rounded">
            <span>User Name:</span>
            <strong>{user?.first_name || '❌ NULL'}</strong>
          </div>
        </div>

        <div className="space-y-2 text-xs bg-blue-50 p-3 rounded">
          <p className="font-bold">🔧 To Enable Testing:</p>
          <p>Add to your URL:</p>
          <code className="block bg-white p-2 rounded">
            ?test_user_id=123456
          </code>
        </div>

        <Button 
          onClick={() => window.location.href = '/?test_user_id=123456'}
          className="w-full"
        >
          ✅ Enable Test Mode
        </Button>
      </Card>
    </div>
  );
}
