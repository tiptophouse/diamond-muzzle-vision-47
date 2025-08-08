
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldLock, LogIn } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function LoginPage() {
  const navigate = useNavigate();

  const openInTelegram = () => {
    // Attempt to open the Telegram bot (replace with your bot username if needed)
    window.location.href = 'https://t.me/';
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <Helmet>
        <title>Secure Login | Admin Access</title>
        <meta name="description" content="Secure login gateway for admin access. Open in Telegram to continue." />
        <link rel="canonical" href={`${window.location.origin}/login`} />
      </Helmet>
      <section className="w-full max-w-md">
        <div className="bg-card border rounded-xl shadow-sm p-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="rounded-full h-16 w-16 bg-primary/10 flex items-center justify-center">
              <ShieldLock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Secure Admin Login</h1>
            <p className="text-muted-foreground text-sm">
              For your security, admin access requires a verified Telegram session. Please open this app from Telegram.
            </p>
            <div className="w-full mt-2 grid gap-3">
              <Button onClick={openInTelegram} className="w-full">
                <LogIn className="mr-2 h-4 w-4" /> Open in Telegram
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/')}>Back to Home</Button>
            </div>
            <aside className="text-xs text-muted-foreground mt-4">
              If you believe this is an error, contact the administrator.
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
