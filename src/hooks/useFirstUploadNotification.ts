import { useEffect, createElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useInventoryData } from './useInventoryData';
import { ToastAction } from '@/components/ui/toast';

export function useFirstUploadNotification() {
  const { user } = useTelegramAuth();
  const { diamonds, loading } = useInventoryData();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || loading) return;

    // Check if user has no diamonds after data loads
    if (diamonds.length === 0) {
      const timer = setTimeout(() => {
        toast({
          title: "🎯 בואו נתחיל!",
          description: "אני אלמד אותך איך להעלות את היהלום הראשון שלך - לחץ כאן לסריקת תעודה",
          duration: 8000,
          onClick: () => navigate('/upload-single-stone?action=scan'),
        });
      }, 3000); // Show notification after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [user, diamonds.length, loading, toast, navigate]);
}