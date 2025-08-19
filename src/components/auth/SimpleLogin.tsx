
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SimpleLoginProps {
  onLogin: () => void;
}

export function SimpleLogin({ onLogin }: SimpleLoginProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTelegramEnvironment, setIsTelegramEnvironment] = useState(false);
  const { toast } = useToast();

  // Check if we're in Telegram environment
  useEffect(() => {
    const inTelegram = typeof window !== 'undefined' && 
      !!window.Telegram?.WebApp && 
      typeof window.Telegram.WebApp === 'object';
    
    setIsTelegramEnvironment(inTelegram);
    
    // If we're in Telegram, try to auto-authenticate
    if (inTelegram) {
      console.log('🔍 Telegram environment detected, attempting auto-login');
      // Give the parent auth system time to process Telegram data
      setTimeout(() => {
        const tg = window.Telegram?.WebApp;
        if (tg?.initDataUnsafe?.user || tg?.initData) {
          console.log('✅ Telegram user data found, triggering auto-login');
          onLogin();
        }
      }, 1000);
    }
  }, [onLogin]);

  const handleSendOTP = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.functions.invoke('send-otp-email', {
        body: { email }
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to send OTP",
          variant: "destructive"
        });
      } else {
        toast({
          title: "OTP Sent",
          description: "Check your email for the OTP code",
        });
        onLogin();
      }
    } catch (error) {
      console.error('OTP send error:', error);
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show login form if we're in Telegram - show loading instead
  if (isTelegramEnvironment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            {/* Logo */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">BrilliantBot</h1>
            <p className="text-gray-600 mb-8">Authenticating via Telegram...</p>
            
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          {/* Logo */}
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">BrilliantBot</h1>
          <p className="text-gray-600 mb-8">Secure Admin Authentication</p>
          
          {/* Email Input */}
          <div className="space-y-6">
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your authorized email"
                  className="pl-10 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendOTP()}
                />
              </div>
            </div>
            
            <Button 
              onClick={handleSendOTP}
              disabled={isLoading || !email}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base rounded-xl transition-colors"
            >
              {isLoading ? 'Sending...' : 'Send Secure OTP'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
