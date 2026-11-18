"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export type SceneTilt = { x: number; y: number };

function CatalogCard({
  src,
  tilt,
  onReady,
}: {
  src: string;
  tilt: React.RefObject<SceneTilt>;
  onReady: () => void;
}) {
  const texture = useLoader(THREE.TextureLoader, src);
  const group = useRef<THREE.Group>(null);
  const prepared = useMemo(() => {
    const copy = texture.clone();
    copy.colorSpace = THREE.SRGBColorSpace;
    copy.anisotropy = 4;
    copy.needsUpdate = true;
    return copy;
  }, [texture]);

  useEffect(() => {
    onReady();
    return () => prepared.dispose();
  }, [onReady, prepared]);

  useFrame((state, delta) => {
    const node = group.current;
    if (!node) return;

    const t = state.clock.elapsedTime;
    const targetY = tilt.current.y + Math.sin(t * 0.32) * 0.025;
    const targetX = tilt.current.x + Math.sin(t * 0.47) * 0.01;

    node.rotation.y = THREE.MathUtils.damp(node.rotation.y, targetY, 5, delta);
    node.rotation.x = THREE.MathUtils.damp(node.rotation.x, targetX, 5, delta);
  });

  return (
    <group ref={group}>
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[1.62, 2.02, 0.06]} />
        <meshBasicMaterial color="#ebe3d6" />
      </mesh>
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[1.6, 2]} />
        <meshStandardMaterial map={prepared} roughness={0.85} metalness={0} />
      </mesh>
    </group>
  );
}

export default function CatalogScene({
  src,
  tilt,
  onReady,
}: {
  src: string;
  tilt: React.RefObject<SceneTilt>;
  onReady: () => void;
}) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 3.8], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={1.15} />
      <directionalLight position={[2, 3, 4]} intensity={1.5} />
      <directionalLight position={[-2, -1, 2]} intensity={0.35} />
      <Suspense fallback={null}>
        <CatalogCard src={src} tilt={tilt} onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
