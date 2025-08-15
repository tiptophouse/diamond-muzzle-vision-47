
import { supabase } from '@/integrations/supabase/client';

export interface AuthUser {
  id: string;
  email?: string;
  telegram_id?: number;
}

class AuthService {
  private currentUser: AuthUser | null = null;

  async signIn(): Promise<string | null> {
    try {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth error:', error);
        return null;
      }

      if (session?.access_token) {
        this.currentUser = {
          id: session.user.id,
          email: session.user.email,
        };
        return session.access_token;
      }

      return null;
    } catch (error) {
      console.error('SignIn error:', error);
      return null;
    }
  }

  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
      this.currentUser = null;
    } catch (error) {
      console.error('SignOut error:', error);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('sb-access-token');
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser || !!this.getToken();
  }
}

export const authService = new AuthService();

export default authService;
