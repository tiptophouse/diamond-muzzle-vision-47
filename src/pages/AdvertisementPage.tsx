
import React, { useState, useEffect } from 'react';
import { Menu, Diamond, Bot, Layers, Zap, TrendingUp, MessageCircle } from 'lucide-react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Sidebar } from '@/components/advertisement/Sidebar';
import { HeroSection } from '@/components/advertisement/HeroSection';
import { InfoSection } from '@/components/advertisement/InfoSection';
import { FeaturesSection } from '@/components/advertisement/FeaturesSection';
import { HowItWorksSection } from '@/components/advertisement/HowItWorksSection';
import { BenefitsSection } from '@/components/advertisement/BenefitsSection';
import { DemoSection } from '@/components/advertisement/DemoSection';

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
      
      // Use a direct SQL query approach for lead capture
      const { data, error } = await supabase.from('user_profiles').upsert({
        telegram_id: user.id,
        first_name: user.first_name,
        last_name: user.last_name || null,
        username: user.username || null,
        language_code: user.language_code || 'he',
        notes: `Advertisement visit: ${new Date().toISOString()}, UTM: ${utmSource || 'none'}/${utmMedium || 'none'}/${utmCampaign || 'none'}`
      }, {
        onConflict: 'telegram_id'
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
    // Track conversion event using user_analytics table
    if (user) {
      try {
        await supabase.from('user_analytics').upsert({
          telegram_id: user.id,
          api_calls_count: 1,
          total_visits: 1,
          last_active: new Date().toISOString()
        }, {
          onConflict: 'telegram_id'
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

  const scrollToSection = (sectionId: string) => {
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
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sections={sections}
        activeSection={activeSection}
        onScrollToSection={scrollToSection}
        onTryBot={handleTryBot}
        isAuthenticated={isAuthenticated}
        leadCaptured={leadCaptured}
      />

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-6 right-6 z-40 p-3 bg-slate-800/90 backdrop-blur-lg rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Main Content */}
      <div className="relative z-10">
        <HeroSection 
          scrollY={scrollY}
          onTryBot={handleTryBot}
          onScrollToSection={scrollToSection}
          isAuthenticated={isAuthenticated}
          leadCaptured={leadCaptured}
        />
        
        <InfoSection />
        <FeaturesSection />
        <HowItWorksSection />
        <BenefitsSection />
        <DemoSection 
          onTryBot={handleTryBot}
          isAuthenticated={isAuthenticated}
          leadCaptured={leadCaptured}
        />
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
