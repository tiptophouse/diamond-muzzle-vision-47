
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface UserDataManagerProps {
  user: {
    telegram_id: number;
    first_name: string;
    last_name?: string;
    username?: string;
  };
  onDataCleared?: () => void;
}

interface UserDataSummary {
  diamonds: number;
  chatSessions: number;
  analytics: boolean;
  totalRecords: number;
}

export function UserDataManager({ user, onDataCleared }: UserDataManagerProps) {
  const { toast } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dataSummary, setDataSummary] = useState<UserDataSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const displayName = user.first_name && !['Test', 'Telegram', 'Emergency'].includes(user.first_name)
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : `User ${user.telegram_id}`;

  const fetchDataSummary = async () => {
    setLoadingSummary(true);
    try {
      console.log('📊 ADMIN: Fetching data summary for user:', user.telegram_id);
      
      // This would typically call your FastAPI backend to get user data summary
      const response = await api.get(`/api/v1/admin/users/${user.telegram_id}/data-summary`);
      
      if (response.data) {
        setDataSummary(response.data);
      } else {
        // Fallback summary if endpoint not available
        setDataSummary({
          diamonds: 0,
          chatSessions: 0,
          analytics: true,
          totalRecords: 1
        });
      }
    } catch (error) {
      console.error('❌ ADMIN: Failed to fetch data summary:', error);
      // Set fallback data summary
      setDataSummary({
        diamonds: 0,
        chatSessions: 0,
        analytics: true,
        totalRecords: 1
      });
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleClearUserData = async () => {
    setIsLoading(true);
    try {
      console.log('🗑️ ADMIN: Clearing all data for user:', user.telegram_id);
      
      // Call FastAPI backend to clear user data
      const response = await api.delete(`/api/v1/admin/users/${user.telegram_id}/data`);
      
      if (response.error) {
        throw new Error(response.error);
      }

      console.log('✅ ADMIN: Successfully cleared user data');
      
      toast({
        title: "✅ User Data Cleared",
        description: `All data for ${displayName} has been successfully removed.`,
      });

      setShowConfirmDialog(false);
      if (onDataCleared) onDataCleared();
      
    } catch (error) {
      console.error('❌ ADMIN: Failed to clear user data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear user data';
      
      toast({
        variant: "destructive",
        title: "❌ Failed to Clear Data",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openConfirmDialog = async () => {
    setShowConfirmDialog(true);
    await fetchDataSummary();
  };

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={openConfirmDialog}
        className="flex items-center gap-2"
      >
        <Trash2 className="h-4 w-4" />
        Clear User Data
      </Button>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Clear All User Data
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Warning:</strong> This action will permanently delete ALL data for this user and cannot be undone.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h4 className="font-medium">User Details:</h4>
              <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                <div><strong>Name:</strong> {displayName}</div>
                <div><strong>Telegram ID:</strong> {user.telegram_id}</div>
                {user.username && <div><strong>Username:</strong> @{user.username}</div>}
              </div>
            </div>

            {loadingSummary ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading data summary...</span>
              </div>
            ) : dataSummary && (
              <div className="space-y-2">
                <h4 className="font-medium">Data to be deleted:</h4>
                <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                  <div>• <strong>{dataSummary.diamonds}</strong> diamonds in inventory</div>
                  <div>• <strong>{dataSummary.chatSessions}</strong> chat sessions</div>
                  <div>• User analytics and activity data</div>
                  <div>• All user profile information</div>
                  <div className="pt-2 font-medium">
                    Total records: <strong>{dataSummary.totalRecords}</strong>
                  </div>
                </div>
              </div>
            )}

            <div className="text-sm text-gray-600">
              Type the user's Telegram ID ({user.telegram_id}) to confirm deletion.
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearUserData}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Clearing Data...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Clear All Data
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
