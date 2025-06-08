
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Diamond } from "./InventoryTable";

interface InventoryMobileCardProps {
  diamond: Diamond;
  onEdit?: (diamond: Diamond) => void;
  onDelete?: (diamondId: string) => void;
  onToggleStoreVisibility?: (diamond: Diamond) => void;
}

export function InventoryMobileCard({ diamond, onEdit, onDelete, onToggleStoreVisibility }: InventoryMobileCardProps) {
  const isStoreVisible = (diamond as any).store_visible || false;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'sold':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className="w-full border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {diamond.imageUrl && (
              <img 
                src={diamond.imageUrl} 
                alt={`Diamond ${diamond.stockNumber}`}
                className="w-12 h-12 rounded object-cover border border-slate-200 dark:border-slate-700"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {diamond.stockNumber}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                {diamond.shape}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(diamond.status)}>
            {diamond.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div>
            <span className="text-slate-600 dark:text-slate-400">Carat:</span>
            <span className="ml-1 font-semibold text-slate-900 dark:text-slate-100">
              {diamond.carat.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-slate-600 dark:text-slate-400">Color:</span>
            <span className="ml-1 font-semibold text-slate-900 dark:text-slate-100">
              {diamond.color}
            </span>
          </div>
          <div>
            <span className="text-slate-600 dark:text-slate-400">Clarity:</span>
            <span className="ml-1 font-semibold text-slate-900 dark:text-slate-100">
              {diamond.clarity}
            </span>
          </div>
          <div>
            <span className="text-slate-600 dark:text-slate-400">Cut:</span>
            <span className="ml-1 font-semibold text-slate-900 dark:text-slate-100">
              {diamond.cut}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {formatPrice(diamond.price)}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isStoreVisible ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleStoreVisibility?.(diamond)}
              className={isStoreVisible 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "text-gray-600 hover:text-green-600 hover:border-green-600"
              }
            >
              {isStoreVisible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(diamond)}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete?.(diamond.id)}
              className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
