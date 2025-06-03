
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center space-y-8 p-8 max-w-md">
        <div className="space-y-4">
          <div className="bg-blue-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto">
            <span className="text-4xl">💎</span>
          </div>
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700">Page Not Found</h2>
          <p className="text-gray-600">
            The diamond you're looking for seems to have rolled away...
          </p>
        </div>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link to="/dashboard" className="flex items-center justify-center gap-2">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link to="/" className="flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
