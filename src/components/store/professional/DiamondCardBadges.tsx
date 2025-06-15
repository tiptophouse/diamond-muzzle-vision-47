
import { Badge } from "@/components/ui/badge";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

const ADMIN_TELEGRAM_ID = 2138564172;

interface DiamondCardBadgesProps {
  isAdmin: boolean;
}

export function DiamondCardBadges({ isAdmin }: DiamondCardBadgesProps) {
  const { user, isTelegramEnvironment } = useTelegramAuth();
  
  // Only show admin badge if verified admin in Telegram environment
  const showAdminBadge = user?.id === ADMIN_TELEGRAM_ID && isTelegramEnvironment;

  if (!showAdminBadge) return null;

  return (
    <div className="absolute top-2 left-2 z-20">
      <Badge className="bg-blue-600 text-white text-xs px-2 py-1">
        ADMIN
      </Badge>
    </div>
  );
}
