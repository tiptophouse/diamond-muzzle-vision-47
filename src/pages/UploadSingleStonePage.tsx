import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { TelegramLayout } from "@/components/layout/TelegramLayout";
import { SingleStoneUploadForm } from "@/components/upload/SingleStoneUploadForm";
import { UploadForm } from "@/components/upload/UploadForm";
import { UploadWizard } from "@/components/upload/UploadWizard";
import { MobileTutorialWizard } from "@/components/tutorial/MobileTutorialWizard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeScanner } from "@/components/inventory/QRCodeScanner";
import { FileText, Camera, Scan, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
export default function UploadSingleStonePage() {
  const [searchParams] = useSearchParams();
  const [isScanning, setIsScanning] = useState(false);
  const [hasScannedCertificate, setHasScannedCertificate] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [language, setLanguage] = useState<'en' | 'he'>('he'); // Default to Hebrew
  const {
    toast
  } = useToast();
  const {
    platform,
    hapticFeedback
  } = useTelegramWebApp();

  // Check URL parameters for actions
  useEffect(() => {
    const action = searchParams.get('action');
    const tutorial = searchParams.get('tutorial');
    if (action === 'scan') {
      // Check if it's a mobile platform (iPhone/Android in Telegram)
      if (platform === 'ios' || platform === 'android' || window.innerWidth < 768) {
        setShowWizard(true);
      } else {
        setIsScanning(true);
      }
    }
    if (tutorial === 'true') {
      setShowTutorial(true);
    }
  }, [searchParams, platform]);
  const handleScanSuccess = (giaData: any) => {
    hapticFeedback.notification('success');
    setScannedData(giaData);
    setHasScannedCertificate(true);
    setIsScanning(false);
    toast({
      title: "✅ Certificate Scanned",
      description: "Diamond data extracted successfully",
      duration: 2000
    });
  };
  const handleStartOver = () => {
    hapticFeedback.impact('light');
    setHasScannedCertificate(false);
    setScannedData(null);
  };
  const handleWizardComplete = () => {
    setShowWizard(false);
    toast({
      title: language === 'he' ? 'העלאה הושלמה!' : 'Upload Complete!',
      description: language === 'he' ? 'היהלום שלך נוסף בהצלחה למלאי' : 'Your diamond has been successfully added to inventory'
    });
  };

  // Show tutorial on mobile if requested
  if (showTutorial) {
    return <MobileTutorialWizard isOpen={showTutorial} onClose={() => setShowTutorial(false)} language={language} onLanguageChange={setLanguage} />;
  }

  // Show wizard on mobile platforms for better UX
  if (showWizard) {
    return <UploadWizard language={language} onLanguageChange={setLanguage} onComplete={handleWizardComplete} />;
  }
  const isMobile = platform === 'ios' || platform === 'android' || window.innerWidth < 768;
  
  // Hebrew translations
  const text = {
    he: {
      scanCertificate: "סריקת תעודת GIA",
      scanDesc: "הדרך הכי מהירה להוסיף יהלום - סרקו את התעודה להזנת נתונים מיידית",
      startScan: "התחלת סריקת תעודה",
      bulkUpload: "העלאה מרובה CSV",
      bulkDesc: "העלו מספר יהלומים בבת אחת באמצעות קובץ CSV",
      scannedSuccess: "התעודה נסרקה בהצלחה",
      startOver: "התחלה מחדש",
      instructions: "הוראות שלב אחר שלב:",
      step1: "1. לחצו על 'התחלת סריקת תעודה'",
      step2: "2. כוונו את המצלמה לתעודת ה-GIA",
      step3: "3. המתינו לזיהוי אוטומטי של הנתונים",
      step4: "4. בדקו ושמרו את הפרטים"
    },
    en: {
      scanCertificate: "Scan GIA Certificate",
      scanDesc: "Fastest way to add a diamond - scan your certificate for instant data entry",
      startScan: "Start Certificate Scan",
      bulkUpload: "Bulk CSV Upload",
      bulkDesc: "Upload multiple diamonds at once using a CSV file",
      scannedSuccess: "Certificate scanned successfully",
      startOver: "Start Over",
      instructions: "Step by step instructions:",
      step1: "1. Click 'Start Certificate Scan'",
      step2: "2. Point camera at GIA certificate",
      step3: "3. Wait for automatic data recognition",
      step4: "4. Review and save details"
    }
  };

  const t = text[language];
  
  return <TelegramLayout>
      <div className="min-h-screen bg-background">
        <div className="px-4 pb-safe pt-4">
          {/* Clear Instructions Card */}
          {!hasScannedCertificate && (
            <Card className="border-accent/20 bg-gradient-to-r from-accent/5 to-accent/10 mb-6">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-accent mb-4 flex items-center gap-2 text-right">
                  <Sparkles className="h-5 w-5" />
                  {t.instructions}
                </h3>
                <div className="text-right space-y-2 text-sm text-muted-foreground">
                  <div>{t.step1}</div>
                  <div>{t.step2}</div>
                  <div>{t.step3}</div>
                  <div>{t.step4}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {!hasScannedCertificate ? <div className="space-y-4">
              {/* Scan Certificate Card - Primary Action with BLINKING */}
              <Card className="border-primary/50 bg-gradient-to-br from-primary/10 via-primary/5 to-primary/15 hover:border-primary/60 transition-all duration-300 shadow-premium relative overflow-hidden">
                {/* Pulsing background animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 animate-pulse opacity-60"></div>
                
                <CardHeader className="pb-3 relative z-10">
                  <CardTitle className="flex items-center gap-3 text-primary text-xl text-right">
                    <div className="p-2 rounded-full bg-primary/20 animate-scale-in">
                      <Scan className="h-6 w-6 animate-pulse" />
                    </div>
                    {t.scanCertificate}
                  </CardTitle>
                  <p className="text-base text-muted-foreground text-right font-medium">
                    {t.scanDesc}
                  </p>
                </CardHeader>
                <CardContent className="relative z-10">
                  <Button onClick={() => {
                hapticFeedback.impact('heavy');
                setIsScanning(true);
              }} className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-premium active:scale-95 transition-all animate-pulse hover:animate-none relative overflow-hidden" style={{
                minHeight: '64px'
              }}>
                    {/* Button glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 animate-[shimmer_2s_infinite]"></div>
                    <Camera className="h-6 w-6 mr-3" />
                    {t.startScan}
                  </Button>
                </CardContent>
              </Card>

              {/* Bulk Upload Option */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-right">
                    <div className="p-2 rounded-full bg-muted">
                      <FileText className="h-5 w-5" />
                    </div>
                    {t.bulkUpload}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground text-right">
                    {t.bulkDesc}
                  </p>
                </CardHeader>
                <CardContent>
                  <UploadForm />
                </CardContent>
              </Card>
            </div> :
        // Show form after successful scan
        <div>
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      {t.scannedSuccess}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleStartOver} className="text-xs text-muted-foreground hover:text-foreground active:scale-95 transition-all h-8" style={{
                minHeight: '32px'
              }}>
                    {t.startOver}
                  </Button>
                </div>
              </div>
              <SingleStoneUploadForm initialData={scannedData} showScanButton={false} />
            </div>}
        </div>

        {/* QR Scanner Modal */}
        <QRCodeScanner isOpen={isScanning} onClose={() => {
        hapticFeedback.impact('light');
        setIsScanning(false);
      }} onScanSuccess={handleScanSuccess} />
      </div>
    </TelegramLayout>;
}