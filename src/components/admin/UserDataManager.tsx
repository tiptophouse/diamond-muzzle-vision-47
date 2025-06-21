
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, AlertTriangle, Loader2, Diamond } from 'lucide-react';
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
  const [isDeletingDiamonds, setIsDeletingDiamonds] = useState(false);
  const [dataSummary, setDataSummary] = useState<UserDataSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const displayName = user.first_name && !['Test', 'Telegram', 'Emergency'].includes(user.first_name)
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : `User ${user.telegram_id}`;

  const fetchDataSummary = async () => {
    setLoadingSummary(true);
    try {
      console.log('📊 ADMIN: Fetching data summary for user:', user.telegram_id);
      
      const response = await api.get(`/api/v1/admin/users/${user.telegram_id}/data-summary`);
      
      if (response.data) {
        setDataSummary(response.data as UserDataSummary);
      } else {
        setDataSummary({
          diamonds: 0,
          chatSessions: 0,
          analytics: true,
          totalRecords: 1
        });
      }
    } catch (error) {
      console.error('❌ ADMIN: Failed to fetch data summary:', error);
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

  const handleDeleteUserDiamonds = async () => {
    setIsDeletingDiamonds(true);
    try {
      console.log('💎🗑️ ADMIN: Deleting all diamonds for user:', user.telegram_id);
      
      // First get all user diamonds
      const diamondsResponse = await api.get(`/api/v1/get_all_stones?user_id=${user.telegram_id}`);
      
      if (diamondsResponse.error) {
        throw new Error(diamondsResponse.error);
      }

      const diamonds = diamondsResponse.data || [];
      console.log(`💎 ADMIN: Found ${diamonds.length} diamonds to delete`);

      if (diamonds.length === 0) {
        toast({
          title: "ℹ️ No Diamonds Found",
          description: `User ${displayName} has no diamonds to delete.`,
        });
        return;
      }

      // Delete each diamond individually using the correct FastAPI endpoint
      let deletedCount = 0;
      let failedCount = 0;

      for (const diamond of diamonds) {
        try {
          const deleteResponse = await api.delete(`/api/v1/delete_stone/${diamond.stock_number}?user_id=${user.telegram_id}`);
          
          if (deleteResponse.error) {
            console.error(`❌ Failed to delete diamond ${diamond.stock_number}:`, deleteResponse.error);
            failedCount++;
          } else {
            console.log(`✅ Successfully deleted diamond ${diamond.stock_number}`);
            deletedCount++;
          }
        } catch (error) {
          console.error(`❌ Error deleting diamond ${diamond.stock_number}:`, error);
          failedCount++;
        }
      }

      // Show success/failure message
      if (deletedCount > 0 && failedCount === 0) {
        toast({
          title: "✅ All Diamonds Deleted Successfully",
          description: `Successfully deleted all ${deletedCount} diamonds for ${displayName}.`,
        });
      } else if (deletedCount > 0 && failedCount > 0) {
        toast({
          title: "⚠️ Partial Success",
          description: `Deleted ${deletedCount} diamonds successfully, but ${failedCount} failed to delete for ${displayName}.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "❌ Failed to Delete Diamonds",
          description: `Failed to delete diamonds for ${displayName}. Please try again.`,
          variant: "destructive",
        });
      }

      // Refresh data summary
      await fetchDataSummary();
      
    } catch (error) {
      console.error('❌ ADMIN: Failed to delete user diamonds:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete diamonds';
      
      toast({
        variant: "destructive",
        title: "❌ Failed to Delete Diamonds",
        description: `Could not delete diamonds for ${displayName}: ${errorMessage}`,
      });
    } finally {
      setIsDeletingDiamonds(false);
    }
  };

  const handleClearUserData = async () => {
    setIsLoading(true);
    try {
      console.log('🗑️ ADMIN: Clearing all data for user:', user.telegram_id);
      
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
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDeleteUserDiamonds}
          disabled={isDeletingDiamonds}
          className="flex items-center gap-2 border-orange-500/30 text-orange-600 hover:bg-orange-500/10"
        >
          {isDeletingDiamonds ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Diamond className="h-4 w-4" />
              Delete Diamonds
            </>
          )}
        </Button>
        
        <Button
          variant="destructive"
          size="sm"
          onClick={openConfirmDialog}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear All Data
        </Button>
      </div>

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
