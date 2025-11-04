
import { useState } from "react";
import { MessageCircle, ImageIcon, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { EnhancedContactButton } from "./EnhancedContactButton";
import { OptimizedDiamondImage } from "./OptimizedDiamondImage";
import { formatPrice } from "@/utils/numberUtils";

interface DiamondCardProps {
  diamond: Diamond;
  index: number;
}

export function DiamondCard({ diamond, index }: DiamondCardProps) {
  const { user } = useTelegramAuth();

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image Container */}
      <div className="relative h-48 bg-gradient-to-br from-primary/5 to-primary-glow/10 rounded-t-xl overflow-hidden">
        <OptimizedDiamondImage
          imageUrl={diamond.imageUrl || diamond.picture}
          gem360Url={diamond.gem360Url}
          stockNumber={diamond.stockNumber}
          shape={diamond.shape}
          className="w-full h-full"
          priority={index < 4} // Prioritize first 4 images
        />
        
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
            {formatPrice(diamond.price)}
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

        {/* Contact Button */}
        <EnhancedContactButton 
          diamond={diamond}
          className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary-dark hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
        />
      </div>
    </div>
  );
}
