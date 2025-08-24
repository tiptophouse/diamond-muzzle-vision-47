import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

export function FloatingFirstUploadCTA() {
  const { user } = useTelegramAuth();
  const { diamonds, loading } = useInventoryData();
  const location = useLocation();
  
  // Don't show if user is not logged in, data is loading, user has diamonds, or on upload pages
  const isUploadPage = location.pathname.includes('/upload') || location.pathname.includes('/standardize-csv');
  
  if (!user || loading || diamonds.length > 0 || isUploadPage) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <Link to="/upload-single-stone">
        <Button
          size="sm"
          className="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary-glow hover:scale-105 text-primary-foreground rounded-full"
          title="Upload Your First Diamond"
        >
          <Upload className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}