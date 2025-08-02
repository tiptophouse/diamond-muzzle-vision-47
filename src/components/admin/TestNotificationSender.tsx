
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, MessageSquare } from 'lucide-react';

export function TestNotificationSender() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const sendTestComprehensiveMessage = async () => {
    try {
      setIsLoading(true);
      
      // Send the comprehensive welcome message to admin for testing
      const { data, error } = await supabase.functions.invoke('send-welcome-message', {
        body: {
          user: {
            telegram_id: 2138564172,
            first_name: "חן", // Using Hebrew name like in your example
            language_code: "he" // Hebrew for testing
          },
          isNewUser: true
        }
      });

      if (error) throw error;

      toast({
        title: "Comprehensive Welcome Message Sent!",
        description: "Check your Telegram for the complete Diamond Muzzle welcome message with all features and 4 main buttons.",
      });

    } catch (error) {
      console.error('Error sending test comprehensive message:', error);
      toast({
        title: "Error",
        description: "Failed to send test message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Test Comprehensive Welcome Message
        </CardTitle>
        <CardDescription>
          Send the updated comprehensive welcome message to yourself to test the full Diamond Muzzle experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Message Preview:</h4>
          <div className="text-sm space-y-2 max-h-48 overflow-y-auto">
            <p><strong>🎉 ברוכים הבאים ל-Diamond Muzzle, חן!</strong></p>
            <p>💎 הצטרפת לפלטפורמת המסחר ביהלומים המתקדמת בעולם!</p>
            <p><strong>🔍 ניטור קבוצות חכם 24/7</strong></p>
            <p>• אנחנו מאזינים לכל קבוצות היהלומים בזמן אמת</p>
            <p><strong>📊 ניהול מלאי מתקדם</strong></p>
            <p>• העלאת יהלומים קלה ומהירה מתעודות GIA</p>
            <p><strong>🤖 בינה מלאכותית מתקדמת</strong></p>
            <p>• צ'אט חכם עם המלאי שלך</p>
            <p><strong>💰 כלי צמיחה עסקית</strong></p>
            <p>• שיתוף מקצועי של יהלומים ברשתות החברתיות</p>
            <p><strong>🌐 קהילה גלובלית</strong></p>
            <p>• חיבור לקונים ברחבי העולם</p>
            <p><strong>⭐ התחל עכשיו ב-3 צעדים פשוטים</strong></p>
            <p>🚀 מוכן לשנות את עסק היהלומים שלך לנצח?</p>
          </div>
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              <strong>4 Interactive Buttons:</strong> העלאה מתעודה | צ'אט עם AI | דשבורד | חנות
            </p>
          </div>
        </div>

        <Button 
          onClick={sendTestComprehensiveMessage}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <Send className="h-4 w-4 mr-2" />
          {isLoading ? 'שולח הודעת בדיקה...' : 'Send Test Comprehensive Message'}
        </Button>
      </CardContent>
    </Card>
  );
}
