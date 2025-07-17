import { useEffect, useState } from 'react';
import { useTelegramStorage } from '@/hooks/useTelegramStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cloud, HardDrive, RefreshCw, Trash2, Database } from 'lucide-react';
import { toast } from 'sonner';

export function TelegramStorageInfo() {
  const { 
    storageType, 
    isCloudStorageReady, 
    getStorageInfo, 
    clearStoredData,
    localData 
  } = useTelegramStorage();
  
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadStorageInfo = async () => {
    setLoading(true);
    try {
      const info = await getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('Failed to load storage info:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all stored data? This will remove all cached diamonds and preferences.')) {
      await clearStoredData();
      await loadStorageInfo();
      toast.success('All stored data cleared');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {storageType === 'cloud' ? (
            <Cloud className="h-5 w-5 text-blue-600" />
          ) : (
            <HardDrive className="h-5 w-5 text-gray-600" />
          )}
          Storage Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Storage Type */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Type:</span>
          <Badge variant={storageType === 'cloud' ? 'default' : 'secondary'}>
            {storageType === 'cloud' ? 'Telegram Cloud' : 'Local Storage'}
          </Badge>
        </div>

        {/* Cloud Storage Status */}
        {storageType === 'cloud' && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Cloud Ready:</span>
            <Badge variant={isCloudStorageReady ? 'default' : 'destructive'}>
              {isCloudStorageReady ? 'Ready' : 'Not Available'}
            </Badge>
          </div>
        )}

        {/* Stored Data Summary */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Stored Data:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-blue-50 p-2 rounded">
              <div className="font-medium">{localData.diamonds.length}</div>
              <div className="text-muted-foreground">Diamonds</div>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <div className="font-medium">{localData.searchHistory.length}</div>
              <div className="text-muted-foreground">Searches</div>
            </div>
            <div className="bg-purple-50 p-2 rounded">
              <div className="font-medium">{localData.recentlyViewed.length}</div>
              <div className="text-muted-foreground">Recently Viewed</div>
            </div>
            <div className="bg-orange-50 p-2 rounded">
              <div className="font-medium">
                {localData.userPreferences.favoriteShapes.length}
              </div>
              <div className="text-muted-foreground">Preferences</div>
            </div>
          </div>
        </div>

        {/* Storage Info */}
        {storageInfo && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {storageType === 'cloud' ? 'Keys Count:' : 'Storage Size:'}
              </span>
              <span className="text-sm font-medium">
                {storageType === 'cloud' 
                  ? storageInfo.keysCount 
                  : formatBytes(storageInfo.size)
                }
              </span>
            </div>
            
            {localData.lastUpdated > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Updated:</span>
                <span className="text-sm font-medium">
                  {new Date(localData.lastUpdated).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadStorageInfo}
            disabled={loading}
            className="flex-1"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleClearData}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>

        {/* Benefits */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-blue-900 mb-1">
            📱 Telegram Storage Benefits:
          </div>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Sync across all your devices</li>
            <li>• Offline access to your diamonds</li>
            <li>• Remembers your preferences</li>
            <li>• Fast loading & search history</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}