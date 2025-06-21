import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit, Eye, EyeOff, Search, Filter, Diamond, Loader2 } from 'lucide-react';
import { useInventoryCrud } from '@/hooks/useInventoryCrud';
import { DiamondFormModal } from './form/DiamondFormModal';
import { DiamondFormData } from './form/types';
import { useToast } from '@/components/ui/use-toast';

export interface Diamond {
  id: string;
  stockNumber: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  price: number;
  status: string;
  imageUrl?: string;
  store_visible: boolean;
  certificateNumber?: string;
  lab?: string;
  certificateUrl?: string;
  gem360Url?: string;
}

interface InventoryTableProps {
  diamonds: Diamond[];
  onRefresh: () => void;
  loading?: boolean;
}

export function InventoryTable({ diamonds, onRefresh, loading }: InventoryTableProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [shapeFilter, setShapeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingDiamond, setEditingDiamond] = useState<Diamond | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { addDiamond, updateDiamond, deleteDiamond, isLoading: crudLoading } = useInventoryCrud({
    onSuccess: () => {
      onRefresh();
      setEditingDiamond(null);
      setShowAddModal(false);
      toast({
        title: "✅ Success",
        description: "Diamond operation completed successfully",
      });
    },
    removeDiamondFromState: (diamondId: string) => {
      console.log('🔄 Optimistically removing diamond:', diamondId);
    },
    restoreDiamondToState: (diamond: Diamond) => {
      console.log('🔄 Restoring diamond:', diamond.id);
      onRefresh();
    }
  });

  // Get unique shapes for filter
  const uniqueShapes = useMemo(() => {
    const shapes = [...new Set(diamonds.map(d => d.shape))];
    return shapes.sort();
  }, [diamonds]);

  // Filter diamonds based on search and filters
  const filteredDiamonds = useMemo(() => {
    return diamonds.filter(diamond => {
      const matchesSearch = searchTerm === '' || 
        diamond.stockNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        diamond.shape.toLowerCase().includes(searchTerm.toLowerCase()) ||
        diamond.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
        diamond.clarity.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesShape = shapeFilter === 'all' || diamond.shape === shapeFilter;
      const matchesStatus = statusFilter === 'all' || diamond.status === statusFilter;
      
      return matchesSearch && matchesShape && matchesStatus;
    });
  }, [diamonds, searchTerm, shapeFilter, statusFilter]);

  const handleAdd = async (data: DiamondFormData) => {
    const success = await addDiamond(data);
    if (success) {
      toast({
        title: "✅ Diamond Added",
        description: `Diamond #${data.stockNumber} has been added successfully`,
      });
    }
    return success;
  };

  const handleEdit = async (data: DiamondFormData) => {
    if (!editingDiamond) return false;
    const success = await updateDiamond(editingDiamond.id, data);
    if (success) {
      toast({
        title: "✅ Diamond Updated",
        description: `Diamond #${data.stockNumber} has been updated successfully`,
      });
    }
    return success;
  };

  const handleDelete = async (diamond: Diamond) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete diamond #${diamond.stockNumber}?\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    setDeletingId(diamond.id);
    try {
      const success = await deleteDiamond(diamond.id, diamond);
      if (success) {
        toast({
          title: "✅ Diamond Deleted",
          description: `Diamond #${diamond.stockNumber} has been deleted successfully`,
        });
      } else {
        toast({
          title: "❌ Delete Failed",
          description: `Failed to delete diamond #${diamond.stockNumber}`,
          variant: "destructive",
        });
      }
    } finally {
      setDeletingId(null);
    }
  };

  const toggleVisibility = async (diamond: Diamond) => {
    const updatedData: DiamondFormData = {
      stockNumber: diamond.stockNumber,
      shape: diamond.shape,
      carat: diamond.carat,
      color: diamond.color,
      clarity: diamond.clarity,
      cut: diamond.cut,
      price: diamond.price,
      status: diamond.status,
      storeVisible: !diamond.store_visible,
      certificateNumber: diamond.certificateNumber || '',
      lab: diamond.lab || '',
      imageUrl: diamond.imageUrl || '',
      certificateUrl: diamond.certificateUrl || '',
      gem360Url: diamond.gem360Url || ''
    };
    
    const success = await updateDiamond(diamond.id, updatedData);
    if (success) {
      toast({
        title: "✅ Visibility Updated",
        description: `Diamond #${diamond.stockNumber} is now ${!diamond.store_visible ? 'visible' : 'hidden'} in store`,
      });
    }
  };

  if (loading) {
    return (
      <Card className="diamond-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600">Loading your secure inventory...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Diamond className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Your Diamond Inventory</h2>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {filteredDiamonds.length} diamonds
          </Badge>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)} 
          className="bg-blue-600 hover:bg-blue-700"
          disabled={crudLoading}
        >
          <Diamond className="h-4 w-4 mr-2" />
          Add Diamond
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by stock number, shape, color, or clarity..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={shapeFilter} onValueChange={setShapeFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Shape" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shapes</SelectItem>
                  {uniqueShapes.map(shape => (
                    <SelectItem key={shape} value={shape}>{shape}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Reserved">Reserved</SelectItem>
                  <SelectItem value="Sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="diamond-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Diamond className="h-5 w-5" />
            Secure Diamond Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDiamonds.length === 0 ? (
            <div className="text-center py-12">
              <Diamond className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {diamonds.length === 0 ? 'No diamonds in inventory' : 'No diamonds match your filters'}
              </h3>
              <p className="text-gray-500 mb-4">
                {diamonds.length === 0 
                  ? 'Add your first diamond to get started with your secure inventory'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              {diamonds.length === 0 && (
                <Button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Diamond className="h-4 w-4 mr-2" />
                  Add Your First Diamond
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stock #</TableHead>
                    <TableHead>Shape</TableHead>
                    <TableHead>Carat</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Clarity</TableHead>
                    <TableHead>Cut</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDiamonds.map((diamond) => (
                    <TableRow key={diamond.id}>
                      <TableCell className="font-medium">{diamond.stockNumber}</TableCell>
                      <TableCell>{diamond.shape}</TableCell>
                      <TableCell>{diamond.carat.toFixed(2)}ct</TableCell>
                      <TableCell>{diamond.color}</TableCell>
                      <TableCell>{diamond.clarity}</TableCell>
                      <TableCell>{diamond.cut}</TableCell>
                      <TableCell className="font-semibold">${diamond.price.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={diamond.status === 'Available' ? 'default' : 'secondary'}>
                          {diamond.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleVisibility(diamond)}
                          disabled={crudLoading}
                        >
                          {diamond.store_visible ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingDiamond(diamond)}
                            disabled={crudLoading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(diamond)}
                            disabled={crudLoading || deletingId === diamond.id}
                          >
                            {deletingId === diamond.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Diamond Modal */}
      <DiamondFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAdd}
        title="Add New Diamond"
        isLoading={crudLoading}
      />

      {/* Edit Diamond Modal */}
      {editingDiamond && (
        <DiamondFormModal
          isOpen={!!editingDiamond}
          onClose={() => setEditingDiamond(null)}
          onSubmit={handleEdit}
          title="Edit Diamond"
          initialData={{
            stockNumber: editingDiamond.stockNumber,
            shape: editingDiamond.shape,
            carat: editingDiamond.carat,
            color: editingDiamond.color,
            clarity: editingDiamond.clarity,
            cut: editingDiamond.cut,
            price: editingDiamond.price,
            status: editingDiamond.status,
            storeVisible: editingDiamond.store_visible,
            certificateNumber: editingDiamond.certificateNumber || '',
            lab: editingDiamond.lab || '',
            imageUrl: editingDiamond.imageUrl || '',
            certificateUrl: editingDiamond.certificateUrl || '',
            gem360Url: editingDiamond.gem360Url || ''
          }}
          isLoading={crudLoading}
        />
      )}
    </div>
  );
}
