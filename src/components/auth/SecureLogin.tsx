
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Mail, Key, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface SecureLoginProps {
  onLoginSuccess: (userToken: string) => void;
}

export function SecureLogin({ onLoginSuccess }: SecureLoginProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const sendOTP = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // Call your FastAPI backend to send OTP
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const result = await response.json();
      
      if (result.success) {
        setSessionToken(result.session_token);
        setStep('otp');
        toast.success('OTP sent to your email');
      } else {
        toast.error(result.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('OTP send error:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    if (!sessionToken) {
      toast.error('Session expired. Please request a new OTP.');
      setStep('email');
      return;
    }

    setLoading(true);
    try {
      // Call your FastAPI backend to verify OTP
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          otp, 
          session_token: sessionToken 
        })
      });

      const result = await response.json();
      
      if (result.success && result.access_token) {
        // Log security event
        console.log('✅ Secure login successful for:', email);
        
        // Store auth token securely
        localStorage.setItem('auth_token', result.access_token);
        localStorage.setItem('user_email', email);
        
        toast.success('Login successful!');
        onLoginSuccess(result.access_token);
      } else {
        toast.error(result.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="text-center space-y-4">
          <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Secure Access
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              {step === 'email' 
                ? 'Enter your authorized email address'
                : 'Enter the 6-digit code sent to your email'
              }
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 'email' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 text-lg"
                    disabled={loading}
                    onKeyPress={(e) => e.key === 'Enter' && sendOTP()}
                  />
                </div>
              </div>

              <Button 
                onClick={sendOTP}
                disabled={loading || !email}
                className="w-full h-12 text-lg font-medium"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </Button>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Authorized Access Only</p>
                    <p>Only pre-approved email addresses can access this application.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Code sent to: <span className="font-medium">{email}</span>
                </p>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="pl-10 h-12 text-lg text-center tracking-widest"
                    disabled={loading}
                    onKeyPress={(e) => e.key === 'Enter' && verifyOTP()}
                  />
                </div>
              </div>

              <Button 
                onClick={verifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full h-12 text-lg font-medium"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </Button>

              <Button 
                variant="ghost"
                onClick={() => {
                  setStep('email');
                  setOtp('');
                  setSessionToken(null);
                }}
                disabled={loading}
                className="w-full"
              >
                Use Different Email
              </Button>
            </div>
          )}

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Protected by BrilliantBot Security
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
