import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Share2, Copy, Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Diamond } from '@/types/diamond';

interface SecureDiamondDetailShareProps {
  diamond: Diamond;
  onClose?: () => void;
}

export function SecureDiamondDetailShare({ diamond, onClose }: SecureDiamondDetailShareProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSecureShare = async () => {
    setIsSharing(true);
    try {
      // Mock secure sharing
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockUrl = `https://secure.example.com/diamond/${diamond.id}`;
      setShareUrl(mockUrl);
      
      toast({
        title: "Secure link generated",
        description: "Diamond details can now be shared securely",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate secure share link",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied",
        description: "Secure link copied to clipboard",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Secure Share</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {diamond ? (
          <>
            <p>
              Share this diamond securely with a protected link.
            </p>
            
            {!shareUrl ? (
              <Button onClick={handleSecureShare} disabled={isSharing}>
                {isSharing ? (
                  <>
                    <Lock className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Generate Secure Link
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-2">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Secure link generated!
                  </AlertDescription>
                </Alert>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground truncate">
                    {shareUrl}
                  </p>
                  <Button variant="outline" size="sm" onClick={handleCopyLink}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Diamond details not available.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
