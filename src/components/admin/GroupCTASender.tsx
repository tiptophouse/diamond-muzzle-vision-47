import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send, Users, MessageSquare, Loader2 } from 'lucide-react';
import { useGroupCTA } from '@/hooks/useGroupCTA';

export function GroupCTASender() {
  const { sendGroupCTA, isLoading } = useGroupCTA();
  
  const [formData, setFormData] = useState({
    message: `💎 **שדרגו את הפעילות שלכם ביהלומים!**

🤖 BrilliantBot כאן כדי לעזור לכם:
• ✨ התאמות חכמות של יהלומים
• 📊 ניתוחי שוק בזמן אמת  
• 🔍 חיפוש מתקדם במלאי
• 💰 הזדמנויות השקעה

⚡ **התחילו עכשיו - לחצו על הכפתור למטה!**`,
    buttonText: '🚀 התחל עם BrilliantBot',
    groupId: '-1001009290613'
  });

  const handleSend = async () => {
    const success = await sendGroupCTA({
      message: formData.message,
      buttonText: formData.buttonText,
      groupId: formData.groupId
    });

    if (success) {
      // Keep form data for potential resend
      console.log('✅ Group CTA sent successfully');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Send Group Call-to-Action
        </CardTitle>
        <CardDescription>
          Send an inline keyboard message to encourage users to start the bot
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="groupId">Group ID</Label>
          <Input
            id="groupId"
            value={formData.groupId}
            onChange={(e) => setFormData(prev => ({ ...prev, groupId: e.target.value }))}
            placeholder="Enter group ID (e.g., -1001009290613)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="buttonText">Button Text</Label>
          <Input
            id="buttonText"
            value={formData.buttonText}
            onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
            placeholder="Text for the button"
            maxLength={64}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Enter your call-to-action message"
            rows={8}
            maxLength={2000}
            dir="rtl"
            className="text-right"
          />
          <p className="text-xs text-gray-500">{formData.message.length}/2000 characters</p>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Preview:</h4>
          <div className="text-sm space-y-2">
            <p><strong>Group ID:</strong> {formData.groupId}</p>
            <p><strong>Button:</strong> {formData.buttonText}</p>
            <div className="bg-background p-3 rounded border">
              <pre className="whitespace-pre-wrap text-right text-sm">{formData.message}</pre>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !formData.groupId || !formData.message}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send to Group
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
