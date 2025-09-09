import { useState, useEffect, useCallback } from 'react';
import { useAdvancedTelegramSDK } from './useAdvancedTelegramSDK';

interface PerformanceData {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  apiResponseTimes: number[];
  cacheHitRatio: number;
  fps: number;
}

interface OptimizationSuggestions {
  type: 'memory' | 'network' | 'render' | 'cache';
  message: string;
  impact: 'low' | 'medium' | 'high';
}

export function useTelegramPerformance() {
  const { performanceMetrics, utils } = useAdvancedTelegramSDK();
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    apiResponseTimes: [],
    cacheHitRatio: 0,
    fps: 60
  });
  
  const [suggestions, setSuggestions] = useState<OptimizationSuggestions[]>([]);
  const [isOptimized, setIsOptimized] = useState(false);

  // Monitor performance metrics
  useEffect(() => {
    const updatePerformance = utils.throttle(() => {
      // Memory monitoring
      const memory = (performance as any).memory;
      const memoryUsage = memory ? memory.usedJSHeapSize / 1048576 : 0; // MB

      // FPS monitoring
      let fps = 60;
      let lastTime = performance.now();
      let frameCount = 0;

      function measureFPS() {
        frameCount++;
        const currentTime = performance.now();
        if (currentTime - lastTime >= 1000) {
          fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
          frameCount = 0;
          lastTime = currentTime;
        }
        requestAnimationFrame(measureFPS);
      }
      measureFPS();

      setPerformanceData(prev => ({
        ...prev,
        loadTime: performanceMetrics.loadTime,
        renderTime: performanceMetrics.renderTime,
        memoryUsage,
        cacheHitRatio: performanceMetrics.cacheHits / Math.max(performanceMetrics.apiCalls, 1) * 100,
        fps
      }));
    }, 1000);

    const interval = setInterval(updatePerformance, 5000);
    updatePerformance(); // Initial call

    return () => clearInterval(interval);
  }, [performanceMetrics, utils]);

  // Generate optimization suggestions
  useEffect(() => {
    const newSuggestions: OptimizationSuggestions[] = [];

    if (performanceData.loadTime > 2000) {
      newSuggestions.push({
        type: 'network',
        message: 'App load time is slow. Consider code splitting and lazy loading.',
        impact: 'high'
      });
    }

    if (performanceData.memoryUsage > 50) {
      newSuggestions.push({
        type: 'memory',
        message: 'High memory usage detected. Consider cleaning up unused resources.',
        impact: 'medium'
      });
    }

    if (performanceData.cacheHitRatio < 70) {
      newSuggestions.push({
        type: 'cache',
        message: 'Low cache hit ratio. Implement better caching strategies.',
        impact: 'medium'
      });
    }

    if (performanceData.fps < 50) {
      newSuggestions.push({
        type: 'render',
        message: 'Low FPS detected. Optimize animations and rendering.',
        impact: 'high'
      });
    }

    setSuggestions(newSuggestions);
    setIsOptimized(newSuggestions.length === 0);
  }, [performanceData]);

  // Performance optimization actions
  const optimizePerformance = useCallback(() => {
    // Clear old caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }

    // Force garbage collection if available
    if ((window as any).gc) {
      (window as any).gc();
    }

    // Optimize images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.complete || img.naturalWidth === 0) {
        img.loading = 'lazy';
      }
    });

    console.log('🚀 Performance optimization completed');
  }, []);

  const measureApiCall = useCallback((responseTime: number) => {
    setPerformanceData(prev => ({
      ...prev,
      apiResponseTimes: [...prev.apiResponseTimes.slice(-9), responseTime] // Keep last 10
    }));
  }, []);

  const getPerformanceScore = useCallback(() => {
    let score = 100;
    
    if (performanceData.loadTime > 2000) score -= 20;
    if (performanceData.memoryUsage > 50) score -= 15;
    if (performanceData.cacheHitRatio < 70) score -= 15;
    if (performanceData.fps < 50) score -= 25;
    if (performanceData.renderTime > 16) score -= 15; // 60fps = 16.67ms per frame
    
    const avgApiTime = performanceData.apiResponseTimes.reduce((a, b) => a + b, 0) / performanceData.apiResponseTimes.length;
    if (avgApiTime > 1000) score -= 10;

    return Math.max(0, score);
  }, [performanceData]);

  return {
    performanceData,
    suggestions,
    isOptimized,
    optimizePerformance,
    measureApiCall,
    getPerformanceScore,
    // Real-time metrics
    metrics: {
      score: getPerformanceScore(),
      isGood: getPerformanceScore() > 80,
      needsOptimization: suggestions.length > 0
    }
  };
}