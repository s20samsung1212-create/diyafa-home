"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function GoldRingLogo() {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.05;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
      <group ref={meshRef}>
        {/* القرص الخلفي البيج نصف الشفاف */}
        <mesh position={[0, 0, -0.05]}>
          <cylinderGeometry args={[2.5, 2.5, 0.04, 64]} />
          <meshStandardMaterial
            color="#f2e3c6"
            transparent
            opacity={0.45}
            roughness={0.4}
          />
        </mesh>

        {/* الحلقة الخارجية الذهبية نصف الشفافة */}
        <mesh position={[0, 0, 0.02]}>
          <torusGeometry args={[2.55, 0.06, 32, 100]} />
          <meshStandardMaterial
            color="#e2c99a"
            transparent
            opacity={0.6}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>

        {/* القوس الداخلي */}
        <mesh position={[0, 0.4, 0.08]}>
          <torusGeometry args={[1.0, 0.05, 16, 50, Math.PI]} />
          <meshStandardMaterial
            color="#e2c99a"
            transparent
            opacity={0.6}
            metalness={0.8}
          />
        </mesh>

        {/* حرف D */}
        <mesh position={[-0.45, -0.25, 0.08]}>
          <boxGeometry args={[0.08, 1.3, 0.08]} />
          <meshStandardMaterial
            color="#e2c99a"
            transparent
            opacity={0.6}
            metalness={0.8}
          />
        </mesh>

        {/* حرف H */}
        <mesh position={[0.45, -0.25, 0.08]}>
          <boxGeometry args={[0.08, 1.3, 0.08]} />
          <meshStandardMaterial
            color="#e2c99a"
            transparent
            opacity={0.6}
            metalness={0.8}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function Logo3D() {
  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} color="#fff8eb" />
        <pointLight position={[0, 0, 4]} intensity={0.8} color="#ffffff" />
        <GoldRingLogo />
      </Canvas>
    </div>
  );
}