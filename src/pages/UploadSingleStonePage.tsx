import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { TelegramMiniAppLayout } from "@/components/layout/TelegramMiniAppLayout";
import { DiamondForm } from "@/components/upload/stone/DiamondForm";
import { UploadForm } from "@/components/upload/UploadForm";
import { UploadWizard } from "@/components/upload/UploadWizard";
import { MobileTutorialWizard } from "@/components/tutorial/MobileTutorialWizard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeScanner } from "@/components/inventory/QRCodeScanner";
import { FileText, Camera } from "lucide-react";
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
  
  return <TelegramMiniAppLayout>
      <div className="min-h-screen bg-background pb-safe">
        {!hasScannedCertificate ? (
          <div className="px-3 pt-2 space-y-3">
            {/* Compact Scan Button - Primary Action */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pb-2 pt-1">
              <Button 
                onClick={() => {
                  hapticFeedback.impact('heavy');
                  setIsScanning(true);
                }} 
                className="w-full h-14 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg active:scale-95 transition-all"
              >
                <Camera className="h-5 w-5 mr-2" />
                {t.startScan}
              </Button>
            </div>

            {/* Compact Bulk Upload Card */}
            <Card className="border-border/40">
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="flex items-center gap-2 text-sm text-right">
                  <FileText className="h-4 w-4" />
                  {t.bulkUpload}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <UploadForm />
              </CardContent>
            </Card>
          </div>
        ) : (
          // Show form after successful scan
          <div className="px-3 pt-2">
            <div className="mb-3 p-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">
                    {t.scannedSuccess}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleStartOver} 
                  className="text-xs text-muted-foreground hover:text-foreground h-7"
                >
                  {t.startOver}
                </Button>
              </div>
            </div>
            <DiamondForm initialData={scannedData} showScanButton={false} />
          </div>
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
      </div>
    </TelegramMiniAppLayout>;
}