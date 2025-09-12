/**
 * Performance utilities for Telegram Mini App optimization
 */

export interface PerformanceThresholds {
  memory: number;        // MB
  frameRate: number;     // FPS
  renderTime: number;    // ms
  batteryLevel?: number; // 0-1
}

export const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  memory: 100,          // 100MB
  frameRate: 30,        // 30 FPS
  renderTime: 16.67,    // 60 FPS = 16.67ms per frame
  batteryLevel: 0.2,    // 20%
};

export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private renderTimes: number[] = [];
  private memoryUsage = 0;

  updateFrame(): void {
    const now = performance.now();
    const delta = now - this.lastTime;
    
    this.frameCount++;
    this.renderTimes.push(delta);
    
    // Keep only last 60 frames
    if (this.renderTimes.length > 60) {
      this.renderTimes = this.renderTimes.slice(-60);
    }
    
    // Calculate FPS every second
    if (delta >= 1000) {
      this.fps = (this.frameCount * 1000) / delta;
      this.frameCount = 0;
      this.lastTime = now;
    }
  }

  getPerformanceMetrics() {
    const avgRenderTime = this.renderTimes.length > 0 
      ? this.renderTimes.reduce((a, b) => a + b, 0) / this.renderTimes.length 
      : 0;

    // Memory usage (if available)
    if ('memory' in performance) {
      this.memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024;
    }

    return {
      fps: this.fps,
      avgRenderTime,
      memoryUsage: this.memoryUsage,
      renderTimes: [...this.renderTimes]
    };
  }

  shouldReduceQuality(thresholds: PerformanceThresholds = DEFAULT_THRESHOLDS): boolean {
    const metrics = this.getPerformanceMetrics();
    
    return (
      metrics.fps < thresholds.frameRate ||
      metrics.avgRenderTime > thresholds.renderTime ||
      metrics.memoryUsage > thresholds.memory
    );
  }
}

export const globalPerformanceMonitor = new PerformanceMonitor();

export function isMobileDevice(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < 768;
}

export function isLowPowerDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  // Check for low-end device indicators
  const hardwareConcurrency = navigator.hardwareConcurrency || 1;
  const deviceMemory = (navigator as any).deviceMemory || 2;
  
  return hardwareConcurrency <= 2 || deviceMemory <= 2;
}

export function getBatteryLevel(): Promise<number> {
  return new Promise((resolve) => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        resolve(battery.level);
      }).catch(() => resolve(1)); // Assume full battery if unavailable
    } else {
      resolve(1);
    }
  });
}

export function getOptimizedSettings() {
  const isMobile = isMobileDevice();
  const isLowPower = isLowPowerDevice();
  
  return {
    particleCount: isMobile ? 50 : isLowPower ? 150 : 300,
    maxLights: isMobile ? 1 : 2,
    shadowsEnabled: !isMobile && !isLowPower,
    antialiasEnabled: !isMobile,
    maxRenderDistance: isMobile ? 30 : 50,
    animationSpeed: isMobile ? 0.5 : 1,
    effectsEnabled: !isMobile,
  };
}
