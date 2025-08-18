
import { supabase } from '@/integrations/supabase/client';

export class OTPService {
  private static instance: OTPService;
  private otpStore: Map<string, { otp: string; timestamp: number; attempts: number }> = new Map();
  private readonly OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes
  private readonly MAX_ATTEMPTS = 3;
  private readonly ADMIN_TELEGRAM_ID = 2138564172;
  private readonly ADMIN_EMAIL = 'avtipoos@gmail.com';

  static getInstance(): OTPService {
    if (!OTPService.instance) {
      OTPService.instance = new OTPService();
    }
    return OTPService.instance;
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTPToTelegram(otp: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('📱 Sending OTP via Telegram Bot API to admin:', this.ADMIN_TELEGRAM_ID);
      
      const { data, error } = await supabase.functions.invoke('send-telegram-otp', {
        body: {
          otp: otp,
          telegram_id: this.ADMIN_TELEGRAM_ID
        }
      });

      if (error) {
        console.error('❌ Telegram OTP send failed:', error);
        return {
          success: false,
          message: 'Failed to send OTP via Telegram'
        };
      }

      console.log('✅ OTP sent via Telegram successfully:', data);
      return {
        success: true,
        message: 'OTP sent to your Telegram'
      };
    } catch (error) {
      console.error('❌ Telegram OTP error:', error);
      return {
        success: false,
        message: 'Telegram delivery failed'
      };
    }
  }

  async sendOTPToEmail(email: string, otp: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('📧 Sending OTP via email to:', email);
      
      const { data, error } = await supabase.functions.invoke('send-otp-email', {
        body: { 
          email: email, 
          otp: otp 
        }
      });

      if (error) {
        console.error('❌ Email OTP send failed:', error);
        return {
          success: false,
          message: 'Failed to send OTP via email'
        };
      }

      console.log('✅ OTP sent via email successfully');
      return {
        success: true,
        message: `OTP sent to ${email}`
      };
    } catch (error) {
      console.error('❌ Email OTP error:', error);
      return {
        success: false,
        message: 'Email delivery failed'
      };
    }
  }

  async sendOTP(email: string): Promise<{ success: boolean; message: string }> {
    // Validate admin email
    if (email.toLowerCase() !== this.ADMIN_EMAIL.toLowerCase()) {
      return {
        success: false,
        message: 'This email is not authorized for admin access'
      };
    }

    try {
      const otp = this.generateOTP();
      const timestamp = Date.now();

      // Store OTP with metadata
      this.otpStore.set(email.toLowerCase(), {
        otp,
        timestamp,
        attempts: 0
      });

      console.log('🔐 Generated OTP for admin access:', otp);

      // Try Telegram first (primary method)
      console.log('📱 Attempting Telegram delivery first...');
      const telegramResult = await this.sendOTPToTelegram(otp);
      
      if (telegramResult.success) {
        return telegramResult;
      }

      // Fallback to email
      console.log('📧 Telegram failed, trying email fallback...');
      const emailResult = await this.sendOTPToEmail(email, otp);
      
      if (emailResult.success) {
        return emailResult;
      }

      // Final fallback for development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔐 DEVELOPMENT OTP for ${email}: ${otp}`);
        return {
          success: true,
          message: `Development OTP: ${otp}`
        };
      }
      
      return {
        success: false,
        message: 'Failed to send OTP. Both Telegram and email delivery failed.'
      };

    } catch (error) {
      console.error('❌ Failed to send OTP:', error);
      return {
        success: false,
        message: 'Failed to generate OTP. Please try again.'
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
