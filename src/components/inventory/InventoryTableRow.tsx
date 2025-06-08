
import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Diamond } from "./InventoryTable";
import { Edit, Trash, ImageIcon, Eye, EyeOff, Share2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface InventoryTableRowProps {
  diamond: Diamond;
  onEdit?: (diamond: Diamond) => void;
  onDelete?: (diamondId: string) => void;
  onToggleStoreVisibility?: (diamond: Diamond) => void;
}

export function InventoryTableRow({ diamond, onEdit, onDelete, onToggleStoreVisibility }: InventoryTableRowProps) {
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();

  const handleImageError = () => {
    setImageError(true);
  };

  const handleShareLink = () => {
    const storeUrl = `${window.location.origin}/store?item=${diamond.id}`;
    navigator.clipboard.writeText(storeUrl);
    toast({
      title: "Link copied!",
      description: "Store link copied to clipboard",
    });
  };

  // Get image URL from multiple possible sources
  const imageUrl = diamond.imageUrl || (diamond as any).picture || (diamond as any).image;

  return (
    <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-800">
      <TableCell className="w-16">
        {imageUrl && !imageError ? (
          <img 
            src={imageUrl} 
            alt={`Diamond ${diamond.stockNumber}`}
            className="w-12 h-12 object-cover rounded border border-slate-200 dark:border-slate-600"
            onError={handleImageError}
          />
        ) : (
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 flex items-center justify-center">
            <ImageIcon className="h-4 w-4 text-slate-400" />
          </div>
        )}
      </TableCell>
      <TableCell className="font-mono text-xs font-medium text-slate-900 dark:text-slate-100">
        {diamond.stockNumber}
      </TableCell>
      <TableCell className="font-medium text-slate-900 dark:text-slate-100">{diamond.shape}</TableCell>
      <TableCell className="text-right font-medium text-slate-900 dark:text-slate-100">
        {diamond.carat.toFixed(2)}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600">
          {diamond.color}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600">
          {diamond.clarity}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600">
          {diamond.cut}
        </Badge>
      </TableCell>
      <TableCell className="text-right font-bold text-slate-900 dark:text-slate-100">
        ${diamond.price.toLocaleString()}
      </TableCell>
      <TableCell>
        <Badge 
          className={`${
            diamond.status === "Available" 
              ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-200" 
              : diamond.status === "Reserved" 
              ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200" 
              : "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-700 dark:text-slate-200"
          }`}
          variant="outline"
        >
          {diamond.status}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge 
          className={`${
            (diamond as any).store_visible
              ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200" 
              : "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200"
          }`}
          variant="outline"
        >
          {(diamond as any).store_visible ? "Visible" : "Hidden"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          {onToggleStoreVisibility && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleStoreVisibility(diamond)}
              className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
              title={`${(diamond as any).store_visible ? 'Hide from' : 'Show in'} store`}
            >
              {(diamond as any).store_visible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShareLink}
            className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
            title="Copy store link"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(diamond)}
              className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(diamond.id)}
              className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
