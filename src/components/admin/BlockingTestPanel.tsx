import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { Shield, ShieldOff, TestTube } from 'lucide-react';

export function BlockingTestPanel() {
  const [testTelegramId, setTestTelegramId] = useState('');
  const { isUserBlocked, blockUser, unblockUser } = useBlockedUsers();
  const { toast } = useToast();

  const handleTestBlock = async () => {
    const telegramId = parseInt(testTelegramId);
    if (isNaN(telegramId)) {
      toast({
        title: "Invalid ID",
        description: "Please enter a valid Telegram ID",
        variant: "destructive"
      });
      return;
    }

    const blocked = isUserBlocked(telegramId);
    
    if (blocked) {
      await unblockUser(testTelegramId);
      toast({
        title: "User Unblocked",
        description: `User ${telegramId} has been unblocked for testing`
      });
    } else {
      await blockUser(telegramId, "Test block from admin panel");
      toast({
        title: "User Blocked",
        description: `User ${telegramId} has been blocked. They should lose access immediately.`
      });
    }
  };

  const handleCheckStatus = () => {
    const telegramId = parseInt(testTelegramId);
    if (isNaN(telegramId)) {
      toast({
        title: "Invalid ID",
        description: "Please enter a valid Telegram ID",
        variant: "destructive"
      });
      return;
    }

    const blocked = isUserBlocked(telegramId);
    toast({
      title: blocked ? "User is Blocked" : "User is Active",
      description: blocked 
        ? `User ${telegramId} is currently blocked and should not have access` 
        : `User ${telegramId} is active and has access`,
      variant: blocked ? "destructive" : "default"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Blocking System Test
        </CardTitle>
        <CardDescription>
          Test the user blocking enforcement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800 font-medium mb-2">⚠️ Testing Instructions:</p>
          <ol className="text-xs text-yellow-700 space-y-1 list-decimal list-inside">
            <li>Enter a Telegram ID to test</li>
            <li>Click "Check Status" to see current blocking state</li>
            <li>Click "Toggle Block" to block/unblock the user</li>
            <li>Have the user refresh their app - they should be blocked immediately</li>
            <li>Check console logs for detailed blocking enforcement messages</li>
          </ol>
        </div>

        <div className="space-y-2">
          <Label htmlFor="testTelegramId">Test Telegram ID</Label>
          <Input
            id="testTelegramId"
            type="number"
            placeholder="Enter Telegram ID (e.g., 123456789)"
            value={testTelegramId}
            onChange={(e) => setTestTelegramId(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleCheckStatus}
            variant="outline"
            className="w-full"
          >
            <Shield className="mr-2 h-4 w-4" />
            Check Status
          </Button>
          <Button
            onClick={handleTestBlock}
            variant={testTelegramId && isUserBlocked(parseInt(testTelegramId)) ? "default" : "destructive"}
            className="w-full"
          >
            {testTelegramId && isUserBlocked(parseInt(testTelegramId)) ? (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Unblock User
              </>
            ) : (
              <>
                <ShieldOff className="mr-2 h-4 w-4" />
                Block User
              </>
            )}
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-800">
            <strong>How blocking works:</strong>
          </p>
          <ul className="text-xs text-blue-700 mt-2 space-y-1">
            <li>✓ Checked on every page load in AuthorizationGuard</li>
            <li>✓ Blocked users see "Access Denied" screen</li>
            <li>✓ No access to any app functionality</li>
            <li>✓ RLS policies prevent data access</li>
            <li>✓ Admin users are never blocked</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
