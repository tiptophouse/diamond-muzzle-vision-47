import { useState, useEffect } from "react";
import { TelegramLayout } from "@/components/layout/TelegramLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Camera, Plus, FileImage, Sparkles, ArrowLeft } from "lucide-react";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";

export default function UploadPage() {
  const { hapticFeedback, mainButton } = useTelegramWebApp();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Smooth entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Setup Telegram main button
    mainButton.show("התחלת סריקה מהירה", () => {
      hapticFeedback.impact('heavy');
      window.location.href = "/upload-single-stone?action=scan";
    });

    return () => {
      clearTimeout(timer);
      mainButton.hide();
    };
  }, [hapticFeedback, mainButton]);

  const handleCameraClick = () => {
    hapticFeedback.impact('heavy');
  };

  const handleManualClick = () => {
    hapticFeedback.impact('medium');
  };

  const handleBulkClick = () => {
    hapticFeedback.impact('light');
  };

  return (
    <TelegramLayout>
      <div className={`min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        
        {/* Header with elegant gradient */}
        <div className="relative px-6 pt-12 pb-8 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent"></div>
          
          <div className="relative space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 shadow-xl animate-fade-in">
              <Sparkles className="h-10 w-10 text-primary animate-pulse" />
            </div>
            
            <h1 className="text-3xl font-black text-foreground leading-tight">
              העלאת יהלומים
              <br />
              <span className="bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                למלאי שלכם
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-md mx-auto">
              הוסיפו יהלומים בקלות ובמהירות
              <br />
              עם טכנולוגיית סריקה מתקדמת
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="px-6 space-y-4">
          
          {/* Primary: Camera Scan - Pulsing with premium design */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary via-primary-glow to-primary shadow-premium hover:shadow-xl transition-all duration-500 animate-fade-in group">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            
            {/* Pulsing ring animation */}
            <div className="absolute inset-0 rounded-xl border-2 border-white/40 animate-pulse"></div>
            
            <CardContent className="relative p-8">
              <Link to="/upload-single-stone?action=scan">
                <div 
                  onClick={handleCameraClick}
                  className="flex items-center justify-between text-right cursor-pointer"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-end gap-3">
                      <h3 className="text-2xl font-black text-white">
                        סריקת תעודה מיידית
                      </h3>
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-300">
                        <Camera className="h-8 w-8 text-white animate-pulse" />
                      </div>
                    </div>
                    
                    <p className="text-white/90 text-lg font-medium leading-relaxed">
                      צלמו את תעודת GIA לזיהוי אוטומטי
                      <br />
                      של כל הפרטים תוך שניות
                    </p>
                    
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <span className="text-white/80 font-semibold">המהיר ביותר</span>
                      <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Secondary: Manual Entry */}
          <Card className="relative overflow-hidden border border-muted/20 bg-gradient-to-br from-background to-muted/5 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in group" style={{ animationDelay: '0.1s' }}>
            <div className="absolute top-0 left-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-12 -translate-x-12"></div>
            
            <CardContent className="relative p-6">
              <Link to="/upload-single-stone">
                <div 
                  onClick={handleManualClick}
                  className="flex items-center justify-between text-right cursor-pointer"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-end gap-3">
                      <h3 className="text-xl font-bold text-foreground">
                        הזנה ידנית מפורטת
                      </h3>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform duration-300">
                        <Plus className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-base leading-relaxed">
                      הוסיפו יהלום עם מידע מלא
                      <br />
                      ובקרה מדויקת על כל הפרטים
                    </p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Tertiary: Bulk Upload */}
          <Card className="relative overflow-hidden border border-muted/20 bg-gradient-to-br from-background to-muted/5 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-6">
              <div 
                onClick={handleBulkClick}
                className="flex items-center justify-between text-right cursor-pointer"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex items-center justify-end gap-3">
                    <h3 className="text-lg font-semibold text-foreground">
                      העלאה מרובה CSV
                    </h3>
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <FileImage className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    העלו מספר יהלומים בבת אחת
                    <br />
                    באמצעות קובץ אקסל
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Instructions with modern glass effect */}
        <div className="px-6 py-8 mt-8">
          <Card className="border-0 bg-gradient-to-r from-accent/10 via-accent/5 to-primary/10 backdrop-blur-sm shadow-lg animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent animate-pulse" />
                  <h4 className="font-bold text-accent">הוראות מהירות</h4>
                </div>
                
                <div className="text-right space-y-2 text-sm text-muted-foreground leading-relaxed">
                  <div className="flex items-center justify-end gap-2">
                    <span>לחצו על "סריקת תעודה מיידית"</span>
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <span>כוונו את המצלמה לתעודת GIA</span>
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <span>המתינו לזיהוי אוטומטי</span>
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <span>בדקו ושמרו</span>
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fixed bottom CTA for immediate action */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-sm border-t border-muted/20">
          <Link to="/upload-single-stone?action=scan">
            <Button
              onClick={handleCameraClick}
              className="w-full h-14 text-lg font-black bg-gradient-to-r from-primary via-primary-glow to-primary text-white shadow-premium hover:shadow-xl active:scale-95 transition-all duration-300 relative overflow-hidden"
            >
              {/* Button shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-[shimmer_2s_infinite]"></div>
              <Camera className="h-6 w-6 ml-3" />
              התחילו סריקה עכשיו
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
            </Button>
          </Link>
        </div>

        {/* Safe area spacing for iPhone */}
        <div className="h-20"></div>
      </div>
    </TelegramLayout>
  );
}