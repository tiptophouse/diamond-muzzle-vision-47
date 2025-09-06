import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Zap,
  Shield,
  Globe,
  MessageSquare,
  RefreshCw
} from 'lucide-react';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'warning' | 'error' | 'pending';
  message: string;
  details?: any;
}

export function WebhookDiagnostics() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);

  const runComprehensiveDiagnostics = async () => {
    setIsRunning(true);
    setDiagnostics([]);
    
    const results: DiagnosticResult[] = [];

    // Test 1: Webhook Endpoint Accessibility
    results.push({ name: 'Webhook Endpoint', status: 'pending', message: 'Testing endpoint accessibility...' });
    setDiagnostics([...results]);

    try {
      const webhookResponse = await fetch('https://uhhljqgxhdhbbhpohxll.functions.supabase.co/telegram-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          update_id: 999999,
          message: {
            message_id: 1,
            from: { id: 123456789, first_name: "Test", username: "testuser" },
            chat: { id: -100123456789, type: "supergroup", title: "Test Group" },
            date: Math.floor(Date.now() / 1000),
            text: "Test message for diagnostics"
          }
        })
      });

      results[results.length - 1] = {
        name: 'Webhook Endpoint',
        status: webhookResponse.ok ? 'success' : 'error',
        message: webhookResponse.ok 
          ? `✅ Webhook responding (${webhookResponse.status})` 
          : `❌ Webhook failed (${webhookResponse.status})`,
        details: { status: webhookResponse.status, statusText: webhookResponse.statusText }
      };
    } catch (error) {
      results[results.length - 1] = {
        name: 'Webhook Endpoint',
        status: 'error',
        message: `❌ Webhook unreachable: ${error.message}`,
        details: error
      };
    }

    // Test 2: Database Connectivity
    results.push({ name: 'Database Connection', status: 'pending', message: 'Testing database access...' });
    setDiagnostics([...results]);

    try {
      const { data, error } = await supabase.from('chatbot_messages').select('count').limit(1);
      results[results.length - 1] = {
        name: 'Database Connection',
        status: error ? 'error' : 'success',
        message: error ? `❌ Database error: ${error.message}` : '✅ Database accessible',
        details: { data, error }
      };
    } catch (error) {
      results[results.length - 1] = {
        name: 'Database Connection',
        status: 'error',
        message: `❌ Database connection failed: ${error.message}`,
        details: error
      };
    }

    // Test 3: Recent Bot Activity
    results.push({ name: 'Bot Activity Check', status: 'pending', message: 'Checking recent bot messages...' });
    setDiagnostics([...results]);

    try {
      const { data: recentMessages, error } = await supabase
        .from('chatbot_messages')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(10);

      const messageCount = recentMessages?.length || 0;
      results[results.length - 1] = {
        name: 'Bot Activity Check',
        status: messageCount > 0 ? 'success' : 'warning',
        message: messageCount > 0 
          ? `✅ ${messageCount} messages in last 24h` 
          : '⚠️ No bot messages in last 24h',
        details: { messageCount, recentMessages }
      };
    } catch (error) {
      results[results.length - 1] = {
        name: 'Bot Activity Check',
        status: 'error',
        message: `❌ Failed to check activity: ${error.message}`,
        details: error
      };
    }

    // Test 4: Bot Analytics Health
    results.push({ name: 'Analytics Health', status: 'pending', message: 'Checking analytics data...' });
    setDiagnostics([...results]);

    try {
      const { data: analyticsData, error } = await supabase
        .from('bot_usage_analytics')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const analyticsCount = analyticsData?.length || 0;
      results[results.length - 1] = {
        name: 'Analytics Health',
        status: analyticsCount > 0 ? 'success' : 'warning',
        message: analyticsCount > 0 
          ? `✅ ${analyticsCount} analytics entries today` 
          : '⚠️ No analytics data today',
        details: { analyticsCount, analyticsData }
      };
    } catch (error) {
      results[results.length - 1] = {
        name: 'Analytics Health',
        status: 'error',
        message: `❌ Analytics check failed: ${error.message}`,
        details: error
      };
    }

    // Test 5: Notification System
    results.push({ name: 'Notification System', status: 'pending', message: 'Testing notification delivery...' });
    setDiagnostics([...results]);

    try {
      const { data: recentNotifications, error } = await supabase
        .from('notifications')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(5);

      const notificationCount = recentNotifications?.length || 0;
      results[results.length - 1] = {
        name: 'Notification System',
        status: notificationCount > 0 ? 'success' : 'warning',
        message: notificationCount > 0 
          ? `✅ ${notificationCount} notifications sent today` 
          : '⚠️ No notifications sent today',
        details: { notificationCount, recentNotifications }
      };
    } catch (error) {
      results[results.length - 1] = {
        name: 'Notification System',
        status: 'error',
        message: `❌ Notification check failed: ${error.message}`,
        details: error
      };
    }

    setDiagnostics(results);
    setIsRunning(false);

    // Show summary toast
    const errorCount = results.filter(r => r.status === 'error').length;
    const warningCount = results.filter(r => r.status === 'warning').length;
    
    if (errorCount > 0) {
      toast({
        title: "❌ Diagnostics Complete - Issues Found",
        description: `${errorCount} errors, ${warningCount} warnings detected`,
        variant: "destructive",
      });
    } else if (warningCount > 0) {
      toast({
        title: "⚠️ Diagnostics Complete - Warnings",
        description: `${warningCount} warnings detected`,
      });
    } else {
      toast({
        title: "✅ Diagnostics Complete - All Good!",
        description: "All systems are functioning properly",
      });
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending': return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    const variants = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    };
    
    return <Badge className={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Comprehensive Webhook Diagnostics
        </CardTitle>
        <CardDescription>
          Run complete system health checks for bot webhook connectivity and message processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Button 
            onClick={runComprehensiveDiagnostics}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isRunning ? 'Running Diagnostics...' : 'Run Full Diagnostics'}
          </Button>
          
          {diagnostics.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {diagnostics.filter(d => d.status === 'success').length}/{diagnostics.length} tests passed
            </div>
          )}
        </div>

        {diagnostics.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Diagnostic Results</h4>
            {diagnostics.map((diagnostic, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getStatusIcon(diagnostic.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{diagnostic.name}</span>
                    {getStatusBadge(diagnostic.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{diagnostic.message}</p>
                  {diagnostic.details && diagnostic.status !== 'pending' && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                        View Details
                      </summary>
                      <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(diagnostic.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            What This Tests
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Webhook Endpoint:</strong> Tests if Telegram can reach your webhook URL</li>
            <li>• <strong>Database Connection:</strong> Verifies Supabase database access</li>
            <li>• <strong>Bot Activity:</strong> Checks for recent incoming messages</li>
            <li>• <strong>Analytics Health:</strong> Validates bot usage tracking</li>
            <li>• <strong>Notification System:</strong> Confirms message delivery capabilities</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}