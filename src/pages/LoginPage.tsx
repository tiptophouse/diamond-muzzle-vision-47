
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, LogIn } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('avtipoos@gmail.com');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Missing credentials', description: 'Please enter email and password.' });
      return;
    }
    try {
      setIsSubmitting(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Login successful', description: 'Redirecting to admin…' });
      navigate('/admin', { replace: true });
    } catch (err: any) {
      toast({ title: 'Unexpected error', description: err?.message ?? 'Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <Helmet>
        <title>Admin Login | Secure Access</title>
        <meta name="description" content="Secure password login to access the admin panel. Protected access with Supabase auth." />
        <link rel="canonical" href={`${window.location.origin}/login`} />
      </Helmet>
      <section className="w-full max-w-md">
        <div className="bg-card border rounded-xl shadow-sm p-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="rounded-full h-16 w-16 bg-primary/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Secure Admin Login</h1>
            <p className="text-muted-foreground text-sm">
              Enter your credentials to unlock the admin panel. After login, Telegram protection continues as usual.
            </p>
            <form onSubmit={handleLogin} className="w-full mt-2 grid gap-3 text-left">
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm text-foreground">Email</label>
                <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label htmlFor="password" className="text-sm text-foreground">Password</label>
                <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <LogIn className="mr-2 h-4 w-4" /> {isSubmitting ? 'Signing in…' : 'Login'}
              </Button>
              <Button variant="outline" type="button" className="w-full" onClick={() => navigate('/')}>Back to Home</Button>
            </form>
            <aside className="text-xs text-muted-foreground mt-2">
              Need help? Contact the administrator.
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
