
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { TutorialTrigger } from '@/components/tutorial/TutorialTrigger';

export function Header() {
  const { user } = useTelegramAuth();

  return (
    <header className="bg-card/50 backdrop-blur-md border-b border-border/20 px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0088cc] to-[#229ED9] flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-white font-bold text-sm sm:text-lg">💎</span>
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight truncate">
                Diamond Mazal
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Premium Diamond Platform</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <TutorialTrigger />
          
          {user && (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:block text-sm text-muted-foreground">
                Welcome, <span className="font-medium text-foreground">{user.first_name}</span>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#0088cc] to-[#229ED9] rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <span className="text-xs sm:text-sm font-semibold text-white">
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
