import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Diamond, Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useOptimizedTelegramAuthContext } from '@/context/OptimizedTelegramAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SecureDiamondPage() {
  const { user, isAuthenticated } = useOptimizedTelegramAuthContext();
  const { encryptedData } = useParams<{ encryptedData: string }>();
  const navigate = useNavigate();
  const [decryptedData, setDecryptedData] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      console.warn('🔒 User is not authenticated, redirecting...');
      navigate('/');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate decryption (replace with actual decryption logic)
        const decodedData = atob(encryptedData || '');
        console.log('🔑 Decrypted data:', decodedData);
        setDecryptedData(decodedData);
      } catch (err) {
        console.error('❌ Decryption error:', err);
        setError('Failed to decrypt diamond data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [encryptedData, isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full p-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-yellow-500" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              You must be authenticated to view this content. Please ensure you are logged in via Telegram.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full p-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Diamond className="h-5 w-5 text-blue-500 animate-spin" />
              Loading Diamond Data...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Fetching and decrypting the diamond details. Please wait...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full p-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">
            <Diamond className="inline-block h-6 w-6 mr-2 text-blue-500" />
            Secure Diamond Details
          </CardTitle>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {showDetails ? (
              <>
                <EyeOff className="inline-block h-4 w-4 mr-1" />
                Hide Details
              </>
            ) : (
              <>
                <Eye className="inline-block h-4 w-4 mr-1" />
                Show Details
              </>
            )}
          </button>
        </CardHeader>
        <CardContent>
          {decryptedData && showDetails ? (
            <div className="space-y-4">
              <p className="text-gray-700">
                <strong>Decrypted Data:</strong>
              </p>
              <div className="p-4 bg-gray-100 rounded-md">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                  {decryptedData}
                </pre>
              </div>
              <p className="text-sm text-gray-500">
                This is the decrypted information for the diamond. Handle with care.
              </p>
            </div>
          ) : (
            <p className="text-gray-600">
              Click "Show Details" to reveal the decrypted diamond information.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
