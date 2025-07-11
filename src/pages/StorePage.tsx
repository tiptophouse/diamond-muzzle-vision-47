
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStoreData } from "@/hooks/useStoreData";
import { useStoreFilters } from "@/hooks/useStoreFilters";
import { StoreHeader } from "@/components/store/StoreHeader";
import { PremiumStoreFilters } from "@/components/store/PremiumStoreFilters";
import { StoreGrid } from "@/components/store/StoreGrid";
import { ImageUpload } from "@/components/store/ImageUpload";
import { FloatingShareButton } from "@/components/store/FloatingShareButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Image, ArrowLeft, Sparkles, Crown, Award } from "lucide-react";

export default function StorePage() {
  const { diamonds, loading, error, refetch } = useStoreData();
  const { filters, filteredDiamonds, updateFilter, clearFilters } = useStoreFilters(diamonds || []);
  const [showUpload, setShowUpload] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const navigate = useNavigate();

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleImageUploaded = (imageUrl: string) => {
    console.log('Image uploaded to store:', imageUrl);
    setShowUpload(false);
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Luxury Animated Background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)
          `,
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      />
      
      {/* Floating Geometric Shapes */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        />
        <div 
          className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl animate-pulse delay-1000"
          style={{ transform: `translateY(${scrollY * 0.4}px)` }}
        />
        <div 
          className="absolute bottom-32 left-20 w-40 h-40 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-2000"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        />
      </div>

      {/* Header with Parallax */}
      <div 
        className="relative z-10"
        style={{ transform: `translateY(${scrollY * 0.1}px)` }}
      >
        {/* Navigation */}
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-white/50 backdrop-blur-sm border border-white/20 rounded-full"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Back to Menu</span>
            <span className="sm:hidden">Back</span>
          </Button>
          
          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogTrigger asChild>
              <Button className="premium-button flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Upload Diamond</span>
                <span className="sm:hidden">Upload</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Image className="h-5 w-5" />
                  Upload Diamond Image
                </DialogTitle>
              </DialogHeader>
              <ImageUpload onImageUploaded={handleImageUploaded} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Hero Section */}
        <div className="text-center py-16 px-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 px-6 py-2 rounded-full mb-6">
            <Crown className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-semibold text-purple-800">Premium Diamond Collection</span>
          </div>
          
          <h1 
            className="text-4xl md:text-6xl font-bold mb-6"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 25%, #ec4899 50%, #06b6d4 75%, #8b5cf6 100%)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient-shift 3s ease-in-out infinite'
            }}
          >
            Exquisite Diamonds
          </h1>
          
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Discover our curated collection of certified diamonds, each piece representing 
            the pinnacle of beauty, craftsmanship, and timeless elegance.
          </p>
          
          <div className="flex justify-center items-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-600" />
              <span>GIA Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span>Conflict-Free</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-600" />
              <span>Premium Quality</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 lg:px-8 space-y-8">
          {/* Filters Section */}
          <div 
            className="sticky top-4 z-30"
            style={{ transform: `translateY(${scrollY * 0.05}px)` }}
          >
            <div className="premium-card bg-white/80 backdrop-blur-2xl border border-white/30 shadow-2xl">
              <PremiumStoreFilters
                filters={filters}
                onUpdateFilter={updateFilter}
                onClearFilters={clearFilters}
                diamonds={diamonds || []}
              />
            </div>
          </div>

          {/* Collection Header */}
          <div className="text-center py-8">
            <StoreHeader 
              totalDiamonds={filteredDiamonds.length}
              onOpenFilters={() => {}}
            />
          </div>

          {/* Diamond Grid */}
          <div className="pb-20">
            <StoreGrid
              diamonds={filteredDiamonds}
              loading={loading}
              error={error}
              onUpdate={refetch}
            />
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <FloatingShareButton />
      
    </div>
  );
}

