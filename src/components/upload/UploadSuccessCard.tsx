import { Check, Sparkles, Share2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface UploadSuccessCardProps {
  title?: string;
  description?: string;
  onContinue?: () => void;
  onShare?: () => void;
  showActions?: boolean;
}

export function UploadSuccessCard({ 
  title = "Uploaded Successfully",
  description = "Your stone has been uploaded. Ready to share or continue.",
  onContinue,
  onShare,
  showActions = true
}: UploadSuccessCardProps) {
  return (
    <Card className="max-w-md mx-auto bg-gradient-to-br from-white to-emerald-50/30 border-emerald-200/50 shadow-xl shadow-emerald-500/10 animate-scale-in">
      <CardContent className="p-8 text-center space-y-6">
        {/* Success Icon with Animation */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl animate-pulse shadow-lg shadow-emerald-500/30"></div>
          <div className="relative w-full h-full bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center">
            <Check className="w-10 h-10 text-white animate-fade-in" strokeWidth={3} />
          </div>
          {/* Sparkle Effect */}
          <div className="absolute -top-1 -right-1">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {onShare && (
              <Button 
                variant="outline" 
                onClick={onShare}
                className="flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100 text-blue-700 hover:text-blue-800 transition-all duration-300"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            )}
            {onContinue && (
              <Button 
                onClick={onContinue}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 group"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            )}
          </div>
        )}

        {/* Decorative Elements */}
        <div className="absolute top-4 left-4 w-2 h-2 bg-emerald-400 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-8 right-6 w-1 h-1 bg-emerald-500 rounded-full opacity-80 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-emerald-300 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </CardContent>
    </Card>
  );
}