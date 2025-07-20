import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
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
  const [language, setLanguage] = useState<'en' | 'he'>('en');
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
  return <Layout>
      <div className="min-h-screen bg-background">
        <div className="px-4 pb-safe pt-4">
          {/* Mobile Enhancement Suggestion */}
          {isMobile && !hasScannedCertificate && <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 mb-4">
              
            </Card>}

          {!hasScannedCertificate ? <div className="space-y-4">
              {/* Scan Certificate Card - Primary Action */}
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-primary">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Scan className="h-5 w-5" />
                    </div>
                    Scan GIA Certificate
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Fastest way to add a diamond - scan your certificate for instant data entry
                  </p>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => {
                hapticFeedback.impact('medium');
                setIsScanning(true);
              }} className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm active:scale-95 transition-all" style={{
                minHeight: '48px'
              }}>
                    <Camera className="h-5 w-5 mr-2" />
                    Start Certificate Scan
                  </Button>
                </CardContent>
              </Card>

              {/* Bulk Upload Option */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted">
                      <FileText className="h-5 w-5" />
                    </div>
                    Bulk CSV Upload
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Upload multiple diamonds at once using a CSV file
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
                      Certificate scanned successfully
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleStartOver} className="text-xs text-muted-foreground hover:text-foreground active:scale-95 transition-all h-8" style={{
                minHeight: '32px'
              }}>
                    Start Over
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
    </Layout>;
}