import { TelegramLayout } from "@/components/layout/TelegramLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Upload, Gem, FileSpreadsheet, ArrowRight } from "lucide-react";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";

export default function UploadPage() {
  const { hapticFeedback } = useTelegramWebApp();

  return (
    <TelegramLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Header */}
        <div className="px-6 pt-8 pb-6 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-glow shadow-lg mb-2">
            <Upload className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Add Diamonds
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Choose how you'd like to add diamonds to your inventory
          </p>
        </div>

        {/* Upload Options */}
        <div className="px-6 pb-8 space-y-4">
          {/* Single Diamond Upload - Primary */}
          <Link to="/upload-single-stone">
            <Card 
              className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 active:scale-[0.98] cursor-pointer overflow-hidden"
              onClick={() => hapticFeedback.impact('medium')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-6">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                    <Gem className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-semibold text-foreground mb-1">
                      Single Diamond
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Add one diamond with detailed information
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground pl-[72px]">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span>Quick & Easy</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>Detailed Entry</span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          {/* Bulk CSV Upload */}
          <Link to="/upload/bulk">
            <Card 
              className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 active:scale-[0.98] cursor-pointer overflow-hidden"
              onClick={() => hapticFeedback.impact('medium')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-6">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                    <FileSpreadsheet className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-semibold text-foreground mb-1">
                      Bulk Upload (CSV)
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Upload multiple diamonds at once
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground pl-[72px]">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span>Fast Import</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <span>Bulk Processing</span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          {/* Help Card */}
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <div className="p-6">
              <h4 className="font-semibold text-accent mb-2 flex items-center gap-2">
                <span className="text-lg">💡</span>
                Quick Tips
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span>Use <strong>Single Diamond</strong> for detailed entry with photos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span>Use <strong>Bulk Upload</strong> to import entire inventory from CSV</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span>All diamonds sync instantly to your inventory</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </TelegramLayout>
  );
}
