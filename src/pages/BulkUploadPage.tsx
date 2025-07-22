
import { TelegramLayout } from "@/components/layout/TelegramLayout";
import { BulkUploadForm } from "@/components/upload/BulkUploadForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileSpreadsheet, AlertTriangle } from "lucide-react";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";

export default function BulkUploadPage() {
  const { hapticFeedback } = useTelegramWebApp();

  return (
    <TelegramLayout>
      <div className="space-y-6 px-4 py-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <FileSpreadsheet className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Bulk CSV Upload
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Upload multiple diamonds at once using CSV or Excel files
          </p>
        </div>

        {/* Important Notice */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="font-semibold text-amber-800">7 Mandatory Fields Required</h3>
                <p className="text-sm text-amber-700">
                  Each diamond must have: <strong>Certificate ID, Color, Cut, Weight (Carat), Clarity, Fluorescence, Shape</strong>. 
                  Rows missing any of these fields will be skipped. Other fields are optional.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Form */}
        <BulkUploadForm />
      </div>
    </TelegramLayout>
  );
}
