import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Text, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { BookRecord } from '../../types';
import { useRoyalAudio } from '../../hooks/useRoyalAudio';

interface Book3DProps {
  book: BookRecord;
  isRead: boolean;
  onSelect: () => void;
  isLarge?: boolean;
}

function Page({ rotation, color }: { rotation: number, color: string }) {
  const meshRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = rotation;
  });

  return (
    <group ref={meshRef}>
      <mesh castShadow>
        <planeGeometry args={[0.95, 1.35]} />
        <meshPhysicalMaterial color={color} side={THREE.DoubleSide} roughness={0.8} />
      </mesh>
    </group>
  );
}

function BookModel({ book, isRead, isHovered, isSelected }: { book: BookRecord, isRead: boolean, isHovered: boolean, isSelected: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const [pageRotation, setPageRotation] = useState(0);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Continuous page turn animation for shelf display
    if (!isSelected) {
      const time = state.clock.getElapsedTime();
      // Only turn pages slightly to show they are "turning"
      const turnAmount = Math.sin(time * 0.5) * 0.1;
      setPageRotation(turnAmount);
    }

    // Animation when selected: pull out and rotate
    const targetZ = isSelected ? 2 : isHovered ? 0.3 : 0;
    const targetYRot = isSelected ? Math.PI / 2 : 0;
    
    groupRef.current.position.z = THREE.MathUtils.damp(groupRef.current.position.z, targetZ, 4, state.clock.getDelta());
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetYRot, 4, state.clock.getDelta());
  });

  const frontUrl = book.coverDesign?.front || '';
  const backUrl = book.coverDesign?.back || '';
  const accentColor = book.coverDesign?.accentColor || '#4a2c1d';

  const coverTexture = useMemo(() => {
    if (!frontUrl) return null;
    try {
      return new THREE.TextureLoader().load(frontUrl);
    } catch {
      return null;
    }
  }, [frontUrl]);

  const backTexture = useMemo(() => {
    if (!backUrl) return null;
    try {
      return new THREE.TextureLoader().load(backUrl);
    } catch {
      return null;
    }
  }, [backUrl]);

  return (
    <group ref={groupRef}>
      {/* Spine */}
      <mesh castShadow>
        <boxGeometry args={[0.2, 1.4, 1.0]} />
        <meshPhysicalMaterial color={accentColor} roughness={0.3} metalness={0.1} />
        <Text
          position={[0.11, 0, 0]}
          rotation={[0, Math.PI / 2, Math.PI / 2]}
          fontSize={0.07}
          color="#d4af37"
          maxWidth={1}
          textAlign="center"
          font="/fonts/PlayfairDisplay-Bold.ttf"
        >
          {book.title}
        </Text>
      </mesh>

      {/* Front Cover */}
      <mesh position={[0.101, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <planeGeometry args={[1.0, 1.4]} />
        {coverTexture ? (
          <meshPhysicalMaterial map={coverTexture} side={THREE.DoubleSide} />
        ) : (
          <meshPhysicalMaterial color={accentColor} side={THREE.DoubleSide} roughness={0.4} />
        )}
      </mesh>

      {/* Back Cover */}
      <mesh position={[-0.101, 0, 0]} rotation={[0, -Math.PI / 2, 0]} castShadow>
        <planeGeometry args={[1.0, 1.4]} />
        {backTexture ? (
          <meshPhysicalMaterial map={backTexture} side={THREE.DoubleSide} />
        ) : (
          <meshPhysicalMaterial color={accentColor} side={THREE.DoubleSide} roughness={0.5} />
        )}
      </mesh>

      {/* Pages (Animated turning) */}
      {[...Array(5)].map((_, i) => (
        <group key={i} position={[0.08 - i * 0.02, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <Page rotation={pageRotation * (i + 1)} color="#fdfaf0" />
        </group>
      ))}

      {/* Progress Bar on Spine */}
      <group position={[0.105, -0.5, 0]}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.6, 0.03]} />
          <meshBasicMaterial color="#1a0f0a" />
        </mesh>
        {book.progress !== undefined && book.progress > 0 && (
          <mesh position={[0.001, 0, (book.progress - 1) * 0.3]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[book.progress * 0.6, 0.02]} />
            <meshStandardMaterial color="#059669" emissive="#059669" emissiveIntensity={0.8} />
          </mesh>
        )}
      </group>

      {/* Read Tag */}
      {isRead && (
        <group position={[0, 0.75, 0.4]}>
          <mesh>
            <boxGeometry args={[0.05, 0.2, 0.01]} />
            <meshBasicMaterial color="#991b1b" />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.04} color="white">READ</Text>
        </group>
      )}

      {/* Smart Bookmark Ribbon */}
      {book.progress !== undefined && book.progress > 0 && book.progress < 1 && (
        <group position={[0.05, 0.6, 0.2]}>
          <mesh castShadow>
            <boxGeometry args={[0.08, 0.4, 0.01]} />
            <meshPhysicalMaterial 
              color="#d4af37" 
              metalness={0.6} 
              roughness={0.2} 
              emissive="#d4af37" 
              emissiveIntensity={0.2} 
            />
          </mesh>
          {/* Ribbon Tip (Triangle) */}
          <mesh position={[0, -0.25, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.056, 0.056, 0.01]} />
            <meshPhysicalMaterial color="#d4af37" metalness={0.6} roughness={0.2} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export function Book3D({ book, isRead, onSelect }: Book3DProps) {
  const [hovered, setHovered] = useState(false);
  const [selected, setSelected] = useState(false);
  const { playWoodClick, playSlide } = useRoyalAudio();

  const handleClick = () => {
    if (selected) return;
    setSelected(true);
    playWoodClick();
    setTimeout(onSelect, 1200);
  };

  return (
    <div 
      className="w-full h-full cursor-pointer transition-transform duration-300"
      onMouseEnter={() => { setHovered(true); playSlide(0.1); }}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 3]} fov={40} />
        <ambientLight intensity={0.7} />
        <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-2, 2, 2]} intensity={0.5} color="#d4af37" />
        
        <BookModel book={book} isRead={isRead} isHovered={hovered} isSelected={selected} />
        
        <Environment preset="studio" />
        <ContactShadows position={[0, -0.8, 0]} opacity={0.4} scale={5} blur={2.4} />
      </Canvas>
    </div>
  );
}
