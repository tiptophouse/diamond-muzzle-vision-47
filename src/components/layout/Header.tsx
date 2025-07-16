
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { TutorialTrigger } from '@/components/tutorial/TutorialTrigger';

export function Header() {
  const { user } = useTelegramAuth();

  return (
    <header className="bg-card/50 backdrop-blur-md border-b border-border/20 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0088cc] to-[#229ED9] flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">💎</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold text-foreground tracking-tight">
                Diamond Mazal
              </h1>
              <p className="text-xs text-muted-foreground">Premium Diamond Platform</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <TutorialTrigger />
          
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-sm text-muted-foreground">
                Welcome, <span className="font-medium text-foreground">{user.first_name}</span>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-[#0088cc] to-[#229ED9] rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <span className="text-sm font-semibold text-white">
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
