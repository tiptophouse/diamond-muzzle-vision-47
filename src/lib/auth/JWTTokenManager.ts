
import CryptoJS from 'crypto-js';

interface TokenData {
  token: string;
  expiresAt: number;
  userId: number;
  refreshToken?: string;
}

class JWTTokenManager {
  private static instance: JWTTokenManager;
  private readonly STORAGE_KEY = 'telegram_jwt_auth';
  private readonly ENCRYPTION_KEY = 'telegram_jwt_secret_key';
  private refreshTimer: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): JWTTokenManager {
    if (!JWTTokenManager.instance) {
      JWTTokenManager.instance = new JWTTokenManager();
    }
    return JWTTokenManager.instance;
  }

  private encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this.ENCRYPTION_KEY).toString();
  }

  private decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  storeToken(token: string, expiresIn: number, userId: number, refreshToken?: string): void {
    const expiresAt = Date.now() + (expiresIn * 1000);
    const tokenData: TokenData = {
      token,
      expiresAt,
      userId,
      refreshToken
    };

    try {
      const encryptedData = this.encrypt(JSON.stringify(tokenData));
      localStorage.setItem(this.STORAGE_KEY, encryptedData);
      this.scheduleTokenRefresh(expiresAt);
      console.log('✅ JWT token stored securely with expiry:', new Date(expiresAt));
    } catch (error) {
      console.error('❌ Failed to store JWT token:', error);
    }
  }

  getValidToken(): string | null {
    try {
      const encryptedData = localStorage.getItem(this.STORAGE_KEY);
      if (!encryptedData) return null;

      const decryptedData = this.decrypt(encryptedData);
      const tokenData: TokenData = JSON.parse(decryptedData);

      // Check if token is expired
      if (Date.now() >= tokenData.expiresAt) {
        console.log('🕐 JWT token expired, clearing storage');
        this.clearToken();
        return null;
      }

      console.log('✅ Valid JWT token found, expires in:', Math.round((tokenData.expiresAt - Date.now()) / 1000), 'seconds');
      return tokenData.token;
    } catch (error) {
      console.error('❌ Failed to retrieve JWT token:', error);
      this.clearToken();
      return null;
    }
  }

  getStoredTokenData(): TokenData | null {
    try {
      const encryptedData = localStorage.getItem(this.STORAGE_KEY);
      if (!encryptedData) return null;

      const decryptedData = this.decrypt(encryptedData);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('❌ Failed to get token data:', error);
      return null;
    }
  }

  isTokenValid(): boolean {
    const tokenData = this.getStoredTokenData();
    if (!tokenData) return false;
    return Date.now() < tokenData.expiresAt;
  }

  clearToken(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    console.log('🧹 JWT token cleared from storage');
  }

  private scheduleTokenRefresh(expiresAt: number): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Schedule refresh 5 minutes before expiration
    const refreshTime = expiresAt - Date.now() - (5 * 60 * 1000);
    
    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        console.log('🔄 Attempting background token refresh...');
        this.backgroundRefreshToken();
      }, refreshTime);
      
      console.log('⏰ Token refresh scheduled in:', Math.round(refreshTime / 1000), 'seconds');
    }
  }

  private async backgroundRefreshToken(): Promise<void> {
    const tokenData = this.getStoredTokenData();
    if (!tokenData?.refreshToken) {
      console.warn('⚠️ No refresh token available for background refresh');
      return;
    }

    try {
      // This would call your refresh endpoint
      console.log('🔄 Background token refresh would happen here');
      // Implementation depends on your backend refresh endpoint
    } catch (error) {
      console.error('❌ Background token refresh failed:', error);
    }
  }

  getTokenExpiryTime(): number | null {
    const tokenData = this.getStoredTokenData();
    return tokenData?.expiresAt || null;
  }

  getUserId(): number | null {
    const tokenData = this.getStoredTokenData();
    return tokenData?.userId || null;
  }
}

export default JWTTokenManager;
