
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Diamond } from "./InventoryTable";
import { Edit, Trash, ImageIcon } from "lucide-react";
import { GeneratePostButton } from "./GeneratePostButton";

interface InventoryMobileCardProps {
  diamond: Diamond;
  onEdit?: (diamond: Diamond) => void;
  onDelete?: (diamondId: string) => void;
}

export function InventoryMobileCard({ diamond, onEdit, onDelete }: InventoryMobileCardProps) {
  return (
    <Card className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
      <CardContent className="p-4 w-full">
        {/* Image section */}
        {diamond.imageUrl && (
          <div className="mb-4 w-full">
            <img 
              src={diamond.imageUrl} 
              alt={`Diamond ${diamond.stockNumber}`}
              className="w-full h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-600"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        
        {!diamond.imageUrl && (
          <div className="mb-4 w-full h-32 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-slate-400" />
          </div>
        )}

        <div className="flex justify-between items-start mb-4 w-full">
          <div className="flex-1 min-w-0">
            <h3 className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100 truncate mb-1">
              {diamond.stockNumber}
            </h3>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">ID:</span>
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{diamond.diamondId || 'N/A'}</span>
            </div>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200 capitalize">{diamond.shape}</p>
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              ${diamond.price.toLocaleString()}
            </p>
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
          </div>
        </div>
        
        <div className="space-y-3 mb-4 w-full">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">CARAT</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{diamond.carat.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">CLARITY</span>
              <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 text-xs">
                {diamond.clarity}
              </Badge>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">COLOR</span>
              <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 text-xs">
                {diamond.color}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">CUT</span>
              <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 text-xs">
                {diamond.cut}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-3 border-t border-slate-200 dark:border-slate-700 w-full">
          {/* Generate Post Button - Always visible */}
          <GeneratePostButton diamond={diamond} />
          
          {/* Edit and Delete buttons */}
          {(onEdit || onDelete) && (
            <div className="flex gap-2 w-full">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(diamond)}
                  className="flex-1 h-9 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(diamond.id)}
                  className="flex-1 h-9 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
