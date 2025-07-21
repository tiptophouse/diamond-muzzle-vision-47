import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { TelegramLayout } from "@/components/layout/TelegramLayout";
import { SingleStoneUploadForm } from "@/components/upload/SingleStoneUploadForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QRCodeScanner } from "@/components/inventory/QRCodeScanner";
import { Camera, CheckCircle, ArrowRight, Sparkles, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";

export default function UploadSingleStonePage() {
  const [searchParams] = useSearchParams();
  const [isScanning, setIsScanning] = useState(false);
  const [hasScannedCertificate, setHasScannedCertificate] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();
  const { hapticFeedback, mainButton } = useTelegramWebApp();

  useEffect(() => {
    // Entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Check URL parameters for actions
    const action = searchParams.get('action');
    if (action === 'scan') {
      setIsScanning(true);
    }

    // Setup main button based on state
    if (!hasScannedCertificate) {
      mainButton.show("התחלת סריקה", () => {
        hapticFeedback.impact('heavy');
        setIsScanning(true);
      });
    } else {
      mainButton.hide();
    }

    return () => {
      clearTimeout(timer);
      mainButton.hide();
    };
  }, [searchParams, hasScannedCertificate, hapticFeedback, mainButton]);

  const handleScanSuccess = (giaData: any) => {
    hapticFeedback.notification('success');
    setScannedData(giaData);
    setHasScannedCertificate(true);
    setIsScanning(false);
    toast({
      title: "התעודה נסרקה בהצלחה!",
      description: "נתוני היהלום חולצו ומוכנים לעריכה",
      duration: 3000
    });
  };

  const handleStartOver = () => {
    hapticFeedback.impact('medium');
    setHasScannedCertificate(false);
    setScannedData(null);
    mainButton.show("התחלת סריקה", () => {
      hapticFeedback.impact('heavy');
      setIsScanning(true);
    });
  };

  return (
    <TelegramLayout>
      <div className={`min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        
        {!hasScannedCertificate ? (
          <>
            {/* Header */}
            <div className="relative px-6 pt-12 pb-8 text-center">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent"></div>
              
              <div className="relative space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 shadow-xl animate-fade-in">
                  <Camera className="h-10 w-10 text-primary animate-pulse" />
                </div>
                
                <h1 className="text-3xl font-black text-foreground leading-tight">
                  סריקת תעודת
                  <br />
                  <span className="bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                    GIA
                  </span>
                </h1>
                
                <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-md mx-auto">
                  הדרך הכי מהירה להוסיף יהלום
                  <br />
                  עם זיהוי אוטומטי מתקדם
                </p>
              </div>
            </div>

            {/* Instructions Card */}
            <div className="px-6 mb-6">
              <Card className="border-0 bg-gradient-to-r from-accent/10 via-accent/5 to-primary/10 backdrop-blur-sm shadow-lg animate-fade-in">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="h-5 w-5 text-accent animate-pulse" />
                      <h4 className="font-bold text-accent">הוראות סריקה</h4>
                    </div>
                    
                    <div className="text-right space-y-3 text-base text-muted-foreground leading-relaxed">
                      <div className="flex items-center justify-end gap-3">
                        <span>וודאו שהתעודה מוארת היטב</span>
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">1</div>
                      </div>
                      <div className="flex items-center justify-end gap-3">
                        <span>כוונו את המצלמה ישירות לתעודה</span>
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">2</div>
                      </div>
                      <div className="flex items-center justify-end gap-3">
                        <span>המתינו לזיהוי אוטומטי של הנתונים</span>
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">3</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Scan Button */}
            <div className="px-6">
              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary via-primary-glow to-primary shadow-premium animate-fade-in">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10"></div>
                <div className="absolute inset-0 rounded-xl border-2 border-white/40 animate-pulse"></div>
                
                <CardContent className="relative p-8">
                  <Button
                    onClick={() => {
                      hapticFeedback.impact('heavy');
                      setIsScanning(true);
                    }}
                    className="w-full h-20 text-xl font-black bg-transparent hover:bg-white/10 text-white border-0 shadow-none relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-[shimmer_2s_infinite]"></div>
                    <div className="flex items-center justify-center gap-4">
                      <Camera className="h-8 w-8 animate-pulse" />
                      <span>התחלת סריקה</span>
                      <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <>
            {/* Success Header */}
            <div className="relative px-6 pt-12 pb-8 text-center">
              <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 via-green-500/5 to-transparent"></div>
              
              <div className="relative space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-green-500/30 shadow-xl animate-fade-in">
                  <CheckCircle className="h-10 w-10 text-green-500 animate-pulse" />
                </div>
                
                <h1 className="text-3xl font-black text-foreground leading-tight">
                  התעודה נסרקה
                  <br />
                  <span className="bg-gradient-to-l from-green-500 via-green-400 to-green-500 bg-clip-text text-transparent">
                    בהצלחה!
                  </span>
                </h1>
                
                <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-md mx-auto">
                  בדקו את הפרטים ושמרו את היהלום
                  <br />
                  למלאי שלכם
                </p>
              </div>
            </div>

            {/* Success Status */}
            <div className="px-6 mb-6">
              <Card className="border-0 bg-gradient-to-r from-green-500/10 via-green-500/5 to-green-400/10 backdrop-blur-sm shadow-lg animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleStartOver}
                      className="text-muted-foreground hover:text-foreground gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      סריקה מחדש
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-green-700 dark:text-green-400 font-semibold">
                        נתונים חולצו בהצלחה
                      </span>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Form */}
            <div className="px-6 pb-safe">
              <SingleStoneUploadForm 
                initialData={scannedData} 
                showScanButton={false}
              />
            </div>
          </>
        )}

        {/* QR Scanner Modal */}
        <QRCodeScanner 
          isOpen={isScanning} 
          onClose={() => {
            hapticFeedback.impact('light');
            setIsScanning(false);
          }} 
          onScanSuccess={handleScanSuccess} 
        />

        {/* Safe area spacing */}
        <div className="h-20"></div>
      </div>
    </TelegramLayout>
  );
}