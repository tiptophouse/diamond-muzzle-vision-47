
import { useState } from "react";
import { Heart, Eye, Plus, Edit, Trash, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useInventoryCrud } from "@/hooks/useInventoryCrud";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { Diamond } from "@/components/inventory/InventoryTable";
import { AdminStoreControls } from "./AdminStoreControls";

interface EnhancedDiamondCardProps {
  diamond: Diamond;
  index?: number;
  onUpdate?: () => void;
  onDelete?: () => void;
}

export function EnhancedDiamondCard({ diamond, index = 0, onUpdate, onDelete }: EnhancedDiamondCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showAdminControls, setShowAdminControls] = useState(false);
  const { user } = useTelegramAuth();
  const { deleteDiamond } = useInventoryCrud({ onSuccess: onUpdate });

  const isManager = user?.id === 101;

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this diamond?')) {
      await deleteDiamond(diamond.id, diamond);
      if (onDelete) onDelete();
    }
  };

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(diamond.price);

  return (
    <Card 
      className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-white border border-slate-200"
      style={{
        animationDelay: `${index * 100}ms`,
        animation: 'fadeIn 0.6s ease-out forwards',
      }}
      onMouseEnter={() => setShowAdminControls(true)}
      onMouseLeave={() => setShowAdminControls(false)}
    >
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden">
          {diamond.imageUrl ? (
            <img 
              src={diamond.imageUrl} 
              alt={`${diamond.shape} Diamond`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
              <ImageIcon className="h-16 w-16 text-slate-300" />
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <Badge 
              variant={diamond.status === "Available" ? "default" : "secondary"}
              className={`${
                diamond.status === "Available" 
                  ? "bg-green-500 hover:bg-green-600 text-white" 
                  : "bg-yellow-500 text-white"
              }`}
            >
              {diamond.status}
            </Badge>
          </div>

          {/* Manager Controls */}
          {isManager && showAdminControls && (
            <AdminStoreControls 
              diamond={diamond} 
              onUpdate={onUpdate || (() => {})} 
              onDelete={onDelete || (() => {})} 
            />
          )}

          {/* Like Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-3 right-3 h-8 w-8 p-0 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
          </Button>

          {/* Quick View Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute bottom-3 right-3 h-8 w-8 p-0 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Eye className="h-4 w-4 text-slate-600" />
          </Button>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">
                {diamond.carat}ct {diamond.shape}
              </h3>
              <p className="text-sm text-slate-600">#{diamond.stockNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-slate-900">{formattedPrice}</p>
              <p className="text-xs text-slate-500">
                ${Math.round(diamond.price / diamond.carat).toLocaleString()}/ct
              </p>
            </div>
          </div>

          {/* 4Cs Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 rounded-lg p-2">
              <p className="text-xs text-slate-500">Color</p>
              <p className="font-semibold text-slate-900">{diamond.color}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2">
              <p className="text-xs text-slate-500">Clarity</p>
              <p className="font-semibold text-slate-900">{diamond.clarity}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2">
              <p className="text-xs text-slate-500">Cut</p>
              <p className="font-semibold text-slate-900">{diamond.cut}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" className="flex-1">
              View Details
            </Button>
            {isManager && (
              <Button variant="outline" size="sm" className="px-3">
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
