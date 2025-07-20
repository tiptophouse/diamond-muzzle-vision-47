import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { Camera, Upload, FileText, CheckCircle, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QRCodeScanner } from '@/components/inventory/QRCodeScanner';
import { SingleStoneUploadForm } from './SingleStoneUploadForm';
import { useToast } from '@/hooks/use-toast';

interface WizardStep {
  id: string;
  title: { en: string; he: string };
  description: { en: string; he: string };
  icon: React.ReactNode;
  component?: React.ReactNode;
  completed?: boolean;
}

interface UploadWizardProps {
  language?: 'en' | 'he';
  onLanguageChange?: (lang: 'en' | 'he') => void;
  onComplete?: () => void;
}

export function UploadWizard({ 
  language = 'en', 
  onLanguageChange,
  onComplete 
}: UploadWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [scannedData, setScannedData] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const { hapticFeedback, mainButton, backButton, showAlert } = useTelegramWebApp();
  const navigate = useNavigate();
  const { toast } = useToast();

  const wizardSteps: WizardStep[] = [
    {
      id: 'method-selection',
      title: { en: 'Choose Upload Method', he: 'בחר שיטת העלאה' },
      description: { en: 'Select how you want to add your diamond', he: 'בחר איך תרצה להוסיף את היהלום שלך' },
      icon: <Sparkles className="h-6 w-6" />
    },
    {
      id: 'certificate-scan',
      title: { en: 'Scan Certificate', he: 'סרוק תעודה' },
      description: { en: 'Use your camera to scan GIA certificate', he: 'השתמש במצלמה לסרוק תעודת GIA' },
      icon: <Camera className="h-6 w-6" />
    },
    {
      id: 'diamond-details',
      title: { en: 'Diamond Details', he: 'פרטי היהלום' },
      description: { en: 'Review and complete diamond information', he: 'סקור והשלם את מידע היהלום' },
      icon: <FileText className="h-6 w-6" />
    },
    {
      id: 'success',
      title: { en: 'Upload Complete', he: 'העלאה הושלמה' },
      description: { en: 'Your diamond has been added successfully', he: 'היהלום שלך נוסף בהצלחה' },
      icon: <CheckCircle className="h-6 w-6" />
    }
  ];

  const currentStepData = wizardSteps[currentStep];
  const progressPercentage = ((currentStep + 1) / wizardSteps.length) * 100;

  // Handle Telegram main button
  useEffect(() => {
    const isLastStep = currentStep === wizardSteps.length - 1;
    
    if (currentStep === 0) {
      mainButton.hide(); // Hide for method selection
    } else if (currentStep === 1 && !scannedData) {
      mainButton.hide(); // Hide during scanning
    } else if (currentStep === 2) {
      mainButton.hide(); // Hide during form filling
    } else if (isLastStep) {
      const buttonText = language === 'he' ? 'סיום' : 'Finish';
      mainButton.show(buttonText, handleFinish, '#28a745');
    } else {
      const buttonText = language === 'he' ? 'הבא' : 'Next';
      mainButton.show(buttonText, handleNext, '#007AFF');
    }

    return () => {
      mainButton.hide();
    };
  }, [currentStep, scannedData, language]);

  // Handle Telegram back button
  useEffect(() => {
    if (currentStep > 0 && !isScanning) {
      backButton.show(handlePrevious);
    } else {
      backButton.hide();
    }

    return () => {
      backButton.hide();
    };
  }, [currentStep, isScanning]);

  const handleNext = () => {
    hapticFeedback.impact('medium');
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    hapticFeedback.impact('light');
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    hapticFeedback.notification('success');
    onComplete?.();
    navigate('/inventory');
  };

  const handleMethodSelect = (method: 'scan' | 'manual') => {
    hapticFeedback.impact('medium');
    
    if (method === 'scan') {
      setCurrentStep(1);
      setIsScanning(true);
    } else {
      setCurrentStep(2);
    }
    
    markStepCompleted('method-selection');
  };

  const handleScanSuccess = (giaData: any) => {
    hapticFeedback.notification('success');
    setScannedData(giaData);
    setIsScanning(false);
    markStepCompleted('certificate-scan');
    
    toast({
      title: language === 'he' ? 'סריקה הצליחה!' : 'Scan Successful!',
      description: language === 'he' 
        ? 'פרטי התעודה נקלטו בהצלחה'
        : 'Certificate details captured successfully'
    });
    
    setTimeout(() => {
      setCurrentStep(2);
    }, 1000);
  };

  const handleScanClose = () => {
    setIsScanning(false);
    hapticFeedback.impact('light');
  };

  const handleUploadSuccess = () => {
    hapticFeedback.notification('success');
    setUploadSuccess(true);
    markStepCompleted('diamond-details');
    setCurrentStep(3);
    
    toast({
      title: language === 'he' ? 'היהלום נוסף בהצלחה!' : 'Diamond Added Successfully!',
      description: language === 'he' 
        ? 'היהלום שלך נוסף למלאי'
        : 'Your diamond has been added to inventory'
    });
  };

  const markStepCompleted = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Method Selection
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="text-6xl">💎</div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {language === 'he' ? 'איך תרצה להוסיף יהלום?' : 'How would you like to add a diamond?'}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {language === 'he' 
                    ? 'בחר את השיטה המועדפת עליך'
                    : 'Choose your preferred method'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => handleMethodSelect('scan')}
                size="lg"
                className="w-full h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg active:scale-95 transition-all"
              >
                <div className="flex items-center gap-4">
                  <Camera className="h-8 w-8" />
                  <div className="text-left">
                    <div className="font-semibold">
                      {language === 'he' ? 'סרוק תעודה' : 'Scan Certificate'}
                    </div>
                    <div className="text-sm opacity-90">
                      {language === 'he' ? 'מומלץ - מהיר ומדויק' : 'Recommended - Fast & Accurate'}
                    </div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => handleMethodSelect('manual')}
                variant="outline"
                size="lg"
                className="w-full h-16 border-2 active:scale-95 transition-all"
              >
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8" />
                  <div className="text-left">
                    <div className="font-semibold">
                      {language === 'he' ? 'הזנה ידנית' : 'Manual Entry'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {language === 'he' ? 'הזן פרטים באופן ידני' : 'Enter details manually'}
                    </div>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        );

      case 1: // Certificate Scan
        return (
          <div className="space-y-6">
            {!scannedData ? (
              <div className="text-center space-y-4">
                <div className="text-4xl">📱</div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {language === 'he' ? 'מוכן לסרוק?' : 'Ready to Scan?'}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {language === 'he' 
                      ? 'הנח את התעודה במרכז המסך והמתן לסריקה'
                      : 'Place the certificate in the center and wait for scanning'}
                  </p>
                </div>

                <Button
                  onClick={() => setIsScanning(true)}
                  size="lg"
                  className="w-full h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                >
                  <Camera className="h-6 w-6 mr-3" />
                  {language === 'he' ? 'התחל סריקה' : 'Start Scanning'}
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-4xl">✅</div>
                <div>
                  <h3 className="text-xl font-bold text-green-600 mb-2">
                    {language === 'he' ? 'סריקה הושלמה!' : 'Scan Complete!'}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {language === 'he' 
                      ? 'פרטי התעודה נקלטו בהצלחה'
                      : 'Certificate details captured successfully'}
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 2: // Diamond Details
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">
                {language === 'he' ? 'השלם פרטי היהלום' : 'Complete Diamond Details'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {language === 'he' 
                  ? 'בדוק ועדכן את הפרטים לפי הצורך'
                  : 'Review and update details as needed'}
              </p>
            </div>
            
            <SingleStoneUploadForm
              initialData={scannedData}
              showScanButton={false}
              onSuccess={handleUploadSuccess}
            />
          </div>
        );

      case 3: // Success
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl">🎉</div>
            <div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">
                {language === 'he' ? 'כל הכבוד!' : 'Congratulations!'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'he' 
                  ? 'היהלום שלך נוסף בהצלחה למלאי'
                  : 'Your diamond has been successfully added to inventory'}
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => navigate('/inventory')}
                size="lg"
                className="w-full h-12"
              >
                {language === 'he' ? 'עבור למלאי' : 'Go to Inventory'}
              </Button>

              <Button
                onClick={() => {
                  setCurrentStep(0);
                  setScannedData(null);
                  setUploadSuccess(false);
                  setCompletedSteps([]);
                }}
                variant="outline"
                size="lg"
                className="w-full h-12"
              >
                {language === 'he' ? 'הוסף יהלום נוסף' : 'Add Another Diamond'}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background" style={{ height: 'var(--tg-viewport-height, 100vh)' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                {currentStepData.icon}
              </div>
              <div>
                <div className="font-semibold">
                  {currentStepData.title[language]}
                </div>
                <div className="text-sm opacity-90">
                  {language === 'he' ? 'שלב' : 'Step'} {currentStep + 1} {language === 'he' ? 'מתוך' : 'of'} {wizardSteps.length}
                </div>
              </div>
            </div>

            {onLanguageChange && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLanguageChange(language === 'en' ? 'he' : 'en')}
                className="text-white hover:bg-white/20 text-xs px-3 py-1"
              >
                {language === 'en' ? 'עב' : 'EN'}
              </Button>
            )}
          </div>

          <Progress 
            value={progressPercentage} 
            className="h-2 bg-white/20"
          />
        </div>

        {/* Content */}
        <div className="p-6" dir={language === 'he' ? 'rtl' : 'ltr'}>
          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="p-0">
              {renderStepContent()}
            </CardContent>
          </Card>
        </div>

        {/* Progress Indicators */}
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {wizardSteps.map((step, index) => (
            <div
              key={step.id}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                completedSteps.includes(step.id)
                  ? 'bg-green-500'
                  : index === currentStep
                  ? 'bg-blue-500 scale-125'
                  : index < currentStep
                  ? 'bg-blue-300'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* QR Code Scanner Modal */}
      {isScanning && (
        <QRCodeScanner
          isOpen={isScanning}
          onScanSuccess={handleScanSuccess}
          onClose={handleScanClose}
        />
      )}
    </>
  );
}