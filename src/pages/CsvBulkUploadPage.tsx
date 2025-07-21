import { useState, useEffect } from "react";
import { TelegramLayout } from "@/components/layout/TelegramLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { useEnhancedUploadHandler } from "@/hooks/useEnhancedUploadHandler";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { useTelegramMainButton } from "@/hooks/useTelegramMainButton";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function CsvBulkUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const { uploading, progress, result, handleUpload, resetState } = useEnhancedUploadHandler();
  const { user, isAuthenticated } = useTelegramAuth();
  const { impactOccurred, notificationOccurred, selectionChanged } = useTelegramHapticFeedback();

  const openFilePicker = () => {
    impactOccurred('light');
    document.getElementById('file-input')?.click();
  };

  const startUpload = () => {
    if (selectedFile) {
      impactOccurred('medium');
      handleUpload(selectedFile);
    }
  };

  // Telegram Main Button for upload action
  useTelegramMainButton({
    text: selectedFile && !uploading && !result ? "העלה יהלומים" : "בחר קובץ CSV",
    isVisible: !!selectedFile && !uploading && !result,
    isEnabled: !!selectedFile && !uploading,
    onClick: selectedFile ? startUpload : openFilePicker,
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === "text/csv" || file.name.endsWith('.csv'))) {
      setSelectedFile(file);
      resetState();
      notificationOccurred('success');
      impactOccurred('medium');
    } else if (file) {
      notificationOccurred('error');
      impactOccurred('heavy');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === "text/csv" || file.name.endsWith('.csv'))) {
      setSelectedFile(file);
      resetState();
      notificationOccurred('success');
      impactOccurred('medium');
    } else if (file) {
      notificationOccurred('error');
      impactOccurred('heavy');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
    selectionChanged();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };


  const resetForm = () => {
    setSelectedFile(null);
    resetState();
    impactOccurred('light');
  };

  if (!isAuthenticated) {
    return (
      <TelegramLayout>
        <div className="p-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please log in to upload CSV files.
            </AlertDescription>
          </Alert>
        </div>
      </TelegramLayout>
    );
  }

  return (
    <TelegramLayout>
      <div className="p-4 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">העלאה מרובה CSV</h1>
          <p className="text-sm text-muted-foreground">
            העלה מספר יהלומים בבת אחת באמצעות קובץ CSV
          </p>
        </div>

        {/* Requirements Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-primary">
              שדות חובה CSV:
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <Badge variant="secondary">Shape</Badge>
              <Badge variant="secondary">Weight</Badge>
              <Badge variant="secondary">Color</Badge>
              <Badge variant="secondary">Clarity</Badge>
              <Badge variant="secondary">Cut</Badge>
              <Badge variant="secondary">Fluorescence</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              שדות אופציונליים: Stock#, Lab, CertNumber, Price/Crt, ועוד
            </p>
          </CardContent>
        </Card>

        {/* Upload Area */}
        {!result && (
          <Card className="border-2 border-dashed border-muted-foreground/25">
            <CardContent className="p-6">
              {!selectedFile ? (
                <div
                  className={`text-center space-y-4 p-6 rounded-lg transition-colors ${
                    dragActive ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={openFilePicker}
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">בחר קובץ CSV</h3>
                    <p className="text-sm text-muted-foreground">
                      גרור ושחרר או לחץ לבחירת קובץ
                    </p>
                  </div>
                  <input
                    id="file-input"
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetForm}
                      disabled={uploading}
                      className="touch-manipulation"
                    >
                      החלף
                    </Button>
                  </div>

                  {uploading ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">מעלה...</span>
                        <span className="text-sm text-muted-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="text-xs text-muted-foreground text-center">
                        {progress < 30 && "מעבד קובץ CSV..."}
                        {progress >= 30 && progress < 60 && "מבצע מיפוי חכם..."}
                        {progress >= 60 && progress < 80 && "משפר נתונים..."}
                        {progress >= 80 && progress < 95 && "מעלה יהלומים..."}
                        {progress >= 95 && "מסיים..."}
                      </div>
                    </div>
                  ) : (
                    // Mobile-optimized upload button - hidden on mobile since Telegram Main Button is used
                    <Button
                      onClick={startUpload}
                      className="w-full touch-manipulation min-h-[44px] hidden md:flex"
                      size="lg"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      העלה יהלומים
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <Card className={`${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                תוצאות העלאה
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className={result.success ? 'border-green-200' : 'border-red-200'}>
                <AlertDescription className="text-sm">
                  {result.message}
                </AlertDescription>
              </Alert>

              {result.processedCount !== undefined && (
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <div className="text-lg font-bold text-green-700">{result.processedCount}</div>
                    <div className="text-xs text-green-600">הועלו בהצלחה</div>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <div className="text-lg font-bold text-red-700">
                      {(result.totalProcessed || 0) - (result.processedCount || 0)}
                    </div>
                    <div className="text-xs text-red-600">נכשלו</div>
                  </div>
                </div>
              )}

              {result.errors && result.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-red-700">שגיאות:</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {result.errors.slice(0, 10).map((error, index) => (
                      <div key={index} className="text-xs p-2 bg-red-100 rounded text-red-700">
                        {error}
                      </div>
                    ))}
                    {result.errors.length > 10 && (
                      <div className="text-xs text-red-600 text-center">
                        ועוד {result.errors.length - 10} שגיאות...
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={resetForm}
                  variant="outline"
                  className="flex-1 touch-manipulation min-h-[44px]"
                >
                  העלה קובץ נוסף
                </Button>
                <Button
                  onClick={() => {
                    impactOccurred('light');
                    window.location.href = '/inventory';
                  }}
                  className="flex-1 touch-manipulation min-h-[44px]"
                >
                  צפה במלאי
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Text */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-2">עצות להעלאה מוצלחת:</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• וודא שהקובץ מכיל את השדות החובה: Shape, Weight, Color, Clarity, Cut, Fluorescence</li>
              <li>• שדות חסרים יושלמו אוטומטית על ידי הבינה המלאכותית</li>
              <li>• שורות ללא השדות החובה יידלגו ולא יועלו</li>
              <li>• תמיכה בפורמטים שונים של CSV</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </TelegramLayout>
  );
}