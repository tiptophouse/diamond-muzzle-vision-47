
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Diamond } from "./InventoryTable";
import { Edit, Trash } from "lucide-react";

interface InventoryMobileCardProps {
  diamond: Diamond;
  onEdit?: (diamond: Diamond) => void;
  onDelete?: (diamondId: string) => void;
}

export function InventoryMobileCard({ diamond, onEdit, onDelete }: InventoryMobileCardProps) {
  return (
    <Card className="bg-slate-50 border-slate-200 hover:bg-slate-100 transition-colors">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-mono text-sm font-semibold text-slate-900">
              {diamond.stockNumber}
            </h3>
            <p className="text-lg font-bold text-slate-800">{diamond.shape}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-slate-900">
              ${diamond.price.toLocaleString()}
            </p>
            <Badge 
              className={`${
                diamond.status === "Available" 
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300" 
                  : diamond.status === "Reserved" 
                  ? "bg-blue-100 text-blue-800 border-blue-300" 
                  : "bg-slate-100 text-slate-800 border-slate-300"
              }`}
              variant="outline"
            >
              {diamond.status}
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="space-y-2">
            <div>
              <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Carat</span>
              <p className="text-sm font-semibold text-slate-900">{diamond.carat.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Color</span>
              <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 text-xs">
                {diamond.color}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div>
              <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Clarity</span>
              <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 text-xs">
                {diamond.clarity}
              </Badge>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Cut</span>
              <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 text-xs">
                {diamond.cut}
              </Badge>
            </div>
          </div>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex gap-2 pt-2 border-t border-slate-200">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(diamond)}
                className="flex-1"
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
                className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
