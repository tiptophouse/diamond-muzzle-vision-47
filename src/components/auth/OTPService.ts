
import { supabase } from '@/integrations/supabase/client';

export class OTPService {
  private static instance: OTPService;
  private otpStore: Map<string, { otp: string; timestamp: number; attempts: number }> = new Map();
  private readonly OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes
  private readonly MAX_ATTEMPTS = 3;
  private readonly ADMIN_TELEGRAM_ID = 2138564172;

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
      console.log('📱 Sending OTP via Telegram to admin:', this.ADMIN_TELEGRAM_ID);
      
      const stoneData = {
        stockNumber: 'OTP-REQUEST',
        shape: 'Authentication',
        carat: 0,
        color: 'Security',
        clarity: 'Admin Access',
        cut: '',
        polish: 'Login',
        symmetry: 'Request',
        fluorescence: 'OTP',
        pricePerCarat: 0,
        lab: '',
        certificateNumber: otp
      };

      const { data, error } = await supabase.functions.invoke('send-telegram-message', {
        body: {
          telegramId: this.ADMIN_TELEGRAM_ID,
          stoneData: stoneData,
          storeUrl: `🔐 **Admin Login OTP**\n\nYour one-time password: **${otp}**\n\nValid for 10 minutes.\n\nDo not share this code with anyone.`
        }
      });

      if (error) {
        console.error('❌ Telegram OTP send failed:', error);
        return {
          success: false,
          message: 'Failed to send OTP via Telegram'
        };
      }

      console.log('✅ OTP sent via Telegram successfully');
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

      // Try Telegram first (more reliable)
      console.log('🔐 Attempting to send OTP via Telegram first...');
      const telegramResult = await this.sendOTPToTelegram(otp);
      
      if (telegramResult.success) {
        return telegramResult;
      }

      // Fallback to email
      console.log('📧 Telegram failed, trying email...');
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
        console.error('❌ Email OTP failed:', emailError);
        
        // Final fallback: Log to console in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔐 DEVELOPMENT OTP for ${email}: ${otp}`);
          return {
            success: true,
            message: `OTP generated (check console): ${otp}`
          };
        }
        
        return {
          success: false,
          message: 'Failed to send OTP. Both Telegram and email delivery failed.'
        };
      }
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
