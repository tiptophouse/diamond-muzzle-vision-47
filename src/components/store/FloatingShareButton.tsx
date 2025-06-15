
import { Share2 } from "lucide-react";
import { ShareButton } from "./ShareButton";

export function FloatingShareButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <ShareButton 
        variant="default"
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-14 px-6 rounded-full"
      />
    </div>
  );
}
