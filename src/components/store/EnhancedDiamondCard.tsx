
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, ImageIcon, Gem, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { AdminStoreControls } from "./AdminStoreControls";

const ADMIN_TELEGRAM_ID = 2138564172;

interface EnhancedDiamondCardProps {
  diamond: Diamond;
  index: number;
  onUpdate?: () => void;
  onDelete?: () => void;
}

export function EnhancedDiamondCard({ diamond, index, onUpdate, onDelete }: EnhancedDiamondCardProps) {
  const [imageError, setImageError] = useState(false);
  const { user } = useTelegramAuth();
  const navigate = useNavigate();
  const isAdmin = user?.id === ADMIN_TELEGRAM_ID;

  const handleContactOwner = () => {
    const message = `Hi! I'm interested in your diamond:\n\n` +
      `Stock #: ${diamond.stockNumber}\n` +
      `Shape: ${diamond.shape}\n` +
      `Carat: ${diamond.carat}\n` +
      `Color: ${diamond.color}\n` +
      `Clarity: ${diamond.clarity}\n` +
      `Price: $${diamond.price.toLocaleString()}\n\n` +
      `Could you please provide more details?`;

    const encodedMessage = encodeURIComponent(message);
    const telegramUrl = `https://t.me/share/url?url=${encodedMessage}`;
    
    window.open(telegramUrl, '_blank');
  };

  const handleViewDetails = () => {
    navigate(`/diamond/${diamond.stockNumber}`);
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group animate-fade-in relative"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Admin Controls */}
      {isAdmin && onUpdate && onDelete && (
        <AdminStoreControls 
          diamond={diamond}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      )}

      {/* Image Container */}
      <div className="relative h-48 bg-gradient-to-br from-slate-50 to-slate-100 rounded-t-xl overflow-hidden">
        {diamond.imageUrl && !imageError ? (
          <img
            src={diamond.imageUrl}
            alt={`Diamond ${diamond.stockNumber}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <Gem className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge 
            className={`${
              diamond.status === "Available" 
                ? "bg-emerald-100 text-emerald-800 border-emerald-300" 
                : "bg-blue-100 text-blue-800 border-blue-300"
            }`}
            variant="outline"
          >
            {diamond.status}
          </Badge>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
            #{diamond.stockNumber}
          </span>
          <span className="text-lg font-bold text-slate-900">
            ${diamond.price.toLocaleString()}
          </span>
        </div>

        {/* Diamond Details */}
        <div className="space-y-2">
          <h3 className="font-semibold text-slate-900 text-lg">
            {diamond.carat} ct {diamond.shape}
          </h3>
          
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center">
              <p className="text-slate-500">Color</p>
              <Badge variant="outline" className="text-xs">{diamond.color}</Badge>
            </div>
            <div className="text-center">
              <p className="text-slate-500">Clarity</p>
              <Badge variant="outline" className="text-xs">{diamond.clarity}</Badge>
            </div>
            <div className="text-center">
              <p className="text-slate-500">Cut</p>
              <Badge variant="outline" className="text-xs">{diamond.cut}</Badge>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={handleViewDetails}
            variant="outline"
            className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          
          <Button 
            onClick={handleContactOwner}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact
          </Button>
        </div>
      </div>
    </div>
  );
}
