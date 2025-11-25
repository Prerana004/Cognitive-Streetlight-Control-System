import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Box, Cylinder } from "@react-three/drei";
import * as THREE from "three";

// Street Light Component
const StreetLight = ({ position, brightness, zone }: { position: [number, number, number]; brightness: number; zone: string }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  const poleRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (lightRef.current) {
      // Smooth brightness transition
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, brightness / 20, 0.1);
      
      // Subtle glow animation
      const pulse = Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1 + 0.9;
      lightRef.current.intensity *= pulse;
    }
    
    if (poleRef.current) {
      // Gentle sway
      poleRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.02;
    }
  });
  
  const lightColor = brightness > 80 ? "#00FFFF" : brightness > 50 ? "#0099FF" : "#004080";
  
  return (
    <group position={position}>
      {/* Light Pole */}
      <Cylinder
        ref={poleRef}
        args={[0.05, 0.08, 3]}
        position={[0, 1.5, 0]}
        material-color="#333333"
      />
      
      {/* Light Fixture */}
      <Box
        args={[0.3, 0.2, 0.3]}
        position={[0, 3.2, 0]}
        material-color="#666666"
      />
      
      {/* Point Light */}
      <pointLight
        ref={lightRef}
        position={[0, 3, 0]}
        color={lightColor}
        intensity={brightness / 20}
        distance={8}
        decay={2}
      />
      
      {/* Light Glow Effect */}
      <mesh position={[0, 3, 0]}>
        <sphereGeometry args={[0.1]} />
        <meshBasicMaterial color={lightColor} transparent opacity={brightness / 100} />
      </mesh>
      
      {/* Zone Label */}
      <Text
        position={[0, 4, 0]}
        fontSize={0.3}
        color={lightColor}
        anchorX="center"
        anchorY="middle"
      >
        {zone}
      </Text>
    </group>
  );
};

// Street Component
const Street = () => {
  return (
    <group>
      {/* Road Surface */}
      <Box
        args={[12, 0.1, 2]}
        position={[0, -0.05, 0]}
        material-color="#2a2a2a"
      />
      
      {/* Lane Markings */}
      {[-0.5, 0.5].map((x, i) => (
        <Box
          key={i}
          args={[0.05, 0.01, 12]}
          position={[x, 0.01, 0]}
          material-color="#FFFF00"
        />
      ))}
      
      {/* Sidewalks */}
      {[-1.5, 1.5].map((x, i) => (
        <Box
          key={i}
          args={[1, 0.2, 12]}
          position={[x, 0.1, 0]}
          material-color="#666666"
        />
      ))}
    </group>
  );
};

// Moving Objects (simulating detected objects)
const MovingObject = ({ type, initialPosition }: { type: string; initialPosition: [number, number, number] }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [position, setPosition] = useState(initialPosition);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Move object along the street
      const speed = type === "person" ? 0.005 : 0.02;
      setPosition(prev => [
        prev[0],
        prev[1],
        prev[2] + speed
      ]);
      
      // Reset position when off screen
      if (position[2] > 6) {
        setPosition([initialPosition[0], initialPosition[1], -6]);
      }
      
      meshRef.current.position.set(position[0], position[1], position[2]);
    }
  });
  
  const color = type === "person" ? "#FF6B6B" : type === "bike" ? "#4ECDC4" : "#FFE66D";
  const size: [number, number, number] = type === "person" ? [0.2, 0.4, 0.1] : type === "bike" ? [0.3, 0.2, 0.8] : [0.8, 0.4, 2];
  
  return (
    <Box
      ref={meshRef}
      args={size}
      material-color={color}
      material-emissive={color}
      material-emissiveIntensity={0.2}
    />
  );
};

const DigitalTwin3D = () => {
  const [zoneData, setZoneData] = useState([
    { zone: "FAR", brightness: 30 },
    { zone: "MID", brightness: 60 },
    { zone: "NEAR", brightness: 90 }
  ]);
  
  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setZoneData(prev => prev.map(zone => ({
        ...zone,
        brightness: Math.max(20, Math.min(100, zone.brightness + (Math.random() - 0.5) * 20))
      })));
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="w-full h-96 bg-black rounded-lg overflow-hidden border border-primary/30">
      <Canvas camera={{ position: [8, 8, 8], fov: 50 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} />
        
        {/* Street and Environment */}
        <Street />
        
        {/* Street Lights */}
        <StreetLight position={[-2, 0, 4]} brightness={zoneData[0].brightness} zone="FAR" />
        <StreetLight position={[-2, 0, 0]} brightness={zoneData[1].brightness} zone="MID" />
        <StreetLight position={[-2, 0, -4]} brightness={zoneData[2].brightness} zone="NEAR" />
        
        {/* Moving Objects */}
        <MovingObject type="person" initialPosition={[0.2, 0.2, -5]} />
        <MovingObject type="bike" initialPosition={[-0.3, 0.1, -3]} />
        <MovingObject type="car" initialPosition={[0.5, 0.2, -6]} />
        
        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={20}
        />
      </Canvas>
      
      {/* Data Overlay */}
      <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-border">
        <div className="text-sm font-semibold mb-2">Zone Status</div>
        {zoneData.map((zone, i) => (
          <div key={zone.zone} className="flex items-center gap-2 text-xs mb-1">
            <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-accent' : i === 1 ? 'bg-secondary' : 'bg-primary'}`} />
            <span>{zone.zone}: {zone.brightness}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DigitalTwin3D;