import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Search, Send, Activity, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
  responseTime: number;
}

export function ApiTestingCenter() {
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  
  // Search API test state
  const [searchCriteria, setSearchCriteria] = useState({
    shape: '',
    color: '',
    clarity: '',
    weight_min: '',
    weight_max: '',
    price_min: '',
    price_max: ''
  });
  const [searcherName, setSearcherName] = useState('Test User');
  const [searchResult, setSearchResult] = useState<TestResult | null>(null);
  const [isSearchTesting, setIsSearchTesting] = useState(false);

  // Notification API test state
  const [notificationMessage, setNotificationMessage] = useState('Test notification message');
  const [targetTelegramId, setTargetTelegramId] = useState('');
  const [notificationResult, setNotificationResult] = useState<TestResult | null>(null);
  const [isNotificationTesting, setIsNotificationTesting] = useState(false);

  const testSearchAPI = async () => {
    if (!user?.id) {
      toast({
        title: "❌ Authentication Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return;
    }

    setIsSearchTesting(true);
    const startTime = Date.now();

    try {
      console.log('🔍 Testing diamond search API with criteria:', searchCriteria);
      
      const { data, error } = await supabase.functions.invoke('diamond-search-match', {
        body: {
          searchCriteria: Object.fromEntries(
            Object.entries(searchCriteria).filter(([_, value]) => value !== '')
          ),
          searcherTelegramId: user.id,
          searcherName: searcherName || 'Test User'
        }
      });

      const responseTime = Date.now() - startTime;

      if (error) {
        throw new Error(error.message || 'Search API error');
      }

      setSearchResult({
        success: true,
        data,
        timestamp: new Date().toISOString(),
        responseTime
      });

      toast({
        title: "✅ Search API Test Successful",
        description: `Found ${data?.matchingDiamonds || 0} matches in ${responseTime}ms`,
      });

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setSearchResult({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
        responseTime
      });

      toast({
        title: "❌ Search API Test Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSearchTesting(false);
    }
  };

  const testNotificationAPI = async () => {
    if (!user?.id) {
      toast({
        title: "❌ Authentication Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return;
    }

    setIsNotificationTesting(true);
    const startTime = Date.now();

    try {
      console.log('📧 Testing notification API');
      
      const { data, error } = await supabase.functions.invoke('send-telegram-message', {
        body: {
          telegramId: targetTelegramId || user.id,
          message: notificationMessage,
          messageType: 'test',
          testMode: true
        }
      });

      const responseTime = Date.now() - startTime;

      if (error) {
        throw new Error(error.message || 'Notification API error');
      }

      setNotificationResult({
        success: true,
        data,
        timestamp: new Date().toISOString(),
        responseTime
      });

      toast({
        title: "✅ Notification API Test Successful",
        description: `Message sent successfully in ${responseTime}ms`,
      });

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setNotificationResult({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
        responseTime
      });

      toast({
        title: "❌ Notification API Test Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsNotificationTesting(false);
    }
  };

  const renderTestResult = (result: TestResult | null, title: string) => {
    if (!result) return null;

    return (
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            {title} Result
            <Badge variant={result.success ? "default" : "destructive"}>
              {result.success ? 'Success' : 'Failed'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Response Time: {result.responseTime}ms</span>
              <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
            </div>
            
            {result.success && result.data && (
              <div>
                <Label className="text-xs font-medium">Response Data:</Label>
                <pre className="bg-green-50 p-2 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
            
            {!result.success && result.error && (
              <div>
                <Label className="text-xs font-medium text-red-600">Error Details:</Label>
                <pre className="bg-red-50 p-2 rounded text-xs text-red-800">
                  {result.error}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5" />
        <h2 className="text-lg font-semibold">API Testing Center</h2>
        <Badge variant="outline">JWT Secured</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Search API Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Diamond Search API
            </CardTitle>
            <CardDescription>
              Test the diamond search and notification system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Shape</Label>
                <Input
                  placeholder="e.g., round"
                  value={searchCriteria.shape}
                  onChange={(e) => setSearchCriteria({...searchCriteria, shape: e.target.value})}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Color</Label>
                <Input
                  placeholder="e.g., D"
                  value={searchCriteria.color}
                  onChange={(e) => setSearchCriteria({...searchCriteria, color: e.target.value})}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Clarity</Label>
                <Input
                  placeholder="e.g., VS1"
                  value={searchCriteria.clarity}
                  onChange={(e) => setSearchCriteria({...searchCriteria, clarity: e.target.value})}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Min Weight</Label>
                <Input
                  type="number"
                  placeholder="0.5"
                  value={searchCriteria.weight_min}
                  onChange={(e) => setSearchCriteria({...searchCriteria, weight_min: e.target.value})}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Searcher Name</Label>
              <Input
                value={searcherName}
                onChange={(e) => setSearcherName(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <Button 
              onClick={testSearchAPI}
              disabled={isSearchTesting}
              className="w-full"
              size="sm"
            >
              {isSearchTesting ? (
                <>
                  <AlertCircle className="h-3 w-3 mr-2 animate-spin" />
                  Testing Search API...
                </>
              ) : (
                <>
                  <Search className="h-3 w-3 mr-2" />
                  Test Search API
                </>
              )}
            </Button>

            {renderTestResult(searchResult, 'Search API')}
          </CardContent>
        </Card>

        {/* Notification API Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Notification API
            </CardTitle>
            <CardDescription>
              Test the Telegram notification system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Target Telegram ID</Label>
              <Input
                placeholder={`Leave empty to use your ID (${user?.id})`}
                value={targetTelegramId}
                onChange={(e) => setTargetTelegramId(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs">Test Message</Label>
              <Textarea
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                className="min-h-[60px] text-xs"
                placeholder="Enter your test notification message..."
              />
            </div>

            <Button 
              onClick={testNotificationAPI}
              disabled={isNotificationTesting}
              className="w-full"
              size="sm"
            >
              {isNotificationTesting ? (
                <>
                  <AlertCircle className="h-3 w-3 mr-2 animate-spin" />
                  Sending Test Notification...
                </>
              ) : (
                <>
                  <Send className="h-3 w-3 mr-2" />
                  Test Notification API
                </>
              )}
            </Button>

            {renderTestResult(notificationResult, 'Notification API')}
          </CardContent>
        </Card>
      </div>

      {/* API Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">API Status Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center justify-between">
              <span>Search API:</span>
              <Badge variant={searchResult?.success ? "default" : searchResult ? "destructive" : "secondary"}>
                {searchResult?.success ? 'Working' : searchResult ? 'Failed' : 'Not Tested'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Notification API:</span>
              <Badge variant={notificationResult?.success ? "default" : notificationResult ? "destructive" : "secondary"}>
                {notificationResult?.success ? 'Working' : notificationResult ? 'Failed' : 'Not Tested'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}