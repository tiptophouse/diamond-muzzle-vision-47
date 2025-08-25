
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useSharedDiamondAccess } from '@/hooks/useSharedDiamondAccess';
import { api } from '@/lib/api/client';

interface Diamond {
  id: string;
  stock_number: string;
  carat: number;
  shape: string;
  color: string;
  clarity: string;
  cut: string;
  image_url?: string;
  price?: number;
}

export default function DiamondDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { webApp, hapticFeedback, backButton } = useTelegramWebApp();
  const { validateAndTrackAccess } = useSharedDiamondAccess();

  // Always show back button and close options for navigation
  useEffect(() => {
    if (webApp) {
      // Set colors for better visibility
      webApp.setHeaderColor('#ffffff');
      webApp.setBackgroundColor('#f8fafc');
      
      // Always show back button
      backButton.show(() => {
        hapticFeedback.light();
        navigate(-1);
      });
    }

    return () => {
      backButton.hide();
    };
  }, [webApp, backButton, hapticFeedback, navigate]);

  const { data: diamond, isLoading, error } = useQuery({
    queryKey: ['diamond', id],
    queryFn: async () => {
      if (!id) throw new Error('Diamond ID is required');
      
      // Validate access for shared diamonds
      const hasAccess = await validateAndTrackAccess(id);
      if (!hasAccess) {
        throw new Error('Access denied');
      }

      // Use API instead of direct Supabase call
      const response = await api.get<Diamond>(`/diamonds/detail/${id}`);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Diamond not found');
      }
      
      return response.data;
    },
    enabled: !!id,
  });

  const handleGoBack = () => {
    hapticFeedback.light();
    navigate(-1);
  };

  const handleClose = () => {
    hapticFeedback.light();
    if (webApp) {
      webApp.close();
    } else {
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading diamond details...</p>
        </div>
      </div>
    );
  }

  if (error || !diamond) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Diamond Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error instanceof Error ? error.message : 'The requested diamond could not be found.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleGoBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={handleClose}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header with Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={handleGoBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="font-semibold text-gray-900 truncate mx-4">
            {diamond.carat}ct {diamond.shape}
          </h1>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 pb-4">
        <div className="container mx-auto p-4 max-w-4xl">
          {/* Diamond Image */}
          {diamond.image_url && (
            <div className="mb-6">
              <img
                src={diamond.image_url}
                alt={`${diamond.carat}ct ${diamond.shape} diamond`}
                className="w-full max-w-md mx-auto rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Diamond Details */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {diamond.carat} Carat {diamond.shape} Diamond
            </h2>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Stock Number:</span>
                <span className="ml-2">{diamond.stock_number}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Color:</span>
                <span className="ml-2">{diamond.color}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Clarity:</span>
                <span className="ml-2">{diamond.clarity}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Cut:</span>
                <span className="ml-2">{diamond.cut}</span>
              </div>
              {diamond.price && (
                <div className="col-span-2">
                  <span className="font-medium text-gray-600">Price:</span>
                  <span className="ml-2 text-lg font-bold text-green-600">
                    ${diamond.price.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
            <div className="flex gap-3 max-w-4xl mx-auto">
              <Button variant="outline" onClick={handleGoBack} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Store
              </Button>
              <Button onClick={handleClose} className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
