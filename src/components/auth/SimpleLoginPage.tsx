import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SimpleLoginPageProps {
  onLogin: (username: string, password: string) => boolean;
}

export function SimpleLoginPage({ onLogin }: SimpleLoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔐 Attempting login with:', { username, passwordLength: password.length });
      
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const success = onLogin(username, password);
      
      if (!success) {
        toast({
          title: "Login Failed",
          description: "Invalid username or password. Please check your credentials and try again.",
          variant: "destructive"
        });
        setIsLoading(false);
      } else {
        toast({
          title: "Welcome!",
          description: "Successfully logged in. Redirecting to dashboard...",
          variant: "default"
        });
        console.log('✅ Login successful, authentication should be complete');
        // Keep loading state as the user should be redirected
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      toast({
        title: "Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-xl">
        <CardHeader className="text-center">
          <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Admin Access Required
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Please sign in with your administrator credentials
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Credentials Helper */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 mb-1">Admin Credentials:</p>
                <p className="text-blue-700">Username: <code className="bg-blue-100 px-1 rounded">ormoshe35@</code></p>
                <p className="text-blue-700">Password: <code className="bg-blue-100 px-1 rounded">admin123456</code></p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username (ormoshe35@)"
                  className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  required
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="pl-10 pr-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !username || !password}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span className="text-white">Signing in...</span>
                </div>
              ) : (
                <span className="text-white font-medium">Sign In to Admin Dashboard</span>
              )}
            </Button>
          </form>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              This is the secure development access for BrilliantBot admin panel.
              <br />
              After login, you'll have full administrator privileges.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
