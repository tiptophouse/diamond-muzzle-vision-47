
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, CreditCard, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const TELEGRAM_IDS = [
  609472329, 15178583, 791559324, 1062521255, 508965243, 158375786, 6485315240, 6875433594, 527244236, 218203458,
  6697534744, 530055516, 620459414, 166061347, 1097027359, 142630057, 1204700374, 1153432900, 341655126, 490399917,
  1051506167, 148784250, 349492743, 1040643119, 222407669, 31938623, 698496583, 2055914362, 248764659, 5670589262,
  598459233, 2042378885, 5557541201, 1131083125, 753576120, 244046790, 1380051637, 8134140802, 599823683, 7401900641,
  2084882603, 110595827, 812263552, 8192050314, 1933311874, 1906438744, 755522510, 7114535390, 191985686, 359846796,
  6070755592, 1413647475, 457543562, 6038418520, 158952076, 426498331, 983864828, 1115142554, 180264348, 8106803900,
  7617460767, 5228664590, 147394250, 576964213, 6117614855, 861112099, 24006307, 372801903, 539575297, 912992717,
  218699046, 2059640197, 889350195, 357027836, 6456020370, 391640724, 37822062, 988214187, 920779513, 2105870530,
  7348943395, 228178905, 37680275, 362740339, 211414349, 564433400, 6553179803, 215251646, 485769560, 5945056045,
  1233299028, 1082904470, 778254227, 772474863, 139767109, 150749399, 354774431, 174305539, 116288602, 893764202,
  219540839, 67414578, 132111356, 223430300, 480899191, 327116018, 214376898, 1303608421, 147125807, 950410006,
  24506066, 5916784425, 7214673736, 1094583058, 7068664648, 226179669, 260897537, 34801683, 223604456, 1869024808,
  596522300, 899120129, 392972183, 259613412, 159643239, 375720105, 396334411, 326460744, 797705717, 193318261,
  363600108, 721049617, 48532850, 478335024, 145234533, 942139538, 6353965694, 361406596, 317301692, 883071696,
  156440200, 1774808969, 673535346, 876635217, 179070619, 1242518755, 340522417, 13205565, 185073575, 180279556,
  291063886, 36401094, 203555051, 626738587, 342034296, 275521421, 514441235, 198254991, 666204990, 219981455,
  819441864, 174230606, 144107849, 223400025, 215605918, 5414385806, 229481745, 614152547, 715939343, 1654722694,
  195462713, 1495302618, 167807604, 238678949, 498165789, 6255380820, 372093437, 192832760, 5843612773, 273144683,
  500694478, 1324941024, 220041060, 527549241, 5232669093, 217495641, 868350884, 31007082, 6060737011, 21445196,
  838928352, 351639373, 863429324, 2131777992, 244777394, 351937475, 48790670, 1038436840, 128158315, 43528055,
  756880916, 253515502, 1016203357, 536135262, 816684685, 750731120, 218887020, 430947198, 856471964, 1021878792,
  599440471, 5957031168, 686172895, 1383612425, 6164830420, 431439127, 6333475728, 354242555, 722375498, 893685764,
  7158990391, 161389691, 66858946, 987177126, 5145559049, 680978787, 5216909800, 913039506, 7088590441, 476162733,
  36895987, 143021530, 5378954002, 40636799, 292371131, 24145161, 361424630, 180031600, 1043946698, 1139412996,
  275051488, 59346360, 393850024, 131112573, 166920035, 1314637801, 376677644, 247961355, 6117319574, 111343557,
  681195276, 7910524332, 225517457, 310079671, 407257458, 236862177, 762539548, 283750036, 655107366, 958179669,
  526549518, 1131026884, 31029285, 724658841, 6259572742, 372043415, 8089376016, 134184387, 538414092, 300551886,
  108603060, 1785583917, 180912074, 25496794, 459466461, 275538441, 503133960, 155439098, 73821624, 868507570,
  246119595, 272028513, 7755898190, 351945363, 405126848, 5636418509, 279576287, 173056785, 292409495, 268265395,
  352720782, 815157948, 576557724, 1199689099, 1000167564, 301755528, 6301609905, 1128966406, 1586162788, 414710632,
  27197168, 202988534, 53326537, 1463964121, 553327837, 201323236, 530369631, 25801187, 5557156231, 360511555,
  897289431, 773880190, 197874232, 351591647, 5864205153, 315642972, 1782764973, 6106407109, 862939152, 732667018,
  44373775, 297491183, 271278192, 2007687833, 6275131630, 870104897, 196749720, 7881709347, 7661396252, 1397126724,
  7541565132, 95468032, 770694034, 254689339, 519165300, 599801379, 891993653, 7533014274, 228735092, 189127112,
  608907728, 408579959, 49263338, 1149359225, 6784753522, 250490432, 1288764521, 743362945, 185749842, 5638216124,
  380334503, 293140098, 182399779, 1166327809, 7411659371, 5062647250, 220313589, 271885188, 8095648501, 392156263,
  565348343, 540272208, 182659683, 5027340105, 239800635, 291619823, 586717192, 367704266, 1140753700, 756429169,
  1323628656, 201954925, 1422176468, 702499311, 412088175, 229132593, 281054717, 5912544426, 967202074, 1654732642,
  299303085, 323904891, 182539415, 6663143158, 853021561, 6328816442, 7548360965, 130306128, 905568693, 305013588,
  6290624660, 630629576, 985105194, 180153788, 189792941, 145211528, 8021985508, 5031742883, 1251910836, 720434551,
  2138564172, 1223721085, 278222841, 748982725, 313901349, 426092206, 569502840, 454130538, 1098392267, 177276150,
  112422138, 250702918, 207389222, 40125775, 6273442113, 5027225969, 301671365, 529104055, 5929485948, 1203108242,
  34370462, 535277619, 179494604, 8134032774, 593559378, 220093533, 954244806, 298175272, 294361563, 231990028,
  86406741, 1190576324
];

const BATCH_SIZE = 100; // Declare batch size constant

interface ProcessingStats {
  totalUsers: number;
  existingProfiles: number;
  newProfiles: number;
  existingSubscriptions: number;
  newSubscriptions: number;
  errors: number;
}

export function BulkSubscriptionManager({ onComplete }: { onComplete?: () => void }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState<ProcessingStats | null>(null);
  const [currentStep, setCurrentStep] = useState('');
  const { toast } = useToast();

  const processSubscriptions = async () => {
    setIsProcessing(true);
    setStats(null);
    setCurrentStep('Initializing...');

    try {
      console.log(`🚀 Starting bulk subscription processing for ${TELEGRAM_IDS.length} users...`);

      // Initialize stats
      const processingStats: ProcessingStats = {
        totalUsers: TELEGRAM_IDS.length,
        existingProfiles: 0,
        newProfiles: 0,
        existingSubscriptions: 0,
        newSubscriptions: 0,
        errors: 0
      };

      // Step 1: Check existing user profiles
      setCurrentStep('Checking existing user profiles...');
      const { data: existingProfiles } = await supabase
        .from('user_profiles')
        .select('telegram_id')
        .in('telegram_id', TELEGRAM_IDS);

      const existingProfileIds = new Set(existingProfiles?.map(u => u.telegram_id) || []);
      const newUserIds = TELEGRAM_IDS.filter(id => !existingProfileIds.has(id));
      
      processingStats.existingProfiles = existingProfileIds.size;
      processingStats.newProfiles = newUserIds.length;
      
      console.log(`📊 Found ${processingStats.existingProfiles} existing profiles, ${processingStats.newProfiles} new users to add`);

      // Step 2: Create missing user profiles
      if (newUserIds.length > 0) {
        setCurrentStep(`Creating ${newUserIds.length} new user profiles...`);
        
        const userProfiles = newUserIds.map(telegramId => ({
          telegram_id: telegramId,
          first_name: 'Premium',
          last_name: `Client ${telegramId}`,
          username: null,
          phone_number: null,
          is_premium: true,
          status: 'active',
          subscription_plan: 'premium',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        // Insert profiles in batches
        for (let i = 0; i < userProfiles.length; i += BATCH_SIZE) {
          const batch = userProfiles.slice(i, i + BATCH_SIZE);
          
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert(batch);

          if (profileError) {
            console.error('Error inserting profile batch:', profileError);
            processingStats.errors += batch.length;
          } else {
            console.log(`✅ Created profile batch: ${i + batch.length}/${userProfiles.length}`);
          }
        }
      }

      // Step 3: Check existing subscriptions
      setCurrentStep('Checking existing subscriptions...');
      const { data: existingSubscriptions } = await supabase
        .from('subscriptions')
        .select('telegram_id')
        .in('telegram_id', TELEGRAM_IDS)
        .eq('status', 'active');

      const existingSubscriptionIds = new Set(existingSubscriptions?.map(s => s.telegram_id) || []);
      const newSubscriptionIds = TELEGRAM_IDS.filter(id => !existingSubscriptionIds.has(id));
      
      processingStats.existingSubscriptions = existingSubscriptionIds.size;
      processingStats.newSubscriptions = newSubscriptionIds.length;

      console.log(`💳 Found ${processingStats.existingSubscriptions} existing subscriptions, ${processingStats.newSubscriptions} new subscriptions to create`);

      // Step 4: Create missing subscriptions
      if (newSubscriptionIds.length > 0) {
        setCurrentStep(`Creating ${newSubscriptionIds.length} new subscriptions...`);
        
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        
        const subscriptionData = newSubscriptionIds.map(telegramId => ({
          telegram_id: telegramId,
          plan_name: 'Premium Diamond Trading',
          status: 'active',
          amount: 75,
          currency: 'USD',
          billing_cycle: 'monthly',
          start_date: new Date().toISOString(),
          end_date: oneYearFromNow.toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        // Insert subscriptions in batches
        for (let i = 0; i < subscriptionData.length; i += BATCH_SIZE) {
          const batch = subscriptionData.slice(i, i + BATCH_SIZE);
          
          const { error: subscriptionError } = await supabase
            .from('subscriptions')
            .insert(batch);

          if (subscriptionError) {
            console.error('Error inserting subscription batch:', subscriptionError);
            processingStats.errors += batch.length;
          } else {
            console.log(`✅ Created subscription batch: ${i + batch.length}/${subscriptionData.length}`);
          }
        }
      }

      // Step 5: Create analytics for all users
      setCurrentStep('Setting up user analytics...');
      const analyticsData = TELEGRAM_IDS.map(telegramId => ({
        telegram_id: telegramId,
        total_visits: 1,
        api_calls_count: 0,
        storage_used_mb: 0,
        cost_per_user: 0,
        revenue_per_user: 75,
        profit_loss: 75,
        lifetime_value: 75,
        subscription_status: 'premium',
        last_active: new Date().toISOString(),
        total_time_spent: '00:00:00'
      }));

      // Insert analytics in batches (ignore conflicts for existing users)
      for (let i = 0; i < analyticsData.length; i += BATCH_SIZE) {
        const batch = analyticsData.slice(i, i + BATCH_SIZE);
        
        const { error: analyticsError } = await supabase
          .from('user_analytics')
          .upsert(batch, { onConflict: 'telegram_id' });

        if (analyticsError) {
          console.warn('Error upserting analytics batch:', analyticsError);
        }
      }

      setStats(processingStats);
      setCurrentStep('✅ Processing complete!');

      console.log(`🎉 Bulk subscription processing completed!`, processingStats);

      toast({
        title: "✅ Bulk Subscriptions Created Successfully!",
        description: `Processed ${TELEGRAM_IDS.length} users: ${processingStats.newProfiles} new profiles, ${processingStats.newSubscriptions} new subscriptions`,
      });

      onComplete?.();

    } catch (error: any) {
      console.error('❌ Error in bulk subscription processing:', error);
      setCurrentStep('❌ Error occurred during processing');
      toast({
        title: "❌ Processing Failed",
        description: error.message || "An error occurred during bulk subscription processing",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          ניהול מנויים בכמות - Bulk Subscription Manager
        </CardTitle>
        <CardDescription>
          רישום {TELEGRAM_IDS.length} לקוחות כמנויי פרמיום פעילים
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-800">תוכנית העבודה:</span>
          </div>
          <ul className="text-sm space-y-1 text-blue-700">
            <li>• בדיקת {TELEGRAM_IDS.length} Telegram IDs</li>
            <li>• יצירת פרופילי משתמש חסרים</li>
            <li>• יצירת מנויי פרמיום פעילים לכל המשתמשים</li>
            <li>• הגדרת אנליטיקה למשתמשים</li>
            <li>• מחיר מנוי: $75/חודש לכל משתמש</li>
          </ul>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalUsers}</div>
              <div className="text-sm text-green-700">סה"כ משתמשים</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.newProfiles}</div>
              <div className="text-sm text-blue-700">פרופילים חדשים</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.newSubscriptions}</div>
              <div className="text-sm text-purple-700">מנויים חדשים</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.existingProfiles}</div>
              <div className="text-sm text-orange-700">פרופילים קיימים</div>
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-indigo-600">{stats.existingSubscriptions}</div>
              <div className="text-sm text-indigo-700">מנויים קיימים</div>
            </div>
            {stats.errors > 0 && (
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
                <div className="text-sm text-red-700">שגיאות</div>
              </div>
            )}
          </div>
        )}

        {isProcessing && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />
              <div>
                <div className="font-medium text-yellow-800">מעבד נתונים...</div>
                <div className="text-sm text-yellow-600">{currentStep}</div>
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={processSubscriptions} 
          disabled={isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              מעבד {TELEGRAM_IDS.length} משתמשים...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              רישום {TELEGRAM_IDS.length} לקוחות כמנויי פרמיום
            </>
          )}
        </Button>

        {stats && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">העיבוד הושלם בהצלחה!</span>
            </div>
            <div className="text-sm text-green-700 mt-2">
              כעת תוכל לשלוח הודעות לכל {stats.totalUsers} הלקוחות הפעילים
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
