import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, Mail, Bot, MessageCircle, BarChart3, Eye, FileText, Layers, Diamond, Zap, Users, Target, DollarSign, Shield, Globe, ChevronLeft, Bell, TrendingUp } from 'lucide-react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { SectionTracker } from '@/components/advertisement/SectionTracker';

const AdvertisementPage = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [isCapturingLead, setIsCapturingLead] = useState(false);
  
  const { user, isAuthenticated, isLoading } = useTelegramAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track page visit and capture lead data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && !leadCaptured && !isCapturingLead) {
      captureLead();
    }
  }, [isAuthenticated, user, leadCaptured, isCapturingLead]);

  const captureLead = async () => {
    if (!user || leadCaptured || isCapturingLead) return;
    
    setIsCapturingLead(true);
    
    try {
      // Get URL parameters for tracking
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get('utm_source');
      const utmMedium = urlParams.get('utm_medium');
      const utmCampaign = urlParams.get('utm_campaign');
      
      // Track the lead visit
      const { data, error } = await supabase.rpc('track_advertisement_visit', {
        p_telegram_id: user.id,
        p_first_name: user.first_name,
        p_last_name: user.last_name || null,
        p_username: user.username || null,
        p_language_code: user.language_code || 'he',
        p_user_agent: navigator.userAgent,
        p_referrer: document.referrer || null,
        p_utm_source: utmSource,
        p_utm_medium: utmMedium,
        p_utm_campaign: utmCampaign
      });

      if (error) {
        console.error('Error capturing lead:', error);
      } else {
        setLeadCaptured(true);
        console.log('Lead captured successfully:', data);
        
        toast({
          title: "ברוכים הבאים!",
          description: `שלום ${user.first_name}, אנחנו שמחים לראות אותך כאן!`,
        });
      }
    } catch (error) {
      console.error('Error in captureLead:', error);
    } finally {
      setIsCapturingLead(false);
    }
  };

  const handleTryBot = async () => {
    // Track conversion event
    if (user) {
      try {
        await supabase.from('advertisement_analytics').insert({
          page_path: '/advertisement',
          telegram_id: user.id,
          event_type: 'conversion',
          event_data: { action: 'try_bot_click' }
        });
      } catch (error) {
        console.error('Error tracking conversion:', error);
      }
    }
    
    // Redirect to main app if authenticated, otherwise to bot
    if (isAuthenticated && leadCaptured) {
      navigate('/dashboard');
    } else {
      window.open('https://t.me/diamondmazalbot', '_blank');
    }
  };

  const sections = [
    { id: 'hero', label: 'בית', icon: Diamond },
    { id: 'what-is', label: 'מה זה BrilliantBot', icon: Bot },
    { id: 'features', label: 'יכולות המערכת', icon: Layers },
    { id: 'how-it-works', label: 'איך זה עובד', icon: Zap },
    { id: 'benefits', label: 'היתרונות שלכם', icon: TrendingUp },
    { id: 'demo', label: 'נסו עכשיו', icon: MessageCircle }
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white" dir="rtl">
      {/* Lead Capture Indicator */}
      {isAuthenticated && user && leadCaptured && (
        <div className="fixed top-4 left-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm">מעקב פעיל - {user.first_name}</span>
          </div>
        </div>
      )}

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-80 bg-slate-800/95 backdrop-blur-lg border-l border-slate-700 transform transition-transform duration-300 ease-in-out z-50 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">BrilliantBot</span>
              <Diamond className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <nav className="space-y-2">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-all duration-200 hover:bg-slate-700 group ${
                    activeSection === section.id ? 'bg-blue-600 text-white' : 'text-slate-300'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ChevronLeft className="w-4 h-4 mr-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="font-medium">{section.label}</span>
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </nav>

          {/* Try Bot Button in Sidebar */}
          <div className="mt-8 pt-8 border-t border-slate-700">
            <button 
              onClick={handleTryBot}
              className="w-full flex items-center justify-center space-x-3 space-x-reverse bg-green-600 hover:bg-green-700 rounded-lg py-3 px-4 transition-all duration-300 transform hover:scale-105 font-medium"
            >
              <span>{isAuthenticated && leadCaptured ? 'כניסה למערכת' : 'נסה את הבוט'}</span>
              <Bot className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-6 right-6 z-40 p-3 bg-slate-800/90 backdrop-blur-lg rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Main Content */}
      <div className="relative z-10">
        
        {/* Hero Section */}
        <section id="hero" className="min-h-screen flex items-center justify-center px-6 relative">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-8" style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
              <Diamond className="w-20 h-20 mx-auto mb-6 text-blue-400 animate-pulse" />
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
                BrilliantBot
              </h1>
              <p className="text-xl lg:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                הבוט החכם שמשנה את הדרך שבה אתם מנהלים את עסק היהלומים שלכם
              </p>
              <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
                AI מתקדם, ניהול מלאי אוטומטי ותמחור חכם - הכל בטלגרם
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105">
                <Bot className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-400 mb-2">חכם</h3>
                <p className="text-slate-300">AI מתקדם להמלצות תמחור</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105">
                <Zap className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-blue-400 mb-2">מהיר</h3>
                <p className="text-slate-300">עיבוד מיידי של המלאי</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105">
                <MessageCircle className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-indigo-400 mb-2">נוח</h3>
                <p className="text-slate-300">הכל בטלגרם שאתם כבר מכירים</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleTryBot}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25 flex items-center justify-center space-x-2 space-x-reverse"
              >
                <span>{isAuthenticated && leadCaptured ? 'כניסה למערכת' : 'נסה את הבוט עכשיו'}</span>
                <Bot className="w-5 h-5" />
              </button>
              <button 
                onClick={() => scrollToSection('what-is')}
                className="px-8 py-4 border border-slate-600 rounded-lg font-semibold hover:bg-slate-800 transition-all duration-300 transform hover:scale-105"
              >
                למד עוד
              </button>
            </div>
          </div>
        </section>

        {/* What is BrilliantBot */}
        <SectionTracker sectionId="what-is">
          <section id="what-is" className="py-20 px-6 bg-slate-800/30">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                מה זה BrilliantBot?
              </h2>
              <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                BrilliantBot הוא בוט טלגרם חדשני שמביא את הכוח של AI ישירות לעסק היהלומים שלכם.
                הוא עוזר לכם לנהל את המלאי, לקבל החלטות תמחור חכמות ולשפר את היעילות העסקית - הכל במקום אחד.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105">
                  <BarChart3 className="w-10 h-10 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-blue-400 mb-2">תחזיות חכמות</h3>
                  <p className="text-slate-300">
                    קבלו תחזיות שוק מדויקות והמלצות תמחור מבוססות AI.
                  </p>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105">
                  <Eye className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-indigo-400 mb-2">ניהול מלאי</h3>
                  <p className="text-slate-300">
                    נהלו את המלאי שלכם בקלות, עם עדכונים אוטומטיים ותזכורות חכמות.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </SectionTracker>

        {/* Features Section */}
        <SectionTracker sectionId="features">
          <section id="features" className="py-20 px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                יכולות המערכת
              </h2>
              <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                גלו את הפיצ'רים המתקדמים שהופכים את BrilliantBot לכלי חובה לכל סוחר יהלומים.
              </p>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105">
                  <FileText className="w-10 h-10 text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-green-400 mb-2">דוחות מותאמים</h3>
                  <p className="text-slate-300">
                    צרו דוחות מותאמים אישית על המלאי והמכירות שלכם.
                  </p>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105">
                  <Users className="w-10 h-10 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-blue-400 mb-2">ניהול לקוחות</h3>
                  <p className="text-slate-300">
                    נהלו את הלקוחות שלכם בצורה חכמה ויעילה.
                  </p>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105">
                  <Target className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-indigo-400 mb-2">ניתוח שוק</h3>
                  <p className="text-slate-300">
                    קבלו ניתוח שוק מעמיק על טרנדים ומחירים.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </SectionTracker>

        {/* How it Works */}
        <SectionTracker sectionId="how-it-works">
          <section id="how-it-works" className="py-20 px-6 bg-slate-800/30">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                איך זה עובד?
              </h2>
              <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                הצטרפות ל-BrilliantBot היא פשוטה ומהירה. הנה איך זה עובד:
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center justify-center space-x-4 space-x-reverse">
                  <div className="w-16 h-16 rounded-full bg-blue-500 text-white font-bold text-2xl flex items-center justify-center">1</div>
                  <p className="text-xl text-slate-300">
                    התחילו את הבוט בטלגרם
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-4 space-x-reverse">
                  <div className="w-16 h-16 rounded-full bg-green-500 text-white font-bold text-2xl flex items-center justify-center">2</div>
                  <p className="text-xl text-slate-300">
                    העלו את המלאי שלכם
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-4 space-x-reverse">
                  <div className="w-16 h-16 rounded-full bg-indigo-500 text-white font-bold text-2xl flex items-center justify-center">3</div>
                  <p className="text-xl text-slate-300">
                    קבלו המלצות תמחור חכמות
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-4 space-x-reverse">
                  <div className="w-16 h-16 rounded-full bg-red-500 text-white font-bold text-2xl flex items-center justify-center">4</div>
                  <p className="text-xl text-slate-300">
                    הגדילו את הרווחים שלכם
                  </p>
                </div>
              </div>
            </div>
          </section>
        </SectionTracker>

        {/* Benefits Section */}
        <SectionTracker sectionId="benefits">
          <section id="benefits" className="py-20 px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                היתרונות שלכם
              </h2>
              <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                גלו איך BrilliantBot יכול לשנות את העסק שלכם ולעזור לכם להצליח יותר.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105">
                  <DollarSign className="w-10 h-10 text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-green-400 mb-2">הגדלת רווחים</h3>
                  <p className="text-slate-300">
                    המלצות תמחור חכמות שמגדילות את הרווחים שלכם.
                  </p>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105">
                  <Shield className="w-10 h-10 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-blue-400 mb-2">חיסכון בזמן</h3>
                  <p className="text-slate-300">
                    ניהול מלאי אוטומטי שחוסך לכם זמן יקר.
                  </p>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105">
                  <Globe className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-indigo-400 mb-2">יתרון תחרותי</h3>
                  <p className="text-slate-300">
                    הקדימו את המתחרים עם טכנולוגיית AI מתקדמת.
                  </p>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105">
                  <Bell className="w-10 h-10 text-red-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-red-400 mb-2">התראות חכמות</h3>
                  <p className="text-slate-300">
                    קבלו התראות על שינויים בשוק ובמלאי שלכם.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </SectionTracker>

        {/* Demo Section */}
        <section id="demo" className="py-20 px-6 bg-slate-800/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              מוכנים לנסות?
            </h2>
            
            <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl p-12 border border-blue-500/30">
              <Diamond className="w-16 h-16 text-blue-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-6">
                נסו את BrilliantBot עכשיו - חינם!
              </h3>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                לא צריך להתקין כלום, לא צריך להירשם. פשוט תלחצו על הכפתור ותתחילו לעבוד עם הבוט הכי חכם בתחום היהלומים
              </p>
              
              <button 
                onClick={handleTryBot}
                className="inline-flex items-center justify-center space-x-3 space-x-reverse bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-lg py-4 px-8 text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
              >
                <span>{isAuthenticated && leadCaptured ? 'כניסה למערכת - Diamond Muzzle' : 'התחל עכשיו - @diamondmazalbot'}</span>
                <Bot className="w-6 h-6" />
              </button>
              
              <div className="mt-8 text-slate-400 space-y-2">
                <p>✅ חינם לחלוטין לנסות</p>
                <p>⚡ תוצאות מיידיות</p>
                <p>🔒 מאובטח ופרטי</p>
                <p>🤝 תמיכה מלאה בעברית</p>
                {isAuthenticated && leadCaptured && (
                  <p className="text-green-400 font-semibold">🎯 אתם כבר רשומים - לחצו כניסה למערכת!</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Overlay when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdvertisementPage;
