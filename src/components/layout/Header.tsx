
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { TutorialTrigger } from '@/components/tutorial/TutorialTrigger';
import { Diamond } from 'lucide-react';

export function Header() {
  const { user } = useTelegramAuth();

  return (
    <header className="bg-card border-b border-border px-6 py-5 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 ring-4 ring-primary/10">
            <Diamond className="text-primary-foreground h-7 w-7" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-foreground tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text">
              BrilliantBot
            </h1>
            <p className="text-sm text-muted-foreground font-medium">Professional Diamond Management</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <TutorialTrigger />
          
          {user && (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-semibold text-foreground">
                  Welcome, {user.first_name}
                </span>
                <span className="text-xs text-muted-foreground">Telegram User</span>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-primary/20">
                <span className="text-base font-bold text-primary-foreground">
                  {user.first_name?.charAt(0)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
