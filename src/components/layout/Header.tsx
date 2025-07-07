
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { TutorialTrigger } from '@/components/tutorial/TutorialTrigger';

export function Header() {
  const { user } = useTelegramAuth();

  return (
    <header className="premium-card border-b border-border/50 px-6 py-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">💎</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Diamond Muzzle
              </h1>
              <p className="text-xs text-muted-foreground font-medium">Premium Diamond Platform</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <TutorialTrigger />
          
          {user && (
            <div className="flex items-center gap-3 animate-slide-in-right">
              <div className="text-sm text-muted-foreground">
                Welcome, <span className="font-semibold text-foreground">{user.first_name}</span>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <span className="text-sm font-bold text-white">
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
