import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Advanced3DHeatMap } from '@/components/heatmap/Advanced3DHeatMap';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { useTelegramNavigation } from '@/hooks/useTelegramNavigation';
import { 
  ArrowLeft, 
  Zap, 
  Box, 
  Sparkles, 
  Eye, 
  TrendingUp, 
  BarChart3,
  RefreshCw,
  Maximize,
  Settings,
  Play,
  Pause
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock data generator for demonstration
const generateMockHeatMapData = (count: number = 25) => {
  const shapes = ['Round', 'Princess', 'Emerald', 'Oval', 'Cushion', 'Pear', 'Marquise', 'Radiant'];
  const colors = ['D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const clarities = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2'];
  const interestLevels = ['low', 'medium', 'high'] as const;
  
  return Array.from({ length: count }, (_, index) => ({
    id: `demo-diamond-${index}`,
    stockNumber: `DEMO-${(index + 1).toString().padStart(3, '0')}`,
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    carat: Math.random() * 3 + 0.5,
    color: colors[Math.floor(Math.random() * colors.length)],
    clarity: clarities[Math.floor(Math.random() * clarities.length)],
    price: Math.floor(Math.random() * 50000) + 5000,
    notificationCount: Math.floor(Math.random() * 100) + 1,
    lastInteraction: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    interestLevel: interestLevels[Math.floor(Math.random() * interestLevels.length)]
  }));
};

export default function HeatMap3DDemo() {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedDiamond, setSelectedDiamond] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'showcase' | 'interactive' | 'analytics'>('showcase');
  const [diamondCount, setDiamondCount] = useState(25);
  
  const { impactOccurred, selectionChanged, notificationOccurred } = useTelegramHapticFeedback();
  
  // Setup Telegram navigation
  const { navigateWithFeedback } = useTelegramNavigation({
    showBackButton: true,
    enableHapticFeedback: true
  });

  // Generate demo data
  const demoData = useMemo(() => 
    generateMockHeatMapData(diamondCount), 
    [diamondCount]
  );

  // Calculate stats
  const stats = useMemo(() => {
    const hotDiamonds = demoData.filter(d => d.interestLevel === 'high').length;
    const mediumDiamonds = demoData.filter(d => d.interestLevel === 'medium').length;
    const lowDiamonds = demoData.filter(d => d.interestLevel === 'low').length;
    const totalViews = demoData.reduce((sum, d) => sum + d.notificationCount, 0);
    const avgPrice = demoData.reduce((sum, d) => sum + d.price, 0) / demoData.length;
    
    return {
      total: demoData.length,
      hot: hotDiamonds,
      medium: mediumDiamonds,
      low: lowDiamonds,
      totalViews,
      avgPrice: Math.round(avgPrice)
    };
  }, [demoData]);

  // Configure Telegram main button using WebApp directly
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.MainButton) {
      tg.MainButton.text = '🚀 Experience in My Store';
      tg.MainButton.show();
      
      const handleClick = () => {
        impactOccurred('heavy');
        navigate('/');
      };
      
      tg.MainButton.onClick(handleClick);
      
      return () => {
        tg.MainButton.hide();
        tg.MainButton.offClick(handleClick);
      };
    }
  }, [impactOccurred, navigate]);

  // Auto-refresh demo data
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setDiamondCount(prev => {
        const newCount = Math.max(10, Math.min(50, prev + (Math.random() > 0.5 ? 1 : -1)));
        return newCount;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleDiamondSelect = (diamond: any) => {
    setSelectedDiamond(diamond);
    
    // Different haptic feedback based on interest level
    switch (diamond.interestLevel) {
      case 'high':
        impactOccurred('heavy');
        break;
      case 'medium':
        impactOccurred('medium');
        break;
      default:
        selectionChanged();
    }
  };

  const handleViewModeChange = (mode: typeof viewMode) => {
    setViewMode(mode);
    selectionChanged();
  };

  const handleRefreshData = () => {
    setDiamondCount(prev => Math.max(10, Math.min(50, prev + Math.floor(Math.random() * 10) - 5)));
    notificationOccurred('success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant={isPlaying ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setIsPlaying(!isPlaying);
                selectionChanged();
              }}
              className="h-8"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshData}
              className="h-8"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            3D Heat Map Demo
          </h1>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <Zap className="h-3 w-3 mr-1" />
              Level 2000
            </Badge>
            <Badge variant="outline" className="border-purple-400 text-purple-300">
              <Box className="h-3 w-3 mr-1" />
              Advanced 3D
            </Badge>
          </div>
          <p className="text-slate-300 text-sm">
            Experience the future of diamond visualization with interactive 3D heat maps
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center gap-2 mb-6">
          {(['showcase', 'interactive', 'analytics'] as const).map((mode) => (
            <Button
              key={mode}
              variant={viewMode === mode ? "default" : "outline"}
              size="sm"
              onClick={() => handleViewModeChange(mode)}
              className={viewMode === mode ? "bg-gradient-to-r from-purple-600 to-pink-600" : ""}
            >
              {mode === 'showcase' && <Sparkles className="h-4 w-4 mr-1" />}
              {mode === 'interactive' && <Box className="h-4 w-4 mr-1" />}
              {mode === 'analytics' && <BarChart3 className="h-4 w-4 mr-1" />}
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.total}</div>
            <div className="text-xs text-slate-400">Total Diamonds</div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/40 border-red-500/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{stats.hot}</div>
            <div className="text-xs text-slate-400">🔥 Hot</div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">{stats.medium}</div>
            <div className="text-xs text-slate-400">⚡ Medium</div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.totalViews}</div>
            <div className="text-xs text-slate-400">👁️ Total Views</div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/40 border-green-500/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">${(stats.avgPrice / 1000).toFixed(0)}K</div>
            <div className="text-xs text-slate-400">💎 Avg Price</div>
          </CardContent>
        </Card>
      </div>

      {/* Main 3D Heat Map */}
      <Card className="bg-black/20 border-purple-500/30 backdrop-blur-sm mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Box className="h-5 w-5 text-purple-400" />
            Advanced 3D Heat Map Visualization
            {isPlaying && (
              <Badge variant="secondary" className="ml-2 bg-green-600/20 text-green-400 border-green-600/30">
                🔄 Live
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-slate-300">
            {viewMode === 'showcase' && "Showcasing floating diamonds with dynamic lighting and particle effects"}
            {viewMode === 'interactive' && "Click and drag to explore your diamonds in 3D space"}
            {viewMode === 'analytics' && "Real-time visualization of customer interest patterns"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Advanced3DHeatMap
            diamonds={demoData}
            onDiamondSelect={handleDiamondSelect}
            height={600}
            interactive={true}
          />
        </CardContent>
      </Card>

      {/* Selected Diamond Details */}
      {selectedDiamond && (
        <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-400" />
              Selected Diamond Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-slate-400">Stock #</div>
                <div className="font-mono text-white">{selectedDiamond.stockNumber}</div>
              </div>
              <div>
                <div className="text-slate-400">Shape</div>
                <div className="text-white">{selectedDiamond.shape}</div>
              </div>
              <div>
                <div className="text-slate-400">Carat</div>
                <div className="text-white">{selectedDiamond.carat.toFixed(2)}ct</div>
              </div>
              <div>
                <div className="text-slate-400">Price</div>
                <div className="text-green-400 font-bold">${selectedDiamond.price.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-slate-400">Color</div>
                <div className="text-white">{selectedDiamond.color}</div>
              </div>
              <div>
                <div className="text-slate-400">Clarity</div>
                <div className="text-white">{selectedDiamond.clarity}</div>
              </div>
              <div>
                <div className="text-slate-400">Interest Level</div>
                <Badge 
                  className={
                    selectedDiamond.interestLevel === 'high' ? 'bg-red-600' :
                    selectedDiamond.interestLevel === 'medium' ? 'bg-orange-600' : 'bg-blue-600'
                  }
                >
                  {selectedDiamond.interestLevel === 'high' && '🔥'}
                  {selectedDiamond.interestLevel === 'medium' && '⚡'}
                  {selectedDiamond.interestLevel === 'low' && '💎'}
                  {selectedDiamond.interestLevel.charAt(0).toUpperCase() + selectedDiamond.interestLevel.slice(1)}
                </Badge>
              </div>
              <div>
                <div className="text-slate-400">Views</div>
                <div className="text-blue-400">{selectedDiamond.notificationCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Highlights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30">
          <CardContent className="p-4 text-center">
            <Sparkles className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <h3 className="font-semibold text-white mb-1">Dynamic Effects</h3>
            <p className="text-xs text-slate-300">Floating animations, particle systems, and dynamic lighting</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-500/30">
          <CardContent className="p-4 text-center">
            <Box className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <h3 className="font-semibold text-white mb-1">3D Interaction</h3>
            <p className="text-xs text-slate-300">Touch controls optimized for mobile with haptic feedback</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-500/30">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <h3 className="font-semibold text-white mb-1">Real-time Analytics</h3>
            <p className="text-xs text-slate-300">Live data visualization with instant updates</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}