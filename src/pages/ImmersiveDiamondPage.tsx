/**
 * Immersive Diamond Viewing Page
 * Full-screen diamond viewer with motion controls
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStoreData } from '@/hooks/useStoreData';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { ImmersiveDiamondViewer } from '@/components/store/ImmersiveDiamondViewer';
import { Loader2 } from 'lucide-react';

export default function ImmersiveDiamondPage() {
  const { stockNumber } = useParams<{ stockNumber: string }>();
  const navigate = useNavigate();
  const { diamonds, loading } = useStoreData();
  const { user } = useTelegramAuth();
  const { isAdmin } = useIsAdmin();
  const [diamond, setDiamond] = useState<any>(null);

  useEffect(() => {
    if (!loading && diamonds && stockNumber) {
      const found = diamonds.find(d => d.stockNumber === stockNumber);
      if (found) {
        setDiamond(found);
      } else {
        navigate('/store');
      }
    }
  }, [diamonds, loading, stockNumber, navigate]);

  if (loading || !diamond) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p>Loading diamond...</p>
        </div>
      </div>
    );
  }

  return (
    <ImmersiveDiamondViewer
      diamond={diamond}
      isOwner={isAdmin}
      onBack={() => navigate(-1)}
    />
  );
}
