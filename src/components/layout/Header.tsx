
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { TutorialTrigger } from '@/components/tutorial/TutorialTrigger';

export function Header() {
  const { user } = useTelegramAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Diamond Muzzle
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <TutorialTrigger />
          
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                Welcome, {user.first_name}
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600">
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
