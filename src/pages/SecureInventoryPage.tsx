
import React, { useState } from 'react';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { DiamondForm } from '@/components/inventory/DiamondForm';
import { UserIsolationGuard } from '@/components/security/UserIsolationGuard';
import { useSecureInventory } from '@/hooks/useSecureInventory';
import { useSecureUser } from '@/contexts/SecureUserContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Shield, Lock } from 'lucide-react';
import { Diamond } from '@/components/inventory/InventoryTable';

export default function SecureInventoryPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingDiamond, setEditingDiamond] = useState<Diamond | null>(null);
  const { diamonds, isLoading, addDiamond, deleteDiamond, refreshInventory } = useSecureInventory();
  const { currentUserId } = useSecureUser();

  const handleAddDiamond = async (diamondData: any) => {
    const success = await addDiamond(diamondData);
    if (success) {
      setShowAddDialog(false);
    }
  };

  const handleEditDiamond = async (diamondData: any) => {
    // TODO: Implement secure edit functionality
    console.log('Edit diamond:', diamondData);
    setEditingDiamond(null);
  };

  const handleDeleteDiamond = async (diamondId: string) => {
    const success = await deleteDiamond(diamondId);
    return success;
  };

  return (
    <UserIsolationGuard>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Security Header */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="font-medium text-green-800">Secure Inventory Access</h3>
              <p className="text-sm text-green-700">
                User ID: {currentUserId} • Complete data isolation active
              </p>
            </div>
            <Lock className="h-4 w-4 text-green-500 ml-auto" />
          </div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Diamond Inventory</h1>
            <p className="text-gray-600 mt-1">
              Secure, private inventory management • {diamonds.length} diamonds
            </p>
          </div>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Diamond
          </Button>
        </div>

        {/* Inventory Table */}
        <InventoryTable
          data={diamonds}
          loading={isLoading}
          onEdit={setEditingDiamond}
          onDelete={handleDeleteDiamond}
          onImageUpdate={refreshInventory}
        />

        {/* Add Diamond Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Add New Diamond (Secure)
              </DialogTitle>
            </DialogHeader>
            <DiamondForm
              onSubmit={handleAddDiamond}
              onCancel={() => setShowAddDialog(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Diamond Dialog */}
        <Dialog open={!!editingDiamond} onOpenChange={() => setEditingDiamond(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Edit Diamond (Secure)
              </DialogTitle>
            </DialogHeader>
            {editingDiamond && (
              <DiamondForm
                diamond={editingDiamond}
                onSubmit={handleEditDiamond}
                onCancel={() => setEditingDiamond(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </UserIsolationGuard>
  );
}
