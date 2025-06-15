
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { AdminStoreControls } from "./AdminStoreControls";
import { DiamondImageSection } from "./professional/DiamondImageSection";
import { DiamondCardContent } from "./professional/DiamondCardContent";
import { DiamondCardBadges } from "./professional/DiamondCardBadges";
import { useGem360Detection } from "./professional/DiamondGem360Utils";
import { Diamond } from "@/components/inventory/InventoryTable";

const ADMIN_TELEGRAM_ID = 2138564172;

interface ProfessionalDiamondCardProps {
  diamond: Diamond;
  onUpdate?: () => void;
}

export function ProfessionalDiamondCard({ diamond, onUpdate }: ProfessionalDiamondCardProps) {
  const { user, isTelegramEnvironment } = useTelegramAuth();
  
  // Only show admin controls if:
  // 1. User is authenticated through Telegram
  // 2. User ID matches the admin ID
  // 3. We're in a Telegram environment (for security)
  const isAdmin = user?.id === ADMIN_TELEGRAM_ID && isTelegramEnvironment;

  console.log('👤 Current user ID:', user?.id);
  console.log('🔐 Admin ID:', ADMIN_TELEGRAM_ID);
  console.log('📱 Telegram Environment:', isTelegramEnvironment);
  console.log('👑 Is Admin:', isAdmin);

  const { gem360Url, hasGem360View } = useGem360Detection(diamond);

  const handleDelete = () => {
    // Trigger refetch of data
    if (onUpdate) onUpdate();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group relative">
      {/* Admin Controls - Only show for verified admin in Telegram environment */}
      {isAdmin && (
        <>
          <DiamondCardBadges isAdmin={isAdmin} />
          
          {/* Admin Controls Component */}
          <AdminStoreControls 
            diamond={diamond}
            onUpdate={onUpdate || (() => {})}
            onDelete={handleDelete}
          />
        </>
      )}

      {/* Image/3D Viewer Container */}
      <DiamondImageSection
        diamond={diamond}
        hasGem360View={hasGem360View}
        gem360Url={gem360Url}
        isAdmin={isAdmin}
      />

      {/* Content */}
      <DiamondCardContent
        diamond={diamond}
        hasGem360View={hasGem360View}
        isAdmin={isAdmin}
      />
    </div>
  );
}
