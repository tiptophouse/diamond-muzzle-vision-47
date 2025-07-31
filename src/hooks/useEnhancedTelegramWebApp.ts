import { useCallback, useState } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';

interface ScanQRResult {
  data: string;
  success: boolean;
}

export function useEnhancedTelegramWebApp() {
  const baseWebApp = useTelegramWebApp();
  const [isScanning, setIsScanning] = useState(false);
  const [hasWriteAccess, setHasWriteAccess] = useState(false);

  // Enhanced QR Scanner with certificate detection
  const scanCertificate = useCallback((): Promise<ScanQRResult> => {
    return new Promise((resolve) => {
      if (!baseWebApp.webApp?.showScanQrPopup) {
        resolve({ data: '', success: false });
        return;
      }

      setIsScanning(true);

      try {
        baseWebApp.webApp.showScanQrPopup({
          text: 'Scan diamond certificate QR code'
        });

        // Set up timeout for cleanup
        setTimeout(() => {
          setIsScanning(false);
          resolve({ data: '', success: false });
        }, 30000);
      } catch (error) {
        console.error('Failed to show QR scanner:', error);
        setIsScanning(false);
        resolve({ data: '', success: false });
      }
    });
  }, [baseWebApp.webApp]);

  // Request write access for saving diamond images
  const requestImageSaveAccess = useCallback(async () => {
    if (!baseWebApp.webApp?.requestWriteAccess) {
      return false;
    }

    try {
      const granted = await baseWebApp.webApp.requestWriteAccess();
      setHasWriteAccess(granted);
      return granted;
    } catch (error) {
      console.error('Failed to request write access:', error);
      return false;
    }
  }, [baseWebApp.webApp]);

  // Enhanced contact sharing for diamond inquiries
  const shareContact = useCallback(async () => {
    if (!baseWebApp.webApp?.requestContact) {
      return null;
    }

    try {
      const contact = await baseWebApp.webApp.requestContact();
      baseWebApp.hapticFeedback.notification('success');
      return contact;
    } catch (error) {
      console.error('Failed to share contact:', error);
      baseWebApp.hapticFeedback.notification('error');
      return null;
    }
  }, [baseWebApp]);

  // Smart popup for diamond actions
  const showDiamondActionPopup = useCallback((
    diamond: { stockNumber: string; shape: string; carat: number },
    onAction: (action: string) => void
  ) => {
    if (!baseWebApp.webApp?.showPopup) {
      return;
    }

    baseWebApp.webApp.showPopup({
      title: `💎 ${diamond.carat}ct ${diamond.shape}`,
      message: `Stock #${diamond.stockNumber}`,
      buttons: [
        { id: 'contact', type: 'default', text: 'Contact Seller' },
        { id: 'wishlist', type: 'default', text: 'Add to Wishlist' },
        { id: 'share', type: 'default', text: 'Share Diamond' },
        { id: 'cancel', type: 'cancel', text: 'Cancel' }
      ]
    });
  }, [baseWebApp.webApp]);

  // Smart notification for diamond updates
  const showDiamondNotification = useCallback((
    message: string,
    type: 'success' | 'error' | 'warning' = 'success'
  ) => {
    baseWebApp.hapticFeedback.notification(type);
    baseWebApp.showAlert(message);
  }, [baseWebApp]);

  // Read clipboard for diamond specifications
  const readDiamondSpecs = useCallback(async () => {
    if (!baseWebApp.webApp?.readTextFromClipboard) {
      return null;
    }

    try {
      const clipboardText = await baseWebApp.webApp.readTextFromClipboard();
      
      // Try to parse diamond specifications from clipboard
      const diamondPattern = /(\d+\.?\d*)\s*ct.*?(round|princess|cushion|emerald|oval|pear|marquise|radiant|asscher|heart).*?([D-Z]).*?(FL|IF|VVS1|VVS2|VS1|VS2|SI1|SI2|SI3|I1|I2|I3)/i;
      const match = clipboardText.match(diamondPattern);
      
      if (match) {
        return {
          carat: parseFloat(match[1]),
          shape: match[2].toLowerCase(),
          color: match[3].toUpperCase(),
          clarity: match[4].toUpperCase(),
          rawText: clipboardText
        };
      }
      
      return { rawText: clipboardText };
    } catch (error) {
      console.error('Failed to read clipboard:', error);
      return null;
    }
  }, [baseWebApp.webApp]);

  // Enhanced payment integration for diamond purchases
  const initiateDiamondPayment = useCallback((
    diamond: { stockNumber: string; price: number },
    invoiceUrl: string
  ) => {
    if (!baseWebApp.webApp?.openInvoice) {
      // Fallback to regular link
      baseWebApp.openLink(invoiceUrl);
      return;
    }

    baseWebApp.hapticFeedback.impact('medium');
    baseWebApp.webApp.openInvoice(invoiceUrl);
  }, [baseWebApp]);

  return {
    ...baseWebApp,
    // Enhanced features
    scanCertificate,
    requestImageSaveAccess,
    shareContact,
    showDiamondActionPopup,
    showDiamondNotification,
    readDiamondSpecs,
    initiateDiamondPayment,
    // State
    isScanning,
    hasWriteAccess
  };
}