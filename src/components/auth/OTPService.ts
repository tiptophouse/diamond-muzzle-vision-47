
import { supabase } from '@/integrations/supabase/client';

export class OTPService {
  private static instance: OTPService;
  private otpStore: Map<string, { otp: string; timestamp: number; attempts: number }> = new Map();
  private readonly OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes
  private readonly MAX_ATTEMPTS = 3;

  static getInstance(): OTPService {
    if (!OTPService.instance) {
      OTPService.instance = new OTPService();
    }
    return OTPService.instance;
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const otp = this.generateOTP();
      const timestamp = Date.now();

      // Store OTP with metadata
      this.otpStore.set(email.toLowerCase(), {
        otp,
        timestamp,
        attempts: 0
      });

      // Try to send via Supabase Edge Function
      try {
        const { data, error } = await supabase.functions.invoke('send-otp-email', {
          body: { email, otp }
        });

        if (error) {
          throw error;
        }

        return {
          success: true,
          message: `OTP sent successfully to ${email}`
        };
      } catch (emailError) {
        // Fallback: Log to console in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔐 OTP for ${email}: ${otp}`);
          return {
            success: true,
            message: `OTP generated (check console in development): ${email}`
          };
        }
        throw emailError;
      }
    } catch (error) {
      console.error('Failed to send OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.'
      };
    }
  }

  verifyOTP(email: string, inputOtp: string): { success: boolean; message: string } {
    const emailKey = email.toLowerCase();
    const otpData = this.otpStore.get(emailKey);

    if (!otpData) {
      return {
        success: false,
        message: 'No OTP found. Please request a new one.'
      };
    }

    // Check if OTP is expired
    if (Date.now() - otpData.timestamp > this.OTP_EXPIRY_TIME) {
      this.otpStore.delete(emailKey);
      return {
        success: false,
        message: 'OTP has expired. Please request a new one.'
      };
    }

    // Check attempt limit
    if (otpData.attempts >= this.MAX_ATTEMPTS) {
      this.otpStore.delete(emailKey);
      return {
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      };
    }

    // Verify OTP
    if (otpData.otp === inputOtp.trim()) {
      this.otpStore.delete(emailKey);
      return {
        success: true,
        message: 'OTP verified successfully!'
      };
    } else {
      // Increment attempts
      otpData.attempts++;
      this.otpStore.set(emailKey, otpData);
      
      const remainingAttempts = this.MAX_ATTEMPTS - otpData.attempts;
      return {
        success: false,
        message: `Invalid OTP. ${remainingAttempts} attempts remaining.`
      };
    }
  }

  clearOTP(email: string): void {
    this.otpStore.delete(email.toLowerCase());
  }
}
