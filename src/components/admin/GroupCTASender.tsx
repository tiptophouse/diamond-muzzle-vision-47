
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
    message: `🚨 **LIMITED TIME: LIFETIME DISCOUNT!** 🚨

💎 **Only the FIRST 100 uploaders get LIFETIME access for $50 instead of $75!**

⏰ **You have 72 HOURS to secure your spot!**

🎯 **What you get as a LIFETIME member:**
• ✨ Upload unlimited diamonds to BrilliantBot
• 🔍 AI-powered buyer matching system  
• 📊 Real-time market analytics
• 💰 Priority notifications for high-value deals
• 🚀 Early access to ALL future features
• 🎖️ VIP status in the trading community

**Current spots taken: [X]/100** ⚠️

Don't miss out - once we hit 100 uploaders, the price goes back to $75/month!

⚡ **Start uploading NOW and claim your lifetime discount!**`,
    buttonText: '🚀 Get Lifetime Access - $50',
    groupId: '-1001009290613',
    botUsername: 'diamondmazalbot'
  });

  const handleSend = async () => {
    const success = await sendGroupCTA({
      message: formData.message,
      buttonText: formData.buttonText,
      groupId: formData.groupId,
      botUsername: formData.botUsername?.replace('@','')
    });

    if (success) {
      // Keep form data for potential resend
      console.log('✅ Group CTA sent successfully');
    }
  };

  const loadUrgentTemplate = () => {
    setFormData(prev => ({
      ...prev,
      message: `🚨 **⏰ URGENT: 72 HOURS LEFT!** ⏰ 🚨

💎 **LIFETIME DISCOUNT ending soon!**

Only **[X] spots left** out of 100 for the $50 LIFETIME access!

🎯 **This is your LAST CHANCE to get:**
• ✨ Unlimited diamond uploads - FOREVER
• 🤖 AI buyer matching - LIFETIME access  
• 📊 Market insights & analytics - NO monthly fees
• 💰 Priority deal notifications - PERMANENT VIP status
• 🚀 All future features included - NO extra cost

**After 100 uploaders = Price goes to $75/month!**

⚡ **Upload your first diamond NOW to secure your spot!**

Time is running out... Don't pay monthly fees when you can get LIFETIME access for just $50!`,
      buttonText: '🔥 Claim Lifetime $50 Deal'
    }));
  };

  const loadScarcityTemplate = () => {
    setFormData(prev => ({
      ...prev,
      message: `🔥 **SCARCITY ALERT: Only [X] spots remaining!** 🔥

💎 **BrilliantBot LIFETIME access - $50 (was $75)**

⚠️ **First 100 uploaders ONLY - No exceptions!**

What happens when you upload your first diamond:
• 🎖️ INSTANT lifetime membership activation
• 💰 Lock in $50 price FOREVER (others pay $75/month)
• 🚀 Skip all future payment cycles
• ⭐ Permanent VIP status in trading community
• 🔍 Unlimited AI-powered buyer matching
• 📊 Full analytics suite - yours for life

**Current count: [X]/100 spots filled**

Every hour = fewer spots available!
Every new uploader = one less opportunity for you!

⏰ **72 hours countdown has started...**

Don't watch from the sidelines while others secure their lifetime access!`,
      buttonText: '⚡ Upload & Lock $50 Price'
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Send Group Call-to-Action
        </CardTitle>
        <CardDescription>
          Send lifetime discount message to encourage urgency for first 100 uploaders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={loadUrgentTemplate}>
            Load Urgent Template
          </Button>
          <Button variant="outline" size="sm" onClick={loadScarcityTemplate}>
            Load Scarcity Template
          </Button>
        </div>

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
          <Label htmlFor="botUsername">Bot Username</Label>
          <Input
            id="botUsername"
            value={formData.botUsername}
            onChange={(e) => setFormData(prev => ({ ...prev, botUsername: e.target.value.replace('@','') }))}
            placeholder="e.g., diamondmazalbot (without @)"
          />
          <p className="text-xs text-muted-foreground">Will open t.me/{formData.botUsername}?start=group_activation</p>
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
            rows={12}
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
            <p><strong>Bot:</strong> @{formData.botUsername}</p>
            <p><strong>Button:</strong> {formData.buttonText}</p>
            <div className="bg-background p-3 rounded border">
              <pre className="whitespace-pre-wrap text-right text-sm">{formData.message}</pre>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>💡 Pro Tip:</strong> Remember to manually update [X] with the actual number of current uploaders before sending!
          </p>
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
