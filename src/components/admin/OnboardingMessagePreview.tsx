import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Eye, Send, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateTutorialUrl } from '../tutorial/enhancedTutorialSteps';

interface OnboardingMessagePreviewProps {
  sessionUsers: Array<{
    telegram_id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
  }>;
}

export function OnboardingMessagePreview({ sessionUsers }: OnboardingMessagePreviewProps) {
  const { toast } = useToast();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [messageTemplate, setMessageTemplate] = useState(`🎉 ברוכים הבאים למערכת ניהול היהלומים החדשנית!

👋 שלום {firstName}!

אנחנו שמחים שהצטרפת אלינו! כדי שתוכל להתחיל להשתמש במערכת בצורה הטובה ביותר, הכנו עבורך הדרכה מפורטת שתלמד אותך איך:

💎 לסרוק תעודות יהלומים
📊 לנהל את המלאי שלך
🏪 לראות את היהלומים בחנות הווירטואלית
📈 לעקוב אחר הסטטיסטיקות שלך

ההדרכה לוקחת רק כמה דקות ותעזור לך להתחיל מיד!

👆 לחץ על הקישור כדי להתחיל:
{tutorialUrl}

בהצלחה!
צוות ניהול היהלומים`);

  const [messageTitle, setMessageTitle] = useState('הדרכת שימוש במערכת - התחל עכשיו!');

  const generatePreviewMessage = (user: any) => {
    const tutorialUrl = generateTutorialUrl(user.telegram_id);
    const firstName = user.first_name || user.username || 'משתמש';
    
    return {
      title: messageTitle,
      content: messageTemplate
        .replace('{firstName}', firstName)
        .replace('{tutorialUrl}', tutorialUrl)
    };
  };

  const handleSendToAll = async () => {
    setIsSending(true);
    try {
      const notifications = sessionUsers.map(user => {
        const preview = generatePreviewMessage(user);
        return {
          telegram_id: user.telegram_id,
          message_type: 'tutorial_onboarding',
          message_content: preview.content,
          status: 'sent',
          metadata: {
            title: preview.title,
            tutorial_url: generateTutorialUrl(user.telegram_id),
            user_info: {
              first_name: user.first_name,
              last_name: user.last_name,
              username: user.username
            }
          }
        };
      });

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;

      toast({
        title: 'הודעות נשלחו בהצלחה!',
        description: `נשלחו ${sessionUsers.length} הודעות הדרכה למשתמשים`,
      });

      setIsPreviewMode(false);
    } catch (error) {
      console.error('Error sending notifications:', error);
      toast({
        title: 'שגיאה בשליחת ההודעות',
        description: 'אנא נסה שוב',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const previewUser = sessionUsers[0] || { 
    telegram_id: 123456789, 
    first_name: 'דוגמה', 
    username: 'example_user' 
  };
  
  const previewMessage = generatePreviewMessage(previewUser);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            הדרכת משתמשים חדשים ({sessionUsers.length} משתמשים)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="messageTitle">כותרת ההודעה</Label>
              <Input
                id="messageTitle"
                value={messageTitle}
                onChange={(e) => setMessageTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="messageTemplate">תבנית ההודעה</Label>
              <Textarea
                id="messageTemplate"
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                rows={12}
                className="mt-1 font-mono text-sm"
                placeholder="השתמש ב-{firstName} עבור שם המשתמש ו-{tutorialUrl} עבור קישור ההדרכה"
              />
              <p className="text-sm text-muted-foreground mt-1">
                משתנים זמינים: {'{firstName}'}, {'{tutorialUrl}'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {isPreviewMode ? 'עריכה' : 'תצוגה מקדימה'}
            </Button>
            
            <Button
              onClick={handleSendToAll}
              disabled={isSending || !messageTemplate.trim()}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {isSending ? 'שולח...' : `שלח ל-${sessionUsers.length} משתמשים`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isPreviewMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              תצוגה מקדימה של ההודעה
              <Badge variant="secondary">דוגמה</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="font-semibold text-lg border-b pb-2">
                {previewMessage.title}
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {previewMessage.content}
              </div>
              <div className="text-xs text-muted-foreground pt-2 border-t">
                משתמש לדוגמה: {previewUser.first_name || previewUser.username}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {sessionUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>רשימת משתמשים שיקבלו את ההודעה</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-40 overflow-y-auto">
              <div className="grid gap-2">
                {sessionUsers.slice(0, 10).map((user, index) => (
                  <div key={user.telegram_id} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">{index + 1}</Badge>
                    <span>{user.first_name || user.username || user.telegram_id}</span>
                    <span className="text-muted-foreground">({user.telegram_id})</span>
                  </div>
                ))}
                {sessionUsers.length > 10 && (
                  <div className="text-sm text-muted-foreground">
                    ...ועוד {sessionUsers.length - 10} משתמשים
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}