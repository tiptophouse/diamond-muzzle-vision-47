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
    <div className="fixed bottom-6 right-6 z-40 pointer-events-none animate-fade-in">
      <Link to="/upload-single-stone" className="pointer-events-auto">
        <Button
          size="lg"
          className="shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:scale-110 text-white rounded-full h-16 w-16 p-0"
          title="Upload Diamond"
        >
          <Upload className="h-8 w-8" />
        </Button>
      </Link>
    </div>
  );
}
