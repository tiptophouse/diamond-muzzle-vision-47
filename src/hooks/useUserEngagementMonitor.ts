import { useEffect } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

export function useUserEngagementMonitor() {
  const { user } = useTelegramAuth();

  useEffect(() => {
    if (!user?.id) return;

    // Track user activity for engagement monitoring
    const trackUserActivity = () => {
      const activityData = {
        telegram_id: user.id,
        page_url: window.location.pathname,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        has_inventory: false // This would be determined by actual inventory check
      };

      // Store activity locally for potential batch upload
      const existingActivity = JSON.parse(localStorage.getItem('user_activity') || '[]');
      existingActivity.push(activityData);
      
      // Keep only last 10 activities
      if (existingActivity.length > 10) {
        existingActivity.splice(0, existingActivity.length - 10);
      }
      
      localStorage.setItem('user_activity', JSON.stringify(existingActivity));
    };

    // Track initial page load
    trackUserActivity();

    // Track page changes
    const handlePageChange = () => {
      trackUserActivity();
    };

    // Track when user becomes inactive (for engagement scoring)
    let inactivityTimer: NodeJS.Timeout;
    
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        console.log('📊 User became inactive - potential engagement trigger');
      }, 5 * 60 * 1000); // 5 minutes of inactivity
    };

    // Track user interactions
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true);
    });

    // Listen for route changes
    window.addEventListener('popstate', handlePageChange);

    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer, true);
      });
      window.removeEventListener('popstate', handlePageChange);
    };
  }, [user]);

  // Function to manually trigger engagement check (can be called from components)
  const triggerEngagementCheck = async () => {
    if (!user?.id) return;

    try {
      console.log('🔍 Triggering user engagement check...');
      
      const response = await fetch('https://uhhljqgxhdhbbhpohxll.supabase.co/functions/v1/user-engagement-monitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          check_type: 'manual'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Engagement check completed:', result);
      }
    } catch (error) {
      console.error('❌ Engagement check failed:', error);
    }
  };

  return {
    triggerEngagementCheck
  };
}
