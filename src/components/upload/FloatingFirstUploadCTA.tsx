import { Button } from "@/components/ui/button";
import { Upload, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

export function FloatingFirstUploadCTA() {
  const { user } = useTelegramAuth();
  const { diamonds, loading } = useInventoryData();
  
  // Don't show if user is not logged in, data is loading, or user has diamonds
  if (!user || loading || diamonds.length > 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <Link to="/upload-single-stone">
        <Button
          size="lg"
          className="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary via-primary-glow to-primary hover:scale-105 text-primary-foreground border-2 border-primary-glow/30"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Upload className="h-5 w-5" />
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-primary-glow animate-pulse" />
            </div>
            <span className="font-medium">Upload Your First Diamond</span>
          </div>
        </Button>
      </Link>
    </div>
  );
}