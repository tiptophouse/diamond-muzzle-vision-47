
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { TutorialTrigger } from '@/components/tutorial/TutorialTrigger';

export function Header() {
  const { user } = useTelegramAuth();

  return (
    <header className="bg-card/60 backdrop-blur-xl border-b border-border/30 px-4 sm:px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg flex-shrink-0 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <span className="text-white font-bold text-lg sm:text-xl">💎</span>
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight truncate bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                Diamond Mazal
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block font-medium">Premium Diamond Platform</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <TutorialTrigger />
          
          {user && (
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden md:block text-sm text-muted-foreground">
                Welcome, <span className="font-semibold text-foreground">{user.first_name}</span>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-primary/20">
                <span className="text-sm sm:text-base font-bold text-white">
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
