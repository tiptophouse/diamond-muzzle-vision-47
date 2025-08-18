
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, Mail, Key, Clock, MessageCircle } from 'lucide-react';
import { OTPService } from './OTPService';

interface SimpleLoginProps {
  onLogin: () => void;
}

export function SimpleLogin({ onLogin }: SimpleLoginProps) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [deliveryMethod, setDeliveryMethod] = useState<string>('');
  const { toast } = useToast();

  const ADMIN_EMAIL = 'avtipoos@gmail.com';
  const otpService = OTPService.getInstance();

  const startCountdown = () => {
    setTimeLeft(600); // 10 minutes
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const sendOTP = async () => {
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      toast({
        title: "Access Denied",
        description: "This email is not authorized for admin access.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await otpService.sendOTP(email);
      
      if (result.success) {
        // Determine delivery method from the message
        if (result.message.includes('Telegram')) {
          setDeliveryMethod('Telegram');
        } else if (result.message.includes('email')) {
          setDeliveryMethod('Email');
        } else if (result.message.includes('Development')) {
          setDeliveryMethod('Development Console');
        } else {
          setDeliveryMethod('Secure Channel');
        }
        
        toast({
          title: "OTP Sent Successfully",
          description: result.message,
        });
        setIsOtpSent(true);
        startCountdown();
      } else {
        toast({
          title: "Failed to Send OTP",
          description: result.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP code.",
        variant: "destructive",
      });
      return;
    }

    const result = otpService.verifyOTP(email, otp);
    
    if (result.success) {
      toast({
        title: "Authentication Successful",
        description: "Welcome to BrilliantBot Admin Panel!",
      });
      onLogin();
    } else {
      toast({
        title: "Verification Failed",
        description: result.message,
        variant: "destructive",
      });
      
      if (result.message.includes('expired') || result.message.includes('Too many')) {
        resetForm();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isOtpSent) {
      await sendOTP();
    } else {
      verifyOTP();
    }
  };

  const resetForm = () => {
    setIsOtpSent(false);
    setOtp('');
    setEmail('');
    setTimeLeft(0);
    setDeliveryMethod('');
    otpService.clearOTP(email);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDeliveryIcon = () => {
    switch (deliveryMethod) {
      case 'Telegram':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'Email':
        return <Mail className="h-4 w-4 text-green-500" />;
      case 'Development Console':
        return <Key className="h-4 w-4 text-yellow-500" />;
      default:
        return <Key className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center mx-auto shadow-lg">
            <Shield className="text-white h-8 w-8" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-800">BrilliantBot</CardTitle>
            <CardDescription className="text-slate-600">
              {isOtpSent ? 
                `Enter the OTP sent via ${deliveryMethod || 'secure channel'}` : 
                'Secure Admin Authentication'
              }
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isOtpSent ? (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Admin Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your authorized email"
                    className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  🔐 OTP will be sent to your Telegram first, then email as backup
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="otp" className="flex items-center gap-2 text-slate-700">
                    One-Time Password
                    {getDeliveryIcon()}
                  </Label>
                  {timeLeft > 0 && (
                    <div className="flex items-center text-sm text-slate-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(timeLeft)}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    className="pl-10 text-center tracking-widest font-mono text-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    maxLength={6}
                    required
                  />
                </div>
                {deliveryMethod && (
                  <p className="text-xs text-slate-500">
                    📱 Code sent via {deliveryMethod}
                  </p>
                )}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
              disabled={isLoading || (isOtpSent && otp.length !== 6)}
            >
              {isLoading ? 'Processing...' : isOtpSent ? 'Verify & Login' : 'Send Secure OTP'}
            </Button>
          </form>
          
          {isOtpSent && (
            <div className="mt-4 space-y-2">
              <Button 
                variant="outline" 
                className="w-full border-slate-300 text-slate-700 hover:bg-slate-50" 
                onClick={resetForm}
                disabled={isLoading}
              >
                Use Different Email
              </Button>
              <Button 
                variant="ghost" 
                className="w-full text-sm text-slate-600 hover:text-slate-800" 
                onClick={sendOTP}
                disabled={isLoading || timeLeft > 540} // Can resend after 1 minute
              >
                {timeLeft > 540 ? `Resend in ${formatTime(timeLeft - 540)}` : 'Resend OTP'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
