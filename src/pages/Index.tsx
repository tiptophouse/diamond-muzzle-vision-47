
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Button } from '@/components/ui/button';
import { Gem, Sparkles, TrendingUp, Users } from 'lucide-react';

export default function Index() {
  const { isAuthenticated, isTelegramEnvironment, isLoading } = useTelegramAuth();
  const navigate = useNavigate();

  // Auto-redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('✅ User authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Gem className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Diamond Inventory
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional diamond management system for dealers and retailers
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Smart Inventory</h3>
            <p className="text-gray-600">
              Manage your diamond inventory with advanced filtering and search capabilities
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Market Insights</h3>
            <p className="text-gray-600">
              Get real-time market data and pricing insights for better decisions
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Client Management</h3>
            <p className="text-gray-600">
              Build relationships and manage client interactions seamlessly
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-white p-8 rounded-xl shadow-lg inline-block">
            <h2 className="text-2xl font-bold mb-4">Get Started</h2>
            {isTelegramEnvironment ? (
              <p className="text-gray-600 mb-6">
                Please wait while we authenticate you through Telegram...
              </p>
            ) : (
              <>
                <p className="text-gray-600 mb-6">
                  Access your dashboard to manage your diamond inventory
                </p>
                <Button 
                  onClick={() => navigate('/dashboard')} 
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Go to Dashboard
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
