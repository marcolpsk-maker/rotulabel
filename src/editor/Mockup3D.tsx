import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage, PerspectiveCamera, Html, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

interface Mockup3DProps {
  labelImage: string; // Base64 or URL of the label
  widthCm: number;
  heightCm: number;
}

function Bottle({ labelImage, widthCm, heightCm }: Mockup3DProps) {
  const texture = useMemo(() => {
    const tex = new THREE.TextureLoader().load(labelImage);
    tex.anisotropy = 16;
    return tex;
  }, [labelImage]);

  const bottleRef = useRef<THREE.Group>(null);

  // Simple bottle geometry (Cylinder)
  // Height and Radius based on CM (scaled for 3D)
  const radius = (widthCm / (2 * Math.PI)) * 0.1; // radius in 3D units
  const height = heightCm * 0.1; // height in 3D units

  return (
    <group ref={bottleRef}>
      {/* Bottle Body */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius * 1.02, radius * 1.02, height, 64]} />
        <meshStandardMaterial 
          map={texture} 
          roughness={0.05}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Glossy Overlay for Plastic/Glass effect */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[radius * 1.03, radius * 1.03, height, 64]} />
        <meshPhysicalMaterial 
          transparent 
          opacity={0.15} 
          transmission={0.8}
          thickness={0.5}
          roughness={0}
          clearcoat={1}
        />
      </mesh>

      {/* Bottle Cap (Simulated) */}
      <mesh position={[0, height + 0.05, 0]}>
        <cylinderGeometry args={[radius * 0.8, radius * 0.8, 0.15, 32]} />
        <meshStandardMaterial color="#222" roughness={0.5} />
      </mesh>

      {/* Bottle Base */}
      <mesh position={[0, -0.01, 0]}>
        <cylinderGeometry args={[radius, radius, 0.02, 32]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  );
}

export default function Mockup3D({ labelImage, widthCm, heightCm }: Mockup3DProps) {
  return (
    <div className="w-full h-[500px] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl relative">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-white text-sm font-bold bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
          Visualização Realista 3D
        </h3>
      </div>
      
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 1.5, 4]} fov={40} />
        <Suspense fallback={<Html center className="text-white">Carregando Mockup...</Html>}>
          <Stage environment="city" intensity={0.5} contactShadow={false}>
            <Bottle labelImage={labelImage} widthCm={widthCm} heightCm={heightCm} />
          </Stage>
          <Environment preset="studio" />
          <ContactShadows position={[0, -0.1, 0]} opacity={0.4} scale={10} blur={2} far={4} />
        </Suspense>
        <OrbitControls 
          enablePan={false} 
          minDistance={2} 
          maxDistance={8}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
        <span className="text-[10px] text-white/50 uppercase tracking-widest">Rotulabel Engine 3D</span>
        <span className="text-[10px] text-white/50 uppercase tracking-widest italic text-right">
          Use o mouse para girar e zoom
        </span>
      </div>
    </div>
  );
}
