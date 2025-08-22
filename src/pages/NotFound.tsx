
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { TelegramInitDataGuard } from "@/components/guards/TelegramInitDataGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home } from "lucide-react";

const NotFoundContent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleSecureReturn = () => {
    // Only allow navigation if user is properly authenticated
    console.log('🔒 Secure navigation to home initiated');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <AlertTriangle className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-4xl font-bold mb-2">404</CardTitle>
          <CardDescription className="text-lg">
            Oops! Page not found
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="bg-muted/50 border rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2">What you can do:</h4>
            <ul className="text-muted-foreground text-sm space-y-1">
              <li>• Check the URL for typos</li>
              <li>• Return to the main page</li>
              <li>• Use the navigation menu</li>
            </ul>
          </div>
          
          <Button 
            onClick={handleSecureReturn}
            className="w-full"
            size="lg"
          >
            <Home className="h-4 w-4 mr-2" />
            Return to Home
          </Button>
          
          {/* Debug info in development */}
          {process.env.NODE_ENV === 'development' && (
            <details className="text-xs bg-muted p-3 rounded">
              <summary className="font-semibold cursor-pointer">Debug Info</summary>
              <div className="mt-2 space-y-1 text-muted-foreground">
                <div>Requested Path: {location.pathname}</div>
                <div>Search: {location.search}</div>
                <div>Hash: {location.hash}</div>
                <div>Timestamp: {new Date().toISOString()}</div>
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const NotFound = () => {
  return (
    <TelegramInitDataGuard requireAuth={true}>
      <NotFoundContent />
    </TelegramInitDataGuard>
  );
};

export default NotFound;
