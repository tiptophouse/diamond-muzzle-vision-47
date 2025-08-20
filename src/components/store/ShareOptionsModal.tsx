
import { useState } from 'react';
import { Diamond } from '@/components/inventory/InventoryTable';
import { useSecureStoreSharing } from '@/hooks/useSecureStoreSharing';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, Store, Gem, Lock, Users } from 'lucide-react';

interface ShareOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  diamond?: Diamond;
  showStoreOption?: boolean;
}

export function ShareOptionsModal({ 
  isOpen, 
  onClose, 
  diamond, 
  showStoreOption = true 
}: ShareOptionsModalProps) {
  const [isSharing, setIsSharing] = useState(false);
  const { shareStore, shareDiamond, isAvailable } = useSecureStoreSharing();

  const handleShareStore = async () => {
    setIsSharing(true);
    try {
      await shareStore();
      onClose();
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareDiamond = async () => {
    if (!diamond) return;
    
    setIsSharing(true);
    try {
      await shareDiamond(diamond);
      onClose();
    } finally {
      setIsSharing(false);
    }
  };

  if (!isAvailable) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Share2 className="h-5 w-5" />
            Secure Sharing Options
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Secure Access</span>
            </div>
            <p className="text-xs text-blue-700">
              All shared links require user registration and authentication for enhanced security.
            </p>
          </div>

          {diamond && (
            <Button
              onClick={handleShareDiamond}
              disabled={isSharing}
              className="w-full flex items-center gap-3 justify-start h-12 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Gem className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Share This Diamond</div>
                <div className="text-xs opacity-90">{diamond.stockNumber} - {diamond.carat}ct {diamond.shape}</div>
              </div>
            </Button>
          )}

          {showStoreOption && (
            <Button
              onClick={handleShareStore}
              disabled={isSharing}
              className="w-full flex items-center gap-3 justify-start h-12 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Store className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Share Entire Store</div>
                <div className="text-xs opacity-90">Complete diamond collection</div>
              </div>
            </Button>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
            <Users className="h-3 w-3" />
            <span>Recipients will be restricted to shared content only</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
