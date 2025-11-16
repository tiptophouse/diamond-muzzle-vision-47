import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export default function Diagnostic() {
  const navigate = useNavigate();
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>({});

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isSamsung = /Samsung/i.test(navigator.userAgent);
    
    setDiagnosticInfo({
      platform: navigator.userAgent,
      isAndroid,
      isSamsung,
      telegramSDKAvailable: !!tg,
      telegramVersion: (tg as any)?.version || 'N/A',
      telegramPlatform: (tg as any)?.platform || 'N/A',
      initDataAvailable: !!tg?.initData,
      initDataLength: tg?.initData?.length || 0,
      webViewInfo: {
        chromeVersion: navigator.userAgent.match(/Chrome\/(\d+)/)?.[1],
        isWebView: navigator.userAgent.includes('wv'),
        fullUserAgent: navigator.userAgent
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">🔍 Diagnostic Information</h1>
      </div>
      
      {diagnosticInfo.isAndroid && (
        <Card className="p-4 bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-orange-900 dark:text-orange-100 mb-2">
                ⚠️ Android Device Detected
              </h2>
              <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                If the app crashes on startup, please follow these steps:
              </p>
              <ol className="text-sm text-orange-800 dark:text-orange-200 list-decimal list-inside space-y-2">
                <li><strong>Go to Settings</strong> → Apps → Show system apps</li>
                <li><strong>Find "Android System WebView"</strong></li>
                <li><strong>Tap Storage</strong> → Clear cache → Clear data</li>
                <li><strong>Update WebView</strong> to latest version in Play Store</li>
                <li><strong>Restart your phone</strong> and try again</li>
              </ol>
              
              {diagnosticInfo.isSamsung && (
                <div className="mt-3 p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                    📱 Samsung Device Detected
                  </p>
                  <p className="text-xs text-orange-800 dark:text-orange-200 mt-1">
                    Samsung devices are known to have WebView compatibility issues. 
                    The steps above are especially important for your device.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
      
      <Card className="p-4 bg-card">
        <h3 className="font-bold text-foreground mb-3">System Information:</h3>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Platform:</span>
            <span className="text-foreground font-mono">
              {diagnosticInfo.isAndroid ? '🤖 Android' : '📱 Other'}
            </span>
            
            {diagnosticInfo.isSamsung && (
              <>
                <span className="text-muted-foreground">Manufacturer:</span>
                <span className="text-foreground font-mono">Samsung</span>
              </>
            )}
            
            <span className="text-muted-foreground">Telegram SDK:</span>
            <span className="text-foreground font-mono">
              {diagnosticInfo.telegramSDKAvailable ? '✅ Available' : '❌ Not Available'}
            </span>
            
            <span className="text-muted-foreground">SDK Version:</span>
            <span className="text-foreground font-mono">
              {diagnosticInfo.telegramVersion || 'N/A'}
            </span>
            
            <span className="text-muted-foreground">Init Data:</span>
            <span className="text-foreground font-mono">
              {diagnosticInfo.initDataAvailable ? `✅ ${diagnosticInfo.initDataLength} chars` : '❌ Missing'}
            </span>
            
            <span className="text-muted-foreground">Chrome Version:</span>
            <span className="text-foreground font-mono">
              {diagnosticInfo.webViewInfo?.chromeVersion || 'N/A'}
            </span>
            
            <span className="text-muted-foreground">WebView Mode:</span>
            <span className="text-foreground font-mono">
              {diagnosticInfo.webViewInfo?.isWebView ? 'Yes' : 'No'}
            </span>
            
            <span className="text-muted-foreground">Screen Size:</span>
            <span className="text-foreground font-mono">
              {diagnosticInfo.viewport?.width}x{diagnosticInfo.viewport?.height}
            </span>
          </div>
        </div>
      </Card>
      
      <Card className="p-4 bg-card">
        <h3 className="font-bold text-foreground mb-2">Full User Agent:</h3>
        <pre className="text-xs bg-muted text-muted-foreground p-3 rounded overflow-auto whitespace-pre-wrap break-all">
          {diagnosticInfo.platform}
        </pre>
      </Card>
      
      <Card className="p-4 bg-card">
        <h3 className="font-bold text-foreground mb-2">Complete Diagnostic Data:</h3>
        <pre className="text-xs bg-muted text-muted-foreground p-3 rounded overflow-auto">
          {JSON.stringify(diagnosticInfo, null, 2)}
        </pre>
      </Card>
    </div>
  );
}
