
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Diamond } from "./InventoryTable";
import { useStoreVisibilityToggle } from "@/hooks/useStoreVisibilityToggle";

interface InventoryTableRowProps {
  diamond: Diamond;
  onEdit?: (diamond: Diamond) => void;
  onDelete?: (diamondId: string) => void;
}

export function InventoryTableRow({ diamond, onEdit, onDelete }: InventoryTableRowProps) {
  const { toggleStoreVisibility, loading } = useStoreVisibilityToggle();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-red-100 text-red-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStoreToggle = async () => {
    const success = await toggleStoreVisibility(diamond.id, diamond.store_visible || false);
    if (success) {
      // Refresh the data or update the local state
      window.location.reload();
    }
  };

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell className="font-medium">{diamond.stockNumber}</TableCell>
      <TableCell>{diamond.shape}</TableCell>
      <TableCell>{diamond.carat}</TableCell>
      <TableCell>{diamond.color}</TableCell>
      <TableCell>{diamond.clarity}</TableCell>
      <TableCell>{diamond.cut}</TableCell>
      <TableCell>{formatPrice(diamond.price)}</TableCell>
      <TableCell>
        <Badge className={getStatusColor(diamond.status)}>
          {diamond.status}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={diamond.store_visible ? "default" : "secondary"}>
          {diamond.store_visible ? "In Store" : "Not in Store"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleStoreToggle}
            disabled={loading}
            className={diamond.store_visible ? "bg-red-50 hover:bg-red-100" : "bg-green-50 hover:bg-green-100"}
          >
            <Store className="h-4 w-4" />
            {diamond.store_visible ? "Remove" : "Add"}
          </Button>
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(diamond)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(diamond.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
