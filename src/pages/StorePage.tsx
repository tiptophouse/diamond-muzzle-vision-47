
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStoreData } from "@/hooks/useStoreData";
import { useStoreFilters } from "@/hooks/useStoreFilters";
import { SimpleDiamondViewer } from "@/components/store/SimpleDiamondViewer";
import { MobilePullToRefresh } from "@/components/mobile/MobilePullToRefresh";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Image, ArrowLeft } from "lucide-react";
import { toast } from 'sonner';

export default function StorePage() {
  const { diamonds, loading, error, refetch } = useStoreData();
  const { filters, filteredDiamonds, updateFilter, clearFilters } = useStoreFilters(diamonds || []);
  const [showUpload, setShowUpload] = useState(false);
  const [searchParams] = useSearchParams();
  const stockNumber = searchParams.get('stock');
  const { selectionChanged } = useTelegramHapticFeedback();

  const navigate = useNavigate();

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      await refetch();
      toast.success('Store refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh store');
      throw error;
    }
  }, [refetch]);

  // Filter to specific diamond if URL parameters are provided
  const finalFilteredDiamonds = (() => {
    if (stockNumber) {
      const stockMatch = filteredDiamonds.filter(diamond => 
        diamond.stockNumber === stockNumber
      );
      if (stockMatch.length > 0) {
        console.log('🔍 Found diamond by stock number:', stockNumber, stockMatch);
        return stockMatch;
      }
    }
    
    // If no stock match or no stock parameter, check other URL parameters for filtering
    const carat = searchParams.get('carat');
    const color = searchParams.get('color');
    const clarity = searchParams.get('clarity');
    const shape = searchParams.get('shape');
    
    if (carat || color || clarity || shape) {
      const paramMatch = filteredDiamonds.filter(diamond => {
        const matches = [];
        if (carat) matches.push(Math.abs(diamond.carat - parseFloat(carat)) < 0.01);
        if (color) matches.push(diamond.color === color);
        if (clarity) matches.push(diamond.clarity === clarity);
        if (shape) matches.push(diamond.shape === shape);
        return matches.every(match => match);
      });
      
      if (paramMatch.length > 0) {
        console.log('🔍 Found diamond by parameters:', { carat, color, clarity, shape }, paramMatch);
        return paramMatch;
      }
    }
    
    return filteredDiamonds;
  })();

  // Auto-scroll to diamond if found via stock parameter
  useEffect(() => {
    if (stockNumber && finalFilteredDiamonds.length > 0) {
      // Small delay to ensure the component is rendered
      setTimeout(() => {
        const element = document.getElementById(`diamond-${stockNumber}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [stockNumber, finalFilteredDiamonds]);

  const handleImageUploaded = (imageUrl: string) => {
    console.log('Image uploaded to store:', imageUrl);
    setShowUpload(false);
    selectionChanged(); // Add haptic feedback
    toast.success('Image uploaded successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-red-500 mb-2">Error loading diamonds</div>
          <button onClick={() => refetch()} className="text-orange-500">Try again</button>
        </div>
      </div>
    );
  }

  if (!finalFilteredDiamonds.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-slate-500 mb-4">No diamonds available</div>
          <Button
            variant="ghost"
            onClick={() => {
              selectionChanged();
              navigate('/dashboard');
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Menu
          </Button>
        </div>
      </div>
    );
  }

  // Show only the first diamond in a simplified view
  const currentDiamond = finalFilteredDiamonds[0];

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => {
            selectionChanged();
            navigate('/dashboard');
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Simple Diamond Viewer - Centered */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <SimpleDiamondViewer diamond={currentDiamond} />
      </div>
    </div>
  );
}

