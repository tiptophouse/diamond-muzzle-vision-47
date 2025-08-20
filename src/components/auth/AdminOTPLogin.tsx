
import { useState } from 'react';
import { Shield, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdminOTPLoginProps {
  onSuccess: (sessionToken: string, expiresAt: string) => void;
}

export function AdminOTPLogin({ onSuccess }: AdminOTPLoginProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendOTP = async () => {
    if (!email) return;

    setIsLoading(true);
    try {
      console.log('🔐 Requesting OTP for email:', email);
      
      const { data, error } = await supabase.functions.invoke('send-admin-otp', {
        body: { email }
      });

      if (error) throw error;

      if (data.success) {
        setStep('otp');
        toast({
          title: "OTP Sent",
          description: "Check your Telegram for the 6-digit code",
        });
      } else {
        throw new Error(data.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('❌ Error sending OTP:', error);
      toast({
        title: "Access Denied",
        description: "Unauthorized access attempt",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔐 Verifying OTP:', otp);
      
      const { data, error } = await supabase.functions.invoke('verify-admin-otp', {
        body: { email, otp }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Access Granted",
          description: "Welcome to admin panel",
        });
        onSuccess(data.sessionToken, data.expiresAt);
      } else {
        throw new Error(data.error || 'Invalid OTP');
      }
    } catch (error) {
      console.error('❌ Error verifying OTP:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired OTP",
        variant: "destructive",
      });
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' && !isLoading) {
      action();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full border">
        <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <Shield className="h-10 w-10 text-red-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Admin Access Required
        </h2>
        <p className="text-gray-600 mb-8">
          {step === 'email' 
            ? 'Enter your admin email to receive OTP'
            : 'Enter the 6-digit code sent to your Telegram'
          }
        </p>
        
        <div className="space-y-4">
          {step === 'email' ? (
            <>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Admin email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleSendOTP)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleSendOTP}
                disabled={!email || isLoading}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={(e) => handleKeyDown(e, handleVerifyOTP)}
                  className="pl-10 text-center text-lg tracking-widest"
                  disabled={isLoading}
                  maxLength={6}
                />
              </div>
              <Button
                onClick={handleVerifyOTP}
                disabled={otp.length !== 6 || isLoading}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Login
                    <Shield className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setStep('email');
                  setOtp('');
                }}
                disabled={isLoading}
                className="w-full"
              >
                Back to Email
              </Button>
            </>
          )}
        </div>
        
        <div className="mt-8 text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <p><strong>Security Notice:</strong></p>
          <p>This admin panel is protected by Telegram OTP. Only authorized administrators can access this area.</p>
        </div>
      </div>
    </div>
  );
}
