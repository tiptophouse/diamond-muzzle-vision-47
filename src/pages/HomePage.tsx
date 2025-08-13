
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gem, Users, ArrowRight, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { TelegramLayout } from '@/components/layout/TelegramLayout';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, isLoading } = useTelegramAuth();

  // Check if this is a registration redirect from shared diamond access
  const isRegistrationRequired = searchParams.get('register') === 'true';
  const accessRequired = searchParams.get('required');
  const sharedFrom = searchParams.get('from');

  useEffect(() => {
    // If user is already authenticated, redirect to inventory
    if (isAuthenticated && user && !isRegistrationRequired) {
      navigate('/inventory');
      return;
    }

    // Show registration success message if user just registered
    if (isAuthenticated && isRegistrationRequired) {
      if (accessRequired === 'diamond_access') {
        toast.success('🎉 Registration completed! You can now view shared diamonds.');
      } else {
        toast.success('🎉 Welcome to the Diamond Mini App!');
      }
    }
  }, [isAuthenticated, user, navigate, isRegistrationRequired, accessRequired]);

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
      <TelegramLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
        </div>
      </TelegramLayout>
    );
  }

  return (
    <TelegramLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
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

          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Gem className="h-10 w-10 text-blue-600" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Diamond Manager
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Professional diamond inventory management and sharing platform for Telegram Mini App
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleGetStarted}
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg touch-target"
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  {isAuthenticated ? 'Go to Inventory' : 'Start Mini App'}
                </Button>
                
                <Button 
                  onClick={handleViewStore}
                  variant="outline" 
                  size="lg"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg touch-target"
                >
                  <Users className="mr-2 h-5 w-5" />
                  View Store
                </Button>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-white/80 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Gem className="h-5 w-5" />
                  Inventory Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Manage your diamond inventory with advanced filtering, search, and organization tools.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Users className="h-5 w-5" />
                  Secure Sharing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Share diamonds securely with registered users only. Track engagement and interactions.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <ArrowRight className="h-5 w-5" />
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
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
    </TelegramLayout>
  );
}
