
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useArchiveData } from "@/hooks/useArchiveData";
import { useSoftDeleteDiamond } from "@/hooks/inventory/useSoftDeleteDiamond";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { Diamond } from "@/components/inventory/InventoryTable";
import { 
  Archive, 
  RotateCcw, 
  Trash2, 
  AlertTriangle, 
  Calendar,
  ImageIcon 
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ArchivePage() {
  const { isAuthenticated, isLoading: authLoading, user, error: authError } = useTelegramAuth();
  const { archivedDiamonds, loading, refreshData } = useArchiveData();
  const { restoreDiamond, permanentDeleteDiamond } = useSoftDeleteDiamond({
    onSuccess: refreshData,
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [diamondToDelete, setDiamondToDelete] = useState<Diamond | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRestore = async (diamond: Diamond) => {
    await restoreDiamond(diamond.id);
  };

  const handlePermanentDelete = (diamond: Diamond) => {
    setDiamondToDelete(diamond);
    setDeleteDialogOpen(true);
  };

  const confirmPermanentDelete = async () => {
    if (diamondToDelete) {
      setIsDeleting(true);
      const success = await permanentDeleteDiamond(diamondToDelete.id);
      if (success) {
        setDeleteDialogOpen(false);
        setDiamondToDelete(null);
      }
      setIsDeleting(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Authenticating...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || authError) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 w-full">
          <div className="text-center px-4">
            <p className="text-red-600 mb-4">
              {authError || "Authentication required to view archive"}
            </p>
            <p className="text-slate-600">Please ensure you're accessing this app through Telegram.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Archive className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Archive</h1>
              <p className="text-slate-600">
                Deleted diamonds ({archivedDiamonds.length} items)
              </p>
            </div>
          </div>
          <Button 
            onClick={refreshData} 
            variant="outline"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {/* Warning Banner */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800">Archive Information</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  These diamonds have been deleted from your inventory. You can restore them back to your inventory or permanently delete them from the database.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Archive Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading archived diamonds...</p>
            </div>
          </div>
        ) : archivedDiamonds.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Archive className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Archived Diamonds</h3>
              <p className="text-slate-500">
                Your archive is empty. Deleted diamonds will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {archivedDiamonds.map((diamond) => (
              <Card key={diamond.id} className="relative overflow-hidden border-red-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {diamond.carat}ct {diamond.shape}
                      </CardTitle>
                      <p className="text-sm text-slate-600">#{diamond.stockNumber}</p>
                    </div>
                    <Badge variant="destructive" className="bg-red-100 text-red-800">
                      Archived
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Image */}
                  <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {diamond.imageUrl ? (
                      <img 
                        src={diamond.imageUrl} 
                        alt={`Diamond ${diamond.stockNumber}`}
                        className="w-full h-full object-cover opacity-60"
                      />
                    ) : (
                      <ImageIcon className="h-12 w-12 text-slate-400" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-500">Color:</span>
                      <span className="ml-1 font-medium">{diamond.color}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Clarity:</span>
                      <span className="ml-1 font-medium">{diamond.clarity}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Cut:</span>
                      <span className="ml-1 font-medium">{diamond.cut}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Price:</span>
                      <span className="ml-1 font-medium">${diamond.price.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleRestore(diamond)}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restore
                    </Button>
                    <Button
                      onClick={() => handlePermanentDelete(diamond)}
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Forever
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Permanent Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              Permanently Delete Diamond?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the diamond 
              "{diamondToDelete?.stockNumber}" from the database. Are you absolutely sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmPermanentDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Forever'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
