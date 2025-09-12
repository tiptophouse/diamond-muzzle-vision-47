import React, { Suspense, useRef, useMemo, useCallback, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Text, 
  Sphere, 
  Box, 
  Environment, 
  Sparkles,
  Float,
  MeshWobbleMaterial,
  useTexture,
  Billboard,
  Html,
  Trail,
  PointMaterial
} from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTelegramHeatMapIntegration } from '@/hooks/useTelegramHeatMapIntegration';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { getTelegramWebApp } from '@/utils/telegramWebApp';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { HeatMapFallback } from './HeatMapFallback';

interface DiamondHeatData {
  id: string;
  shape: string;
  carat: number;
  price: number;
  notificationCount: number;
  lastInteraction: Date;
  interestLevel: 'low' | 'medium' | 'high';
  stockNumber?: string;
  color?: string;
  clarity?: string;
}

interface Advanced3DHeatMapProps {
  diamonds: DiamondHeatData[];
  onDiamondSelect?: (diamond: DiamondHeatData) => void;
  height?: number;
  interactive?: boolean;
}

// 3D Diamond Geometry Component
function DiamondGeometry({ 
  diamond, 
  position, 
  onClick,
  isSelected 
}: { 
  diamond: DiamondHeatData;
  position: [number, number, number];
  onClick: () => void;
  isSelected: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  // Dynamic colors based on interest level and selection
  const { color, emissive, intensity } = useMemo(() => {
    const baseColors = {
      high: { color: '#ff3333', emissive: '#ff0000', intensity: 0.8 },
      medium: { color: '#ff8800', emissive: '#ff4400', intensity: 0.6 },
      low: { color: '#3388ff', emissive: '#0066ff', intensity: 0.4 }
    };
    
    const selected = isSelected ? { intensity: 1.2, emissive: '#ffffff' } : {};
    const hover = hovered ? { intensity: 1.1 } : {};
    
    return {
      ...baseColors[diamond.interestLevel],
      ...selected,
      ...hover
    };
  }, [diamond.interestLevel, isSelected, hovered]);

  // Simplified animation for mobile performance
  useFrame((state) => {
    if (meshRef.current && !isMobile) {
      const time = state.clock.getElapsedTime();
      const heightMultiplier = diamond.interestLevel === 'high' ? 1.5 : 1;
      
      // Reduced floating animation
      meshRef.current.position.y = position[1] + Math.sin(time + position[0]) * 0.05 * heightMultiplier;
      
      // Slower rotation
      meshRef.current.rotation.y += 0.005 * intensity;
      
      // Reduced pulsing for high interest diamonds
      if (diamond.interestLevel === 'high') {
        const pulse = 1 + Math.sin(time * 2) * 0.05;
        meshRef.current.scale.setScalar(pulse);
      }
    }
  });

  // Simplified diamond geometry for better performance
  const diamondGeometry = useMemo(() => {
    const geometry = new THREE.ConeGeometry(0.25, 0.6, 6); // Reduced complexity
    return geometry;
  }, []);

  // Cleanup geometry on unmount
  useEffect(() => {
    return () => {
      if (diamondGeometry) {
        diamondGeometry.dispose();
      }
    };
  }, [diamondGeometry]);

  return (
    <Float speed={isMobile ? 1 : 2} rotationIntensity={isMobile ? 0.2 : 0.5} floatIntensity={intensity / 4}>
      <mesh
        ref={meshRef}
        position={position}
        geometry={diamondGeometry}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Simplified material for mobile performance */}
        {isMobile ? (
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={intensity * 0.2}
            roughness={0.3}
            metalness={0.7}
            transparent
            opacity={0.9}
          />
        ) : (
          <MeshWobbleMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={intensity * 0.3}
            roughness={0.1}
            metalness={0.8}
            factor={0.1}
            speed={2}
            transparent
            opacity={0.9}
          />
        )}
        
        {/* Reduced effects for mobile performance */}
        {!isMobile && diamond.interestLevel === 'high' && (
          <Sparkles 
            count={10}
            scale={1.5}
            size={2}
            speed={0.2}
            opacity={0.4}
            color={color}
          />
        )}
      </mesh>
      
      {/* Simplified info display for mobile */}
      {(hovered || isSelected) && !isMobile && (
        <Billboard position={[position[0], position[1] + 0.8, position[2]]}>
          <Html center>
            <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded px-2 py-1 text-white text-xs">
              <div className="font-medium">{diamond.shape} {diamond.carat}ct</div>
              <div className="text-green-400">${diamond.price.toLocaleString()}</div>
            </div>
          </Html>
        </Billboard>
      )}
    </Float>
  );
}

// Optimized Particle System for Mobile Performance
function BackgroundParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  
  // Reduce particle count for mobile performance
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const particleCount = isMobile ? 100 : 300; // Reduced from 1000
  
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 15; // Reduced range
      pos[i + 1] = (Math.random() - 0.5) * 15;
      pos[i + 2] = (Math.random() - 0.5) * 15;
    }
    return pos;
  }, [particleCount]);

  useFrame((state) => {
    if (particlesRef.current) {
      // Slower, less intensive animation
      particlesRef.current.rotation.y += 0.0005;
      particlesRef.current.rotation.x += 0.0002;
    }
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (particlesRef.current) {
        particlesRef.current.geometry?.dispose();
        if (particlesRef.current.material && 'dispose' in particlesRef.current.material) {
          (particlesRef.current.material as any).dispose();
        }
      }
    };
  }, []);

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <PointMaterial 
        size={0.005} 
        color="#ffffff" 
        transparent 
        opacity={0.2}
        sizeAttenuation={false}
      />
    </points>
  );
}

// Camera Controller with Telegram-optimized controls
function CameraController({ diamonds }: { diamonds: DiamondHeatData[] }) {
  const { camera } = useThree();
  const controlsRef = useRef<any>();
  
  useEffect(() => {
    // Auto-fit camera to diamonds
    if (diamonds.length > 0 && camera) {
      const box = new THREE.Box3();
      diamonds.forEach((_, index) => {
        const x = (index % 10) - 5;
        const z = Math.floor(index / 10) - 5;
        box.expandByPoint(new THREE.Vector3(x, 0, z));
      });
      
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxSize = Math.max(size.x, size.y, size.z);
      
      camera.position.set(
        center.x + maxSize * 1.5,
        center.y + maxSize * 1.5,
        center.z + maxSize * 1.5
      );
      
      if (controlsRef.current) {
        controlsRef.current.target.copy(center);
        controlsRef.current.update();
      }
    }
  }, [diamonds, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={3}
      maxDistance={20}
      minPolarAngle={0}
      maxPolarAngle={Math.PI}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
      panSpeed={0.8}
      dampingFactor={0.1}
      enableDamping
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN
      }}
    />
  );
}

// Main 3D Scene
function Scene3D({ diamonds, onDiamondSelect }: {
  diamonds: DiamondHeatData[];
  onDiamondSelect?: (diamond: DiamondHeatData) => void;
}) {
  const [selectedDiamondId, setSelectedDiamondId] = useState<string | null>(null);
  const { impactOccurred, selectionChanged } = useTelegramHapticFeedback();
  
  const handleDiamondClick = useCallback((diamond: DiamondHeatData) => {
    // Telegram haptic feedback
    if (diamond.interestLevel === 'high') {
      impactOccurred('heavy');
    } else if (diamond.interestLevel === 'medium') {
      impactOccurred('medium');
    } else {
      selectionChanged();
    }
    
    setSelectedDiamondId(diamond.id);
    onDiamondSelect?.(diamond);
  }, [impactOccurred, selectionChanged, onDiamondSelect]);

  // Create grid positions for diamonds
  const diamondPositions = useMemo(() => {
    return diamonds.map((_, index) => {
      const x = (index % 10) - 5;
      const z = Math.floor(index / 10) - 5;
      const y = 0;
      return [x, y, z] as [number, number, number];
    });
  }, [diamonds]);

  return (
    <>
      {/* Background */}
      <color attach="background" args={['#0a0a0a']} />
      <fog attach="fog" args={['#0a0a0a', 10, 50]} />
      
      {/* Simplified lighting for mobile performance */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={0.8}
        castShadow={false}
      />
      
      {/* Environment */}
      <Environment preset="night" />
      
      {/* Background particles */}
      <BackgroundParticles />
      
      {/* Diamond grid */}
      {diamonds.map((diamond, index) => (
        <DiamondGeometry
          key={diamond.id}
          diamond={diamond}
          position={diamondPositions[index]}
          onClick={() => handleDiamondClick(diamond)}
          isSelected={selectedDiamondId === diamond.id}
        />
      ))}
      
      {/* Ground plane */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          color="#111111" 
          transparent 
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Camera controls */}
      <CameraController diamonds={diamonds} />
    </>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading 3D Heat Map...</p>
      </div>
    </div>
  );
}

export function Advanced3DHeatMap({ 
  diamonds, 
  onDiamondSelect, 
  height = 600,
  interactive = true 
}: Advanced3DHeatMapProps) {
  const { 
    onHeatMapCellTap, 
    configureHeatMapNavigation,
    sendHeatMapReport 
  } = useTelegramHeatMapIntegration();
  
  // Configure Telegram WebApp for 3D interaction with proper cleanup
  useEffect(() => {
    const tg = getTelegramWebApp();
    if (tg && (tg as any).MainButton) {
      // Optimize for 3D rendering
      tg.expand();
      
      // Configure main button with type assertion
      const mainButton = (tg as any).MainButton;
      mainButton.text = '📊 View Heat Map Report';
      mainButton.color = '#3390ec';
      mainButton.show();
      
      const handleMainButtonClick = () => {
        try {
          sendHeatMapReport(diamonds);
        } catch (error) {
          console.error('Heat map report error:', error);
        }
      };
      
      mainButton.onClick(handleMainButtonClick);
      
      return () => {
        try {
          if (mainButton) {
            mainButton.hide();
            if (mainButton.offClick) {
              mainButton.offClick(handleMainButtonClick);
            }
          }
        } catch (error) {
          console.warn('Cleanup error:', error);
        }
      };
    }
  }, [diamonds, sendHeatMapReport]);

  // Enhanced mobile optimization
  const canvasProps = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    return {
      dpr: (isMobile ? [1, 1.5] : [1, 2]) as [number, number],
      performance: { min: isMobile ? 0.3 : 0.5 },
      gl: { 
        antialias: !isMobile,
        powerPreference: 'high-performance' as const,
        alpha: false,
        stencil: false,
        depth: true,
      },
      camera: { 
        fov: 60, 
        near: 0.1, 
        far: 50,
        position: [6, 6, 6] as [number, number, number]
      },
      shadows: false,
    };
  }, []);

  if (!diamonds.length) {
    return (
      <div className="flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-lg" style={{ height }}>
        <div className="text-center">
          <div className="text-4xl mb-4">💎</div>
          <p className="text-lg mb-2">No Heat Map Data</p>
          <p className="text-sm text-slate-400">Diamonds will appear here as customers interact</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary 
      fallback={<HeatMapFallback diamonds={diamonds} onDiamondSelect={onDiamondSelect} height={height} />}
      onError={(error) => {
        console.error('3D Heat Map Error:', error);
        // Report crash to performance monitor
        if (typeof window !== 'undefined' && 'performance' in window) {
          (window as any).telegramPerformanceMonitor?.recordMetric('3d_crash', 1, { error: error.message });
        }
      }}
    >
      <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ height }}>
        {/* Performance indicator */}
        <div className="absolute top-4 left-4 z-10">
          <Badge variant="outline" className="bg-black/50 text-white border-white/20">
            3D Heat Map • {diamonds.length} Diamonds
          </Badge>
        </div>
        
        {/* Simplified controls help for mobile */}
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2 text-white text-xs">
            <div>🖱️ Drag to rotate</div>
            <div>🔍 Pinch to zoom</div>
          </div>
        </div>
        
        {/* Compact stats overlay */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2 text-white text-xs space-y-1">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded"></div>
              <span>{diamonds.filter(d => d.interestLevel === 'high').length}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-400 rounded"></div>
              <span>{diamonds.filter(d => d.interestLevel === 'medium').length}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded"></div>
              <span>{diamonds.filter(d => d.interestLevel === 'low').length}</span>
            </div>
          </div>
        </div>
        
        <Canvas {...canvasProps}>
          <Suspense fallback={null}>
            <Scene3D diamonds={diamonds} onDiamondSelect={onDiamondSelect} />
          </Suspense>
        </Canvas>
      </div>
    </ErrorBoundary>
  );
}