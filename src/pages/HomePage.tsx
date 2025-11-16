
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gem, Users, ArrowRight, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { InventoryGuard } from '@/components/InventoryGuard';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, isLoading } = useTelegramAuth();

  // Check if this is a registration redirect from shared diamond access
  const isRegistrationRequired = searchParams.get('register') === 'true';
  const accessRequired = searchParams.get('required');
  const sharedFrom = searchParams.get('from');

  useEffect(() => {
    // Don't auto-redirect - let user see homepage first
    if (isAuthenticated && isRegistrationRequired) {
      if (accessRequired === 'diamond_access') {
        toast.success('🎉 Registration completed! You can now view shared diamonds.');
      } else {
        toast.success('🎉 Welcome to the Diamond Mini App!');
      }
    }
  }, [isAuthenticated, isRegistrationRequired, accessRequired]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/inventory');
    } else {
      toast.info('Please start the Mini App from Telegram to continue');
    }
  };

  const handleViewStore = () => {
    navigate('/store');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  // Show inventory guard only for authenticated users
  if (isAuthenticated && user) {
    return (
      <InventoryGuard 
        requireStock={true}
        onUploadClick={() => navigate('/inventory/add')}
      >
        <div className="min-h-screen">
          <div className="container mx-auto px-6 py-16 max-w-4xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">ברוך הבא! 👋</h1>
              <p className="text-xl text-muted-foreground">יש לך מלאי - בוא נתחיל!</p>
            </div>
            
            <div className="grid gap-4">
              <Button onClick={() => navigate('/inventory')} size="lg" className="w-full">
                צפה במלאי שלי
                <ArrowRight className="mr-2 h-5 w-5" />
              </Button>
              
              <Button onClick={handleViewStore} size="lg" variant="outline" className="w-full">
                צפה בחנות
                <Users className="mr-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </InventoryGuard>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        {/* Registration Required Banner */}
        {isRegistrationRequired && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <UserPlus className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800">
                  Registration Required
                </h3>
              </div>
              <p className="text-green-700 mb-4">
                {accessRequired === 'diamond_access' 
                  ? 'To view shared diamonds, you need to be registered in our Mini App. Complete the registration by clicking "Start" below!'
                  : 'Welcome! Please complete your registration to access all features.'
                }
              </p>
              {sharedFrom && (
                <p className="text-sm text-green-600">
                  Shared by user: {sharedFrom}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Hero Section - Clean 21.dev style */}
        <div className="text-center mb-20">
          {/* Clean icon */}
          <div className="mx-auto w-20 h-20 rounded-2xl bg-card border shadow-soft flex items-center justify-center mb-12">
            <Gem className="w-10 h-10 text-primary" />
          </div>
          
          {/* Large, prominent headline */}
          <h1 className="text-6xl md:text-7xl font-bold text-foreground tracking-tight leading-none mb-8">
            Equipping diamond traders with the tools they need today to build tomorrow's portfolio. 💎
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground font-normal leading-relaxed max-w-3xl mx-auto mb-12">
            Professional diamond inventory management and sharing platform
          </p>
          
          {/* Clean buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleGetStarted}
              size="lg" 
              className="px-8 py-4 text-lg font-semibold rounded-xl shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all duration-200"
            >
              <ArrowRight className="mr-2 h-5 w-5" />
              {isAuthenticated ? 'Go to Inventory' : 'Start Mini App'}
            </Button>
            
            <Button 
              onClick={handleViewStore}
              variant="outline" 
              size="lg"
              className="px-8 py-4 text-lg font-semibold rounded-xl border-2 hover:bg-accent/50 transition-all duration-200"
            >
              <Users className="mr-2 h-5 w-5" />
              View Store
            </Button>
          </div>
        </div>

        {/* Features Grid - Minimal cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="border shadow-soft hover:shadow-medium transition-all duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-foreground text-lg font-semibold">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Gem className="h-5 w-5 text-primary" />
                </div>
                Inventory Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Manage your diamond inventory with advanced filtering, search, and organization tools.
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-soft hover:shadow-medium transition-all duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-foreground text-lg font-semibold">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                Secure Sharing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Share diamonds securely with registered users only. Track engagement and interactions.
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-soft hover:shadow-medium transition-all duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-foreground text-lg font-semibold">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ArrowRight className="h-5 w-5 text-primary" />
                </div>
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Get insights on diamond views, user engagement, and sharing performance.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Registration Status */}
        {isAuthenticated ? (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 rounded-full p-2">
                  <UserPlus className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">
                    Welcome, {user?.first_name}!
                  </h3>
                  <p className="text-green-700">
                    You're registered and can access all features including shared diamonds.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 rounded-full p-2">
                  <UserPlus className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-800">
                    Registration Required
                  </h3>
                  <p className="text-yellow-700">
                    Open this app through Telegram Mini App to register and access all features.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
