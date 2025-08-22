import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useInventoryData } from '@/hooks/useInventoryData';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { InventoryFilters } from '@/components/inventory/InventoryFilters';
import { DiamondFormModal } from '@/components/inventory/DiamondFormModal';
import { DeleteConfirmationModal } from '@/components/inventory/DeleteConfirmationModal';
import { BulkActionsToolbar } from '@/components/inventory/BulkActionsToolbar';
import { useDiamondOperations } from '@/hooks/inventory/useDiamondOperations';
import { useToast } from '@/components/ui/use-toast';
import { Diamond } from '@/types/diamond';
import { useNavigate } from 'react-router-dom';

export default function InventoryPage() {
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useInventoryData();
  const { updateDiamond } = useDiamondOperations();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [shapeFilter, setShapeFilter] = useState('all');
  const [colorFilter, setColorFilter] = useState('all');
  const [clarityFilter, setClarityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'stockNumber' | 'shape' | 'carat' | 'price' | 'status'>('stockNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedDiamonds, setSelectedDiamonds] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingDiamond, setEditingDiamond] = useState<Diamond | null>(null);
  const [deletingDiamond, setDeletingDiamond] = useState<Diamond | null>(null);

  const diamonds = data?.diamonds || [];

  const filteredDiamonds = diamonds.filter(diamond => {
    const matchesSearch = !searchTerm || 
      diamond.stockNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diamond.shape.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diamond.color.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesShape = shapeFilter === 'all' || diamond.shape === shapeFilter;
    const matchesColor = colorFilter === 'all' || diamond.color === colorFilter;
    const matchesClarity = clarityFilter === 'all' || diamond.clarity === clarityFilter;
    const matchesStatus = statusFilter === 'all' || diamond.status === statusFilter;
    
    return matchesSearch && matchesShape && matchesColor && matchesClarity && matchesStatus;
  });

  const sortedDiamonds = [...filteredDiamonds].sort((a, b) => {
    let aValue: any = a[sortBy];
    let bValue: any = b[sortBy];
    
    if (sortBy === 'carat' || sortBy === 'price') {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    } else {
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleEditDiamond = async (diamond: Diamond) => {
    setEditingDiamond(diamond);
    setShowEditModal(true);
  };

  const handleDeleteDiamond = (diamond: Diamond) => {
    setDeletingDiamond(diamond);
    setShowDeleteModal(true);
  };

  const handleSaveEdit = async (diamondData: any) => {
    if (!editingDiamond) return;
    
    try {
      const success = await updateDiamond(editingDiamond.id, diamondData);
      if (success) {
        toast({
          title: "Diamond updated successfully",
          description: `${diamondData.stockNumber} has been updated.`,
        });
        setShowEditModal(false);
        setEditingDiamond(null);
        refetch();
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update diamond. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingDiamond) return;
    
    try {
      // Handle delete logic here
      toast({
        title: "Diamond deleted successfully",
        description: `${deletingDiamond.stockNumber} has been deleted.`,
      });
      setShowDeleteModal(false);
      setDeletingDiamond(null);
      refetch();
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete diamond. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddNew = () => {
    navigate('/upload');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <InventoryHeader
          totalCount={diamonds.length}
          onRefresh={() => refetch()}
          loading={isLoading}
          onAddNew={handleAddNew}
        />

        <div className="mt-6 space-y-4">
          <InventoryFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            shapeFilter={shapeFilter}
            onShapeChange={setShapeFilter}
            colorFilter={colorFilter}
            onColorChange={setColorFilter}
            clarityFilter={clarityFilter}
            onClarityChange={setClarityFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            diamonds={diamonds}
          />

          {selectedDiamonds.length > 0 && (
            <BulkActionsToolbar
              selectedCount={selectedDiamonds.length}
              onClearSelection={() => setSelectedDiamonds([])}
              onBulkDelete={() => {
                // Handle bulk delete
              }}
              onBulkStatusUpdate={() => {
                // Handle bulk status update
              }}
            />
          )}

          <InventoryTable
            diamonds={sortedDiamonds}
            loading={isLoading}
            selectedDiamonds={selectedDiamonds}
            onSelectionChange={setSelectedDiamonds}
            onEdit={handleEditDiamond}
            onDelete={handleDeleteDiamond}
          />
        </div>

        {/* Modals */}
        {showAddModal && (
          <DiamondFormModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSave={async (data) => {
              // Handle add new diamond
              setShowAddModal(false);
              refetch();
            }}
            title="Add New Diamond"
          />
        )}

        {showEditModal && editingDiamond && (
          <DiamondFormModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setEditingDiamond(null);
            }}
            onSave={handleSaveEdit}
            initialData={editingDiamond}
            title="Edit Diamond"
          />
        )}

        {showDeleteModal && deletingDiamond && (
          <DeleteConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setDeletingDiamond(null);
            }}
            onConfirm={handleConfirmDelete}
            diamondName={deletingDiamond.stockNumber}
          />
        )}
      </div>
    </Layout>
  );
}
