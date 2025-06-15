
import { Diamond } from "@/components/inventory/InventoryTable";

interface DiamondCardContentProps {
  diamond: Diamond;
  hasGem360View: boolean;
  isAdmin: boolean;
}

export function DiamondCardContent({ diamond, hasGem360View, isAdmin }: DiamondCardContentProps) {
  return (
    <div className="p-4 space-y-3">
      {/* Title */}
      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
        GIA {diamond.carat} Carat {diamond.color}-{diamond.clarity} {diamond.cut} Cut {diamond.shape} Diamond
      </h3>

      {/* Price */}
      <div className="text-lg font-bold text-gray-900">
        ${diamond.price.toLocaleString()}
      </div>

      {/* Quick Details - Horizontal Layout */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        <div className="text-center">
          <div className="text-gray-500">Carat</div>
          <div className="font-medium">{diamond.carat}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">Color</div>
          <div className="font-medium">{diamond.color}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">Clarity</div>
          <div className="font-medium">{diamond.clarity}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">Cut</div>
          <div className="font-medium text-xs">{diamond.cut.slice(0, 4)}</div>
        </div>
      </div>

      {/* Stock Number */}
      <div className="text-xs text-gray-500 border-t pt-2">
        Stock #{diamond.stockNumber}
      </div>

      {/* 3D View Badge */}
      {hasGem360View && (
        <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
          ✨ Interactive 3D view available above
        </div>
      )}

      {/* Admin Info - only show for admin users */}
      {isAdmin && (
        <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
          Admin: Click edit/delete buttons above to manage this diamond
        </div>
      )}
    </div>
  );
}
