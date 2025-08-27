
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGroupCTA } from '@/hooks/useGroupCTA';
import { Send, Users, TrendingUp } from 'lucide-react';

export function GroupCTASender({ onSendNotification }: { onSendNotification?: (notification: any) => void }) {
  const [message, setMessage] = useState('');
  const [groupId, setGroupId] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonUrl, setButtonUrl] = useState('');
  const { sendGroupCTA, isLoading } = useGroupCTA();

  // Default growth message in Hebrew
  const growthMessage = `🎉 אנחנו גדלים! 🎉

המערכת שלנו כבר מונה יותר מ-400 משתמשים פעילים! 💎

תודה לכל אחד מכם שתורם לקהילה הזו ועוזר לנו לצמוח.

כל יום אנחנו רואים עוד ועוד סוחרי יהלומים מצטרפים אלינו ומשתמשים במערכת החדשנית שלנו.

המטרה שלנו - להפוך את המסחר ביהלומים לקל, מהיר ומקצועי יותר מאי פעם! 🚀

#יהלומים #סחר #קהילה #צמיחה`;

  const handleSend = async () => {
    if (!message.trim() || !groupId.trim()) return;

    try {
      await sendGroupCTA({
        groupId: groupId,
        message: message,
        buttonText: buttonText || undefined,
        buttonUrl: buttonUrl || undefined,
        withButtons: !!(buttonText && buttonUrl)
      });

      // Clear form
      setMessage('');
      setGroupId('');
      setButtonText('');
      setButtonUrl('');

      onSendNotification?.({
        type: 'group_cta',
        message,
        groupId,
        buttonText,
        buttonUrl
      });
    } catch (error) {
      console.error('Failed to send group CTA:', error);
    }
  };

  const handleSendGrowthAnnouncement = async () => {
    if (!groupId.trim()) return;

    try {
      await sendGroupCTA({
        groupId: groupId,
        message: growthMessage,
        withButtons: false
      });

      onSendNotification?.({
        type: 'growth_announcement',
        message: growthMessage,
        groupId
      });
    } catch (error) {
      console.error('Failed to send growth announcement:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            שליחת הודעה לקבוצה
          </CardTitle>
          <CardDescription>
            שלח הודעות והכרזות לקבוצות טלגרם
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="groupId">Group ID</Label>
            <Input
              id="groupId"
              placeholder="הכנס Group ID (לדוגמה: -1001234567890)"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="message">תוכן ההודעה</Label>
            <Textarea
              id="message"
              placeholder="כתוב את ההודעה כאן..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="buttonText">טקסט הכפתור (אופציונלי)</Label>
              <Input
                id="buttonText"
                placeholder="לדוגמה: הצטרף עכשיו"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="buttonUrl">קישור הכפתור (אופציונלי)</Label>
              <Input
                id="buttonUrl"
                placeholder="https://..."
                value={buttonUrl}
                onChange={(e) => setButtonUrl(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={handleSend} 
            disabled={isLoading || !message.trim() || !groupId.trim()}
            className="w-full"
          >
            <Send className="mr-2 h-4 w-4" />
            שלח הודעה
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            הכרזת צמיחה - 400+ משתמשים
          </CardTitle>
          <CardDescription>
            שלח הכרזה מוכנה על הצמיחה של הקהילה
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm whitespace-pre-line">{growthMessage}</p>
          </div>
          
          <Button 
            onClick={handleSendGrowthAnnouncement} 
            disabled={isLoading || !groupId.trim()}
            className="w-full"
            variant="secondary"
          >
            <Users className="mr-2 h-4 w-4" />
            שלח הכרזת צמיחה (ללא כפתורים)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
