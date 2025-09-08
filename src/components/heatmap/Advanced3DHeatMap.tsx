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
  const [visible, setVisible] = useState(true);
  
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

  // Animation based on interest level
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const heightMultiplier = diamond.interestLevel === 'high' ? 2 : 
                              diamond.interestLevel === 'medium' ? 1.5 : 1;
      
      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(time * 2 + position[0]) * 0.1 * heightMultiplier;
      
      // Rotation based on interest
      meshRef.current.rotation.y += 0.01 * intensity;
      meshRef.current.rotation.x = Math.sin(time + position[0]) * 0.1;
      
      // Pulsing scale for high interest diamonds
      if (diamond.interestLevel === 'high') {
        const pulse = 1 + Math.sin(time * 4) * 0.1;
        meshRef.current.scale.setScalar(pulse);
      }
    }
  });

  // Create diamond shape geometry
  const diamondGeometry = useMemo(() => {
    const geometry = new THREE.ConeGeometry(0.3, 0.8, 8);
    const topGeometry = new THREE.ConeGeometry(0.3, 0.4, 8);
    topGeometry.rotateX(Math.PI);
    topGeometry.translate(0, 0.6, 0);
    
    const mergedGeometry = new THREE.BufferGeometry();
    const merged = [geometry, topGeometry];
    mergedGeometry.copy(geometry);
    
    return mergedGeometry;
  }, []);

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={intensity / 2}>
      <mesh
        ref={meshRef}
        position={position}
        geometry={diamondGeometry}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        visible={visible}
      >
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
        
        {/* Sparkles effect for high interest diamonds */}
        {diamond.interestLevel === 'high' && (
          <Sparkles 
            count={20} 
            scale={2} 
            size={3} 
            speed={0.4}
            opacity={0.6}
            color={color}
          />
        )}
        
        {/* Trail effect for selected diamond */}
        {isSelected && (
          <Trail width={2} length={6} color={emissive} attenuation={(t) => t * t}>
            <Box args={[0.1, 0.1, 0.1]}>
              <meshBasicMaterial color={emissive} />
            </Box>
          </Trail>
        )}
      </mesh>
      
      {/* Info billboard */}
      {(hovered || isSelected) && (
        <Billboard position={[position[0], position[1] + 1, position[2]]}>
          <Html center>
            <Card className="w-48 bg-black/80 backdrop-blur-sm border-white/20">
              <CardContent className="p-2 text-white text-xs">
                <div className="flex justify-between items-center mb-1">
                  <Badge variant="outline" className="text-xs">
                    {diamond.shape}
                  </Badge>
                  <span className="text-yellow-400">{diamond.carat}ct</span>
                </div>
                <div className="text-green-400 font-bold">
                  ${diamond.price.toLocaleString()}
                </div>
                <div className="flex justify-between mt-1 text-gray-300">
                  <span>Views: {diamond.notificationCount}</span>
                  <span className="capitalize">{diamond.interestLevel}</span>
                </div>
              </CardContent>
            </Card>
          </Html>
        </Billboard>
      )}
    </Float>
  );
}

// Particle System for Background Effect
function BackgroundParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particleCount = 1000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 20;
      pos[i + 1] = (Math.random() - 0.5) * 20;
      pos[i + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.001;
      particlesRef.current.rotation.x += 0.0005;
    }
  });

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
        size={0.01} 
        color="#ffffff" 
        transparent 
        opacity={0.3}
        sizeAttenuation
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
      
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#3388ff" />
      <pointLight position={[10, -10, 10]} intensity={0.3} color="#ff3333" />
      
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
  
  // Configure Telegram WebApp for 3D interaction
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
        sendHeatMapReport(diamonds);
      };
      
      mainButton.onClick(handleMainButtonClick);
      
      return () => {
        if (mainButton) {
          mainButton.hide();
          if (mainButton.offClick) {
            mainButton.offClick(handleMainButtonClick);
          }
        }
      };
    }
  }, [diamonds, sendHeatMapReport]);

  // Performance optimization for mobile
  const canvasProps = useMemo(() => ({
    dpr: [1, 2] as [number, number], // Limit pixel ratio for mobile performance
    performance: { min: 0.5 }, // Adaptive performance
    gl: { 
      antialias: false, // Disable for better mobile performance
      powerPreference: 'high-performance' as const,
      alpha: false,
    },
    camera: { 
      fov: 60, 
      near: 0.1, 
      far: 100, 
      position: [8, 8, 8] as [number, number, number]
    },
    shadows: false, // Disable shadows on mobile for performance
  }), []);

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
    <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ height }}>
      {/* Performance indicator */}
      <div className="absolute top-4 left-4 z-10">
        <Badge variant="outline" className="bg-black/50 text-white border-white/20">
          3D Heat Map • {diamonds.length} Diamonds
        </Badge>
      </div>
      
      {/* Controls help */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2 text-white text-xs">
          <div>🖱️ Drag to rotate</div>
          <div>🔍 Pinch to zoom</div>
          <div>👆 Tap diamonds for details</div>
        </div>
      </div>
      
      {/* Stats overlay */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white text-xs space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>High: {diamonds.filter(d => d.interestLevel === 'high').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-400 rounded"></div>
            <span>Medium: {diamonds.filter(d => d.interestLevel === 'medium').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded"></div>
            <span>Low: {diamonds.filter(d => d.interestLevel === 'low').length}</span>
          </div>
        </div>
      </div>
      
      <Canvas {...canvasProps}>
        <Suspense fallback={null}>
          <Scene3D diamonds={diamonds} onDiamondSelect={onDiamondSelect} />
        </Suspense>
      </Canvas>
    </div>
  );
}