import { TelegramLayout } from "@/components/layout/TelegramLayout";
import { UploadForm } from "@/components/upload/UploadForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Upload, FileText, Camera, Zap } from "lucide-react";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { useState } from "react";


export default function UploadPage() {
  const { hapticFeedback } = useTelegramWebApp();
  const [language] = useState<'he' | 'en'>('he'); // Default to Hebrew

  const text = {
    he: {
      title: "העלאת יהלומים למלאי",
      subtitle: "העלו את נתוני המלאי שלכם באמצעות קבצי CSV או הוסיפו יהלומים בנפרד",
      uploadSingle: "העלאת יהלום בודד",
      uploadSingleDesc: "הוסיפו יהלומים בודדים עם מידע מפורט וסריקת תעודות",
      scanCertificate: "סרקו תעודת GIA",
      scanDesc: "הדרך הכי מהירה להוסיף יהלום - סרקו את התעודה להזנת נתונים מיידית",
      startScan: "התחלת סריקת תעודה",
      bulkUpload: "העלאה מרובה CSV",
      bulkDesc: "העלו מספר יהלומים בבת אחת באמצעות קובץ CSV",
      stepByStep: "הוראות שלב אחר שלב:",
      step1: "1. לחצו על 'התחלת סריקת תעודה'",
      step2: "2. כוונו את המצלמה לתעודת ה-GIA",
      step3: "3. המתינו לזיהוי אוטומטי של הנתונים",
      step4: "4. בדקו ושמרו את הפרטים"
    },
    en: {
      title: "Upload Inventory",
      subtitle: "Upload your inventory data using CSV files or add individual diamonds",
      uploadSingle: "Upload Single Diamond",
      uploadSingleDesc: "Add individual diamonds with detailed information and certificate scanning",
      scanCertificate: "Scan GIA Certificate",
      scanDesc: "Fastest way to add a diamond - scan your certificate for instant data entry",
      startScan: "Start Certificate Scan",
      bulkUpload: "Bulk CSV Upload",
      bulkDesc: "Upload multiple diamonds at once using a CSV file",
      stepByStep: "Step by step instructions:",
      step1: "1. Click 'Start Certificate Scan'",
      step2: "2. Point camera at GIA certificate",
      step3: "3. Wait for automatic data recognition",
      step4: "4. Review and save details"
    }
  };

  const t = text[language];

  return (
    <TelegramLayout>
      <div className="space-y-6 px-4 py-6">
        {/* Header with clear instructions */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary-dark bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {t.subtitle}
          </p>
          
          {/* Clear step-by-step guide */}
          <Card className="border-accent/20 bg-gradient-to-r from-accent/5 to-accent/10">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-accent mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                {t.stepByStep}
              </h3>
              <div className="text-right space-y-2 text-sm text-muted-foreground">
                <div>{t.step1}</div>
                <div>{t.step2}</div>
                <div>{t.step3}</div>
                <div>{t.step4}</div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* PRIMARY: Single Diamond Upload Card with BLINKING animation */}
        <Card className="border-primary/50 bg-gradient-to-br from-primary/10 via-primary/5 to-primary/15 hover:border-primary/60 transition-all duration-300 shadow-premium relative overflow-hidden">
          {/* Pulsing background animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 animate-pulse opacity-60"></div>
          
          <CardHeader className="pb-4 relative z-10">
            <CardTitle className="flex items-center gap-4 text-primary text-xl">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/30 shadow-lg animate-scale-in">
                <Camera className="h-7 w-7 animate-pulse" />
              </div>
              {t.scanCertificate}
            </CardTitle>
            <p className="text-base text-muted-foreground leading-relaxed font-medium">
              {t.scanDesc}
            </p>
          </CardHeader>
          <CardContent className="relative z-10">
            <Link to="/upload-single-stone?action=scan">
              <Button
                onClick={() => hapticFeedback.impact('heavy')}
                data-tutorial="upload-single-diamond"
                variant="default"
                size="lg"
                className="w-full h-16 text-lg font-bold animate-pulse hover:animate-none shadow-premium relative overflow-hidden"
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 animate-[shimmer_2s_infinite]"></div>
                <Camera className="h-6 w-6 mr-3" />
                {t.startScan}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Secondary Upload Card */}
        <Card className="border-muted/30 bg-gradient-to-br from-muted/5 to-muted/10 hover:border-muted/40 transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-4 text-lg">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-muted/10 to-muted/20 shadow-md">
                <Upload className="h-6 w-6" />
              </div>
              {t.uploadSingle}
            </CardTitle>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.uploadSingleDesc}
            </p>
          </CardHeader>
          <CardContent>
            <Link to="/upload-single-stone">
              <Button
                onClick={() => hapticFeedback.impact('medium')}
                variant="outline"
                size="lg"
                className="w-full"
              >
                <Upload className="h-5 w-5 mr-2" />
                {t.uploadSingle}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Bulk Upload Card */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-muted to-muted/80 shadow-md">
                <FileText className="h-6 w-6" />
              </div>
              {t.bulkUpload}
            </CardTitle>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.bulkDesc}
            </p>
          </CardHeader>
          <CardContent>
            <Link to="/upload/bulk">
              <Button
                onClick={() => hapticFeedback.impact('medium')}
                variant="outline"
                size="lg"
                className="w-full"
              >
                <FileText className="h-5 w-5 mr-2" />
                {t.bulkUpload}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </TelegramLayout>
  );
}
