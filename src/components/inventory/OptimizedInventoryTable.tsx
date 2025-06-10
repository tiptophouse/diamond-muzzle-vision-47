
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit, Eye, Search, Filter, RefreshCw } from "lucide-react";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useOptimizedInventory } from "@/hooks/useOptimizedInventory";

interface OptimizedInventoryTableProps {
  onEdit?: (diamond: Diamond) => void;
  onView?: (diamond: Diamond) => void;
}

export function OptimizedInventoryTable({ onEdit, onView }: OptimizedInventoryTableProps) {
  const { diamonds, loading, error, refreshInventory, deleteDiamond } = useOptimizedInventory();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [shapeFilter, setShapeFilter] = useState("all");

  // Memoized filtered diamonds
  const filteredDiamonds = useMemo(() => {
    return diamonds.filter(diamond => {
      const matchesSearch = searchTerm === "" || 
        diamond.stockNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        diamond.shape.toLowerCase().includes(searchTerm.toLowerCase()) ||
        diamond.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
        diamond.clarity.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || diamond.status === statusFilter;
      const matchesShape = shapeFilter === "all" || diamond.shape === shapeFilter;

      return matchesSearch && matchesStatus && matchesShape;
    });
  }, [diamonds, searchTerm, statusFilter, shapeFilter]);

  // Get unique values for filters
  const uniqueStatuses = useMemo(() => 
    [...new Set(diamonds.map(d => d.status))], [diamonds]
  );
  
  const uniqueShapes = useMemo(() => 
    [...new Set(diamonds.map(d => d.shape))], [diamonds]
  );

  const handleDelete = async (diamond: Diamond) => {
    if (confirm(`Are you sure you want to archive diamond ${diamond.stockNumber}?`)) {
      await deleteDiamond(diamond.id, false); // Soft delete by default
    }
  };

  const handleHardDelete = async (diamond: Diamond) => {
    if (confirm(`Are you sure you want to PERMANENTLY delete diamond ${diamond.stockNumber}? This action cannot be undone.`)) {
      await deleteDiamond(diamond.id, true); // Hard delete
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p className="mb-4">Failed to load inventory: {error}</p>
            <Button onClick={refreshInventory} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Inventory ({filteredDiamonds.length} diamonds)</CardTitle>
          <Button onClick={refreshInventory} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search diamonds..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {uniqueStatuses.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={shapeFilter} onValueChange={setShapeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Shape" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Shapes</SelectItem>
              {uniqueShapes.map(shape => (
                <SelectItem key={shape} value={shape}>{shape}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading inventory...</p>
          </div>
        ) : filteredDiamonds.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {diamonds.length === 0 ? 'No diamonds in inventory' : 'No diamonds match your filters'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Stock #</th>
                  <th className="text-left p-2">Shape</th>
                  <th className="text-left p-2">Carat</th>
                  <th className="text-left p-2">Color</th>
                  <th className="text-left p-2">Clarity</th>
                  <th className="text-left p-2">Cut</th>
                  <th className="text-left p-2">Price</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDiamonds.map(diamond => (
                  <tr key={diamond.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{diamond.stockNumber}</td>
                    <td className="p-2">{diamond.shape}</td>
                    <td className="p-2">{diamond.carat}</td>
                    <td className="p-2">{diamond.color}</td>
                    <td className="p-2">{diamond.clarity}</td>
                    <td className="p-2">{diamond.cut}</td>
                    <td className="p-2">${diamond.price.toLocaleString()}</td>
                    <td className="p-2">
                      <Badge variant={diamond.status === "Available" ? "default" : "secondary"}>
                        {diamond.status}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        {onView && (
                          <Button size="sm" variant="ghost" onClick={() => onView(diamond)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button size="sm" variant="ghost" onClick={() => onEdit(diamond)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDelete(diamond)}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleHardDelete(diamond)}
                          className="text-red-600 hover:text-red-700"
                          onDoubleClick={() => handleHardDelete(diamond)}
                        >
                          🗑️
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
