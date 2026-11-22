"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export type SceneTilt = { x: number; y: number };

type InvalidateRef = React.MutableRefObject<(() => void) | null>;

function CatalogCard({
  src,
  tilt,
  onReady,
  invalidateRef,
}: {
  src: string;
  tilt: React.RefObject<SceneTilt>;
  onReady: () => void;
  invalidateRef: InvalidateRef;
}) {
  const { invalidate } = useThree();
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
    invalidateRef.current = invalidate;
    invalidate();
    onReady();
    invalidate();

    return () => {
      invalidateRef.current = null;
      prepared.dispose();
    };
  }, [invalidate, invalidateRef, onReady, prepared]);

  useFrame((_, delta) => {
    const node = group.current;
    if (!node) return;

    const damping = 1 - Math.exp(-5 * delta);
    const nextY = node.rotation.y + (tilt.current.y - node.rotation.y) * damping;
    const nextX = node.rotation.x + (tilt.current.x - node.rotation.x) * damping;

    node.rotation.y = nextY;
    node.rotation.x = nextX;

    if (
      Math.abs(tilt.current.y - nextY) > 0.0005 ||
      Math.abs(tilt.current.x - nextX) > 0.0005
    ) {
      invalidate();
    }
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
  invalidateRef,
}: {
  src: string;
  tilt: React.RefObject<SceneTilt>;
  onReady: () => void;
  invalidateRef: InvalidateRef;
}) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 3.8], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={1.15} />
      <directionalLight position={[2, 3, 4]} intensity={1.5} />
      <directionalLight position={[-2, -1, 2]} intensity={0.35} />
      <Suspense fallback={null}>
        <CatalogCard
          src={src}
          tilt={tilt}
          onReady={onReady}
          invalidateRef={invalidateRef}
        />
      </Suspense>
    </Canvas>
  );
}
