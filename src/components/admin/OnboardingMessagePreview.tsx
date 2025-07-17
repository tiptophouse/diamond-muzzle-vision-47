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
  adminTelegramId?: number;
}

export function OnboardingMessagePreview({ sessionUsers, adminTelegramId = 2138564172 }: OnboardingMessagePreviewProps) {
  const { toast } = useToast();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [allRecipients, setAllRecipients] = useState([...sessionUsers]);
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

  const [messageTitle, setMessageTitle] = useState('🚀 הדרכה מיוחדת למערכת ניהול היהלומים - התחל עכשיו!');

  // Add admin to recipients if not already included
  React.useEffect(() => {
    const adminUser = {
      telegram_id: adminTelegramId,
      first_name: 'Admin',
      last_name: '',
      username: 'admin'
    };
    
    const hasAdmin = sessionUsers.some(user => user.telegram_id === adminTelegramId);
    if (!hasAdmin) {
      setAllRecipients([adminUser, ...sessionUsers]);
    } else {
      setAllRecipients(sessionUsers);
    }
  }, [sessionUsers, adminTelegramId]);

  // Generate Telegram mini-app deep link for tutorial
  const generateTutorialUrl = (telegramId: number) => {
    return `https://t.me/DiamondMazalVisionBot/diamond?startapp=tutorial_${telegramId}`;
  };

  const improveMessageWithAI = async () => {
    setIsImproving(true);
    try {
      const sampleUser = allRecipients[0] || { telegram_id: adminTelegramId, first_name: 'משתמש' };
      const firstName = sampleUser.first_name || 'משתמש';
      const tutorialUrl = generateTutorialUrl(sampleUser.telegram_id);

      const response = await supabase.functions.invoke('improve-message', {
        body: {
          userFirstName: firstName,
          baseMessage: messageTemplate,
          tutorialUrl: tutorialUrl
        }
      });

      if (response.error) throw response.error;

      const { improvedMessage } = response.data;
      setMessageTemplate(improvedMessage);
      
      toast({
        title: 'הודעה שופרה בהצלחה!',
        description: 'הודעה נוצרה מחדש באמצעות בינה מלאכותית',
      });
    } catch (error) {
      console.error('Error improving message:', error);
      toast({
        title: 'שגיאה בשיפור ההודעה',
        description: 'לא ניתן לשפר את ההודעה כרגע',
        variant: 'destructive',
      });
    } finally {
      setIsImproving(false);
    }
  };

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
      const notifications = allRecipients.map(user => {
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
            },
            is_admin: user.telegram_id === adminTelegramId
          }
        };
      });

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;

      toast({
        title: 'הודעות נשלחו בהצלחה!',
        description: `נשלחו ${allRecipients.length} הודעות הדרכה (כולל למנהל)`,
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

  const previewUser = allRecipients[0] || { 
    telegram_id: adminTelegramId, 
    first_name: 'Admin', 
    username: 'admin_user' 
  };
  
  const previewMessage = generatePreviewMessage(previewUser);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            הדרכת משתמשים חדשים ({allRecipients.length} משתמשים + מנהל)
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
              onClick={improveMessageWithAI}
              disabled={isImproving}
              variant="secondary"
              className="flex items-center gap-2"
            >
              {isImproving ? '🤖 משפר...' : '🤖 שפר עם AI'}
            </Button>
            
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
              {isSending ? 'שולח...' : `שלח ל-${allRecipients.length} משתמשים`}
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

      {allRecipients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>רשימת משתמשים שיקבלו את ההודעה (כולל מנהל)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-40 overflow-y-auto">
              <div className="grid gap-2">
                {allRecipients.slice(0, 10).map((user, index) => (
                  <div key={user.telegram_id} className="flex items-center gap-2 text-sm">
                    <Badge variant={user.telegram_id === adminTelegramId ? "default" : "outline"}>
                      {user.telegram_id === adminTelegramId ? 'מנהל' : index + 1}
                    </Badge>
                    <span>{user.first_name || user.username || user.telegram_id}</span>
                    <span className="text-muted-foreground">({user.telegram_id})</span>
                  </div>
                ))}
                {allRecipients.length > 10 && (
                  <div className="text-sm text-muted-foreground">
                    ...ועוד {allRecipients.length - 10} משתמשים
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