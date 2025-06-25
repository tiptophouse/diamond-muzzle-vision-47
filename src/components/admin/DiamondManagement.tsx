
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useInventoryCrud } from '@/hooks/useInventoryCrud';
import { DiamondForm } from '@/components/inventory/DiamondForm';
import { Diamond } from '@/components/inventory/InventoryTable';
import { DeleteConfirmDialog } from '@/components/inventory/DeleteConfirmDialog';
import { BulkEditModal } from './BulkEditModal';
import { DiamondCSVUpload } from './DiamondCSVUpload';
import { DiamondTable } from './DiamondTable';
import { Plus, Upload, Edit, Trash2, FileDown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function DiamondManagement() {
  const { toast } = useToast();
  const { loading, diamonds, allDiamonds, handleRefresh } = useInventoryData();
  const { addDiamond, updateDiamond, deleteDiamond, isLoading: crudLoading } = useInventoryCrud({
    onSuccess: handleRefresh,
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDiamond, setEditingDiamond] = useState<Diamond | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [diamondToDelete, setDiamondToDelete] = useState<Diamond | null>(null);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [selectedDiamonds, setSelectedDiamonds] = useState<string[]>([]);

  const handleEdit = (diamond: Diamond) => {
    setEditingDiamond(diamond);
  };

  const handleDelete = (stockNumber: string) => {
    const diamond = allDiamonds.find(d => d.stockNumber === stockNumber);
    if (diamond) {
      setDiamondToDelete(diamond);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (diamondToDelete) {
      const success = await deleteDiamond(diamondToDelete.stockNumber, diamondToDelete);
      if (success) {
        setDeleteDialogOpen(false);
        setDiamondToDelete(null);
        toast({
          title: "Success ✅",
          description: "Diamond deleted successfully",
        });
      }
    }
  };

  const handleBulkEdit = () => {
    if (selectedDiamonds.length === 0) {
      toast({
        variant: "destructive",
        title: "No Selection",
        description: "Please select diamonds to edit",
      });
      return;
    }
    setShowBulkEdit(true);
  };

  const handleAddSubmit = async (data: any) => {
    const success = await addDiamond(data);
    if (success) {
      setShowAddForm(false);
      toast({
        title: "Success ✅",
        description: "Diamond added successfully",
      });
    }
  };

  const handleEditSubmit = async (data: any) => {
    if (editingDiamond) {
      const success = await updateDiamond(editingDiamond.id, data);
      if (success) {
        setEditingDiamond(null);
        toast({
          title: "Success ✅",
          description: "Diamond updated successfully",
        });
      }
    }
  };

  const exportToCSV = () => {
    const csvData = [
      ['Stock Number', 'Shape', 'Carat', 'Color', 'Clarity', 'Cut', 'Price', 'Status'],
      ...allDiamonds.map(diamond => [
        diamond.stockNumber,
        diamond.shape,
        diamond.carat,
        diamond.color,
        diamond.clarity,
        diamond.cut,
        diamond.price,
        diamond.status
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diamonds_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete ✅",
      description: "Diamond data exported to CSV",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Diamonds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allDiamonds.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {allDiamonds.filter(d => d.status === 'Available').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reserved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {allDiamonds.filter(d => d.status === 'Reserved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${allDiamonds.reduce((sum, d) => sum + d.price, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Diamond
        </Button>
        <Button onClick={() => setShowCSVUpload(true)} variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Upload CSV
        </Button>
        <Button 
          onClick={handleBulkEdit} 
          variant="outline"
          disabled={selectedDiamonds.length === 0}
        >
          <Edit className="h-4 w-4 mr-2" />
          Bulk Edit ({selectedDiamonds.length})
        </Button>
        <Button onClick={exportToCSV} variant="outline">
          <FileDown className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
        <Button onClick={handleRefresh} variant="outline" disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Diamond Table */}
      <Card>
        <CardHeader>
          <CardTitle>Diamond Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <DiamondTable
            diamonds={allDiamonds}
            loading={loading}
            selectedDiamonds={selectedDiamonds}
            onSelectionChange={setSelectedDiamonds}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {/* Add Diamond Modal */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Diamond</DialogTitle>
          </DialogHeader>
          <DiamondForm
            onSubmit={handleAddSubmit}
            onCancel={() => setShowAddForm(false)}
            isLoading={crudLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Diamond Modal */}
      <Dialog open={!!editingDiamond} onOpenChange={() => setEditingDiamond(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Diamond - #{editingDiamond?.stockNumber}</DialogTitle>
          </DialogHeader>
          {editingDiamond && (
            <DiamondForm
              diamond={editingDiamond}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingDiamond(null)}
              isLoading={crudLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        diamond={diamondToDelete}
        isLoading={crudLoading}
      />

      {/* Bulk Edit Modal */}
      <BulkEditModal
        open={showBulkEdit}
        onClose={() => setShowBulkEdit(false)}
        selectedDiamonds={selectedDiamonds.map(id => allDiamonds.find(d => d.id === id)!).filter(Boolean)}
        onSuccess={() => {
          setShowBulkEdit(false);
          setSelectedDiamonds([]);
          handleRefresh();
        }}
      />

      {/* CSV Upload Modal */}
      <DiamondCSVUpload
        open={showCSVUpload}
        onClose={() => setShowCSVUpload(false)}
        onSuccess={() => {
          setShowCSVUpload(false);
          handleRefresh();
        }}
      />
    </div>
  );
}
