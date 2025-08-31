
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, Users, Clock, CheckCircle, AlertCircle, Pause, Play } from 'lucide-react';

interface User {
  telegram_id: number;
  first_name: string;
  last_name?: string;
}

export function IndividualMessageSender() {
  const { toast } = useToast();
  const [message, setMessage] = useState(`🚀 משהו גדול קורה אצלנו! 💎

ב־90 הימים האחרונים:
👥 1,100 כניסות
📈 8,900 צפיות
⏱️ 7:27 דקות בממוצע כל ביקור

אבל שים לב 👉 מתוך כל זה רק 127 יהלומנים רשומים!

❓ איפה אתם?
מי שלא בפנים – מפספס עכשיו את הגל הראשון של הסוחרים שמקבלים גישה למערכת.
🔥 ברגע שנגיע ל־150 נועלים את ההטבה המוקדמת – ומשם המחיר קופץ.

⏳ זה הזמן להירשם – אחרת תישארו מאחור.`);
  
  const [batchSize, setBatchSize] = useState(5);
  const [delayBetweenMessages, setDelayBetweenMessages] = useState(2000); // 2 seconds
  const [delayBetweenBatches, setDelayBetweenBatches] = useState(30000); // 30 seconds
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('telegram_id, first_name, last_name')
        .neq('telegram_id', 2138564172) // Exclude admin
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
      const batches = Math.ceil((data?.length || 0) / batchSize);
      setTotalBatches(batches);
      
      toast({
        title: "משתמשים נטענו",
        description: `נמצאו ${data?.length || 0} משתמשים (${batches} קבוצות)`,
      });
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "שגיאה",
        description: "נכשל בטעינת המשתמשים",
        variant: "destructive",
      });
    }
  };

  const sendBatchedMessages = async () => {
    if (!message.trim() || users.length === 0) {
      toast({
        title: "שגיאה",
        description: "נא להזין הודעה ולטעון משתמשים",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setIsPaused(false);
    setProgress(0);
    setCurrentBatch(0);
    setSuccessCount(0);
    setErrorCount(0);
    setErrors([]);

    try {
      const batches = [];
      for (let i = 0; i < users.length; i += batchSize) {
        batches.push(users.slice(i, i + batchSize));
      }

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        if (isPaused) break;

        setCurrentBatch(batchIndex + 1);
        const batch = batches[batchIndex];

        // Send messages in this batch with individual delays
        for (const user of batch) {
          if (isPaused) break;

          try {
            const personalizedMessage = `שלום ${user.first_name || 'משתמש יקר'},\n\n${message}`;
            
            const { data, error } = await supabase.functions.invoke('send-individual-message', {
              body: {
                telegramId: user.telegram_id,
                message: personalizedMessage,
                buttons: [
                  {
                    text: '🚀 הצטרפו לדשבורד',
                    url: 'https://t.me/diamondmazalbot?startapp=profile'
                  },
                  {
                    text: '👤 פרופיל אישי',
                    url: 'https://t.me/diamondmazalbot?profile'
                  },
                  {
                    text: '📅 קביעת פגישה',
                    url: 'https://calendly.com/avtipoos'
                  }
                ]
              }
            });

            if (error) {
              console.error(`Error sending to ${user.telegram_id}:`, error);
              setErrorCount(prev => prev + 1);
              setErrors(prev => [...prev, `${user.first_name}: ${error.message}`]);
            } else {
              setSuccessCount(prev => prev + 1);
              console.log(`✅ Message sent to ${user.first_name} (${user.telegram_id})`);
            }

            // Update progress
            const totalSent = batchIndex * batchSize + batch.indexOf(user) + 1;
            setProgress((totalSent / users.length) * 100);

            // Delay between individual messages within batch
            if (batch.indexOf(user) < batch.length - 1) {
              await new Promise(resolve => setTimeout(resolve, delayBetweenMessages));
            }
          } catch (error: any) {
            console.error(`Error sending to ${user.telegram_id}:`, error);
            setErrorCount(prev => prev + 1);
            setErrors(prev => [...prev, `${user.first_name}: ${error.message}`]);
          }
        }

        // Delay between batches (except for the last batch)
        if (batchIndex < batches.length - 1 && !isPaused) {
          console.log(`⏱️ Waiting ${delayBetweenBatches / 1000} seconds before next batch...`);
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }
      }

      if (!isPaused) {
        toast({
          title: "השליחה הושלמה! 🎉",
          description: `נשלח ל-${successCount} משתמשים, ${errorCount} נכשלו`,
        });
      }
    } catch (error: any) {
      console.error('Error in batch sending:', error);
      toast({
        title: "שגיאה בשליחה",
        description: error.message || "נכשל בשליחת ההודעות",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsPaused(false);
    }
  };

  const pauseResumeProcess = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      toast({
        title: "תהליך הושהה",
        description: "השליחה הושהתה זמנית",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            שלח הודעות אישיות חכם (עם קצב מוגבל)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Batch Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">הודעות בקבוצה</label>
              <Input
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="10"
              />
              <p className="text-xs text-muted-foreground mt-1">מומלץ: 3-5</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">זמן בין הודעות (שניות)</label>
              <Input
                type="number"
                value={delayBetweenMessages / 1000}
                onChange={(e) => setDelayBetweenMessages((parseInt(e.target.value) || 2) * 1000)}
                min="1"
                max="10"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">זמן בין קבוצות (שניות)</label>
              <Input
                type="number"
                value={delayBetweenBatches / 1000}
                onChange={(e) => setDelayBetweenBatches((parseInt(e.target.value) || 30) * 1000)}
                min="10"
                max="120"
              />
            </div>
          </div>

          {/* Message Content */}
          <div>
            <label className="text-sm font-medium mb-2 block">תוכן ההודעה</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={12}
              className="font-mono text-sm"
              dir="rtl"
            />
            <p className="text-xs text-muted-foreground mt-1">
              ההודעה תשלח עם שם המשתמש האישי בתחילת ההודעה
            </p>
          </div>

          {/* Inline Buttons Preview */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">כפתורים שיישלחו:</h4>
            <div className="space-y-2">
              <Badge variant="outline">🚀 הצטרפו לדשבורד</Badge>
              <Badge variant="outline">👤 פרופיל אישי</Badge>
              <Badge variant="outline">📅 קביעת פגישה</Badge>
            </div>
          </div>

          {/* User Management */}
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="outline" className="mr-2">
                <Users className="h-3 w-3 mr-1" />
                {users.length} משתמשים
              </Badge>
              {totalBatches > 0 && (
                <Badge variant="secondary">
                  {totalBatches} קבוצות
                </Badge>
              )}
            </div>
            <Button onClick={fetchUsers} variant="outline" size="sm">
              טען משתמשים
            </Button>
          </div>

          {/* Progress Section */}
          {isLoading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">התקדמות שליחה</span>
                <span className="text-sm">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>קבוצה {currentBatch} מתוך {totalBatches}</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {successCount} הצליח
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    {errorCount} נכשל
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={sendBatchedMessages} 
              disabled={isLoading || users.length === 0 || !message.trim()}
              className="flex-1"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  שולח ל-{users.length} משתמשים...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  שלח ל-{users.length} משתמשים
                </>
              )}
            </Button>
            
            {isLoading && (
              <Button onClick={pauseResumeProcess} variant="outline">
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
            )}
          </div>

          {/* Errors Display */}
          {errors.length > 0 && (
            <div className="bg-destructive/10 p-4 rounded-lg">
              <h4 className="font-semibold text-destructive mb-2">שגיאות ({errors.length}):</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {errors.slice(0, 10).map((error, index) => (
                  <p key={index} className="text-sm text-destructive">{error}</p>
                ))}
                {errors.length > 10 && (
                  <p className="text-sm text-muted-foreground">...ועוד {errors.length - 10} שגיאות</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
