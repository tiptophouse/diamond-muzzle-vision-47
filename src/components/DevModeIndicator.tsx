import { AlertCircle } from "lucide-react";
import { isDevelopmentMode } from "@/lib/api/config";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DevModeIndicator() {
  const isDevMode = isDevelopmentMode();

  if (!isDevMode) {
    return null;
  }

  return (
    <Alert variant="default" className="fixed bottom-4 right-4 w-auto max-w-md z-50 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
      <AlertTitle className="text-yellow-800 dark:text-yellow-300">Development Mode</AlertTitle>
      <AlertDescription className="text-yellow-700 dark:text-yellow-400 text-xs">
        Running without Telegram authentication. Test in actual Telegram app for full functionality.
      </AlertDescription>
    </Alert>
  );
}
