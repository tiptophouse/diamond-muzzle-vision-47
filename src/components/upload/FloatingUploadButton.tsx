import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

export function FloatingUploadButton() {
  const { user } = useTelegramAuth();
  const location = useLocation();
  
  // Don't show on upload pages or if not authenticated
  const isUploadPage = location.pathname.includes('/upload') || location.pathname.includes('/standardize-csv');
  
  if (!user || isUploadPage) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <Link to="/upload">
        <div className="relative">
          {/* Pulsing glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 opacity-75 animate-pulse blur-xl"></div>
          
          {/* Main button */}
          <Button
            size="lg"
            className="relative shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:scale-110 text-white rounded-full h-20 w-20 p-0 border-4 border-white"
            title="Upload Diamond"
          >
            <div className="flex flex-col items-center justify-center">
              <Upload className="h-9 w-9" />
              <span className="text-xs font-bold mt-0.5">Upload</span>
            </div>
          </Button>
        </div>
      </Link>
    </div>
  );
}
