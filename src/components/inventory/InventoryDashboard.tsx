
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Upload, 
  Edit, 
  Trash2, 
  Copy, 
  DollarSign, 
  Package, 
  TrendingUp, 
  Eye,
  CheckSquare,
  Square
} from "lucide-react";
import { Diamond } from "./InventoryTable";

interface InventoryDashboardProps {
  diamonds: Diamond[];
  onEdit: (diamond: Diamond) => void;
  onDelete: (diamondId: string) => void;
  onDuplicate?: (diamond: Diamond) => void;
  onBulkEdit?: (selectedIds: string[]) => void;
  onBulkDelete?: (selectedIds: string[]) => void;
  onImageUpload?: (diamondId: string) => void;
  loading?: boolean;
}

export function InventoryDashboard({
  diamonds,
  onEdit,
  onDelete,
  onDuplicate,
  onBulkEdit,
  onBulkDelete,
  onImageUpload,
  loading = false
}: InventoryDashboardProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const stats = {
    total: diamonds.length,
    available: diamonds.filter(d => d.status === 'Available').length,
    sold: diamonds.filter(d => d.status === 'Sold').length,
    totalValue: diamonds.reduce((sum, d) => sum + d.price, 0),
    averagePrice: diamonds.length > 0 ? Math.round(diamonds.reduce((sum, d) => sum + d.price, 0) / diamonds.length) : 0
  };

  const handleSelectItem = (diamondId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(diamondId)) {
      newSelected.delete(diamondId);
    } else {
      newSelected.add(diamondId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === diamonds.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(diamonds.map(d => d.id)));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Inventory</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Available</p>
                <p className="text-2xl font-bold text-green-900">{stats.available}</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Total Value</p>
                <p className="text-2xl font-bold text-purple-900">{formatPrice(stats.totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Avg. Price</p>
                <p className="text-2xl font-bold text-orange-900">{formatPrice(stats.averagePrice)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedItems.size > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-blue-700 font-medium">
                  {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedItems(new Set())}
                  className="text-blue-600 border-blue-300"
                >
                  Clear Selection
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {onBulkEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onBulkEdit(Array.from(selectedItems))}
                    className="text-blue-600 border-blue-300"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Bulk Edit
                  </Button>
                )}
                {onBulkDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onBulkDelete(Array.from(selectedItems))}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Selected
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="flex items-center gap-2"
            >
              {selectedItems.size === diamonds.length ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              Select All
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {diamonds.map((diamond) => (
            <Card 
              key={diamond.id} 
              className={`group hover:shadow-lg transition-all duration-300 ${
                selectedItems.has(diamond.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleSelectItem(diamond.id)}
                    className="flex items-center gap-2"
                  >
                    {selectedItems.has(diamond.id) ? (
                      <CheckSquare className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Square className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                  <Badge 
                    variant={diamond.status === 'Available' ? 'default' : 'secondary'}
                    className={diamond.status === 'Available' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {diamond.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{diamond.stockNumber}</CardTitle>
              </CardHeader>
              
              <CardContent className="p-4 pt-0">
                <div className="aspect-square relative mb-4 bg-slate-100 rounded-lg overflow-hidden">
                  {diamond.imageUrl ? (
                    <img
                      src={diamond.imageUrl}
                      alt={`Diamond ${diamond.stockNumber}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Camera className="h-8 w-8" />
                    </div>
                  )}
                  
                  {/* Quick Action Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex items-center gap-2">
                      {onImageUpload && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => onImageUpload(diamond.id)}
                          className="bg-white text-slate-700 hover:bg-slate-100"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onEdit(diamond)}
                        className="bg-white text-slate-700 hover:bg-slate-100"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {onDuplicate && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => onDuplicate(diamond)}
                          className="bg-white text-slate-700 hover:bg-slate-100"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-500">Shape:</span>
                      <p className="font-medium">{diamond.shape}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Carat:</span>
                      <p className="font-medium">{diamond.carat}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Color:</span>
                      <p className="font-medium">{diamond.color}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Clarity:</span>
                      <p className="font-medium">{diamond.clarity}</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-sm">Price:</span>
                      <span className="font-bold text-lg text-blue-600">
                        {formatPrice(diamond.price)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(diamond)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(diamond.id)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {diamonds.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No inventory items</h3>
            <p className="text-slate-600 mb-4">Get started by adding your first diamond to the inventory.</p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Upload className="h-4 w-4 mr-2" />
              Add First Diamond
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
