"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SceneTilt } from "./catalog-scene";

const CatalogScene = dynamic(() => import("./catalog-scene"), { ssr: false });

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function Product3D({
  src,
  alt,
  sizes,
  preload = false,
  hoverOnly = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  preload?: boolean;
  hoverOnly?: boolean;
}) {
  const [webgl, setWebgl] = useState(false);
  const [ready, setReady] = useState(false);
  const [hovered, setHovered] = useState(false);
  const tilt = useRef<SceneTilt>({ x: 0, y: 0 });
  const invalidateScene = useRef<(() => void) | null>(null);
  const dragging = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Layar sentuh kecil memakai gambar biasa supaya canvas tidak membebani.
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const wideEnough = window.matchMedia("(min-width: 768px)").matches;
    if (!finePointer || !wideEnough) return;

    const probe = document.createElement("canvas");
    const supported = Boolean(
      probe.getContext("webgl2") ?? probe.getContext("webgl"),
    );
    const frame = requestAnimationFrame(() => setWebgl(supported));
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleReady = useCallback(() => setReady(true), []);
  const active = webgl && (!hoverOnly || hovered);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    dragging.current = true;
    lastPoint.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!active) return;

    if (dragging.current) {
      tilt.current.y = clamp(
        tilt.current.y + (event.clientX - lastPoint.current.x) * 0.006,
        -1.1,
        1.1,
      );
      tilt.current.x = clamp(
        tilt.current.x + (event.clientY - lastPoint.current.y) * 0.006,
        -0.55,
        0.55,
      );
      lastPoint.current = { x: event.clientX, y: event.clientY };
      invalidateScene.current?.();
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    tilt.current.y = nx * 0.32;
    tilt.current.x = -ny * 0.18;
    invalidateScene.current?.();
  }

  function stopDragging(event: React.PointerEvent<HTMLDivElement>) {
    dragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const step = 0.18;
    if (event.key === "ArrowLeft") tilt.current.y -= step;
    else if (event.key === "ArrowRight") tilt.current.y += step;
    else if (event.key === "ArrowUp") tilt.current.x -= step;
    else if (event.key === "ArrowDown") tilt.current.x += step;
    else return;

    event.preventDefault();
    tilt.current.y = clamp(tilt.current.y, -1.1, 1.1);
    tilt.current.x = clamp(tilt.current.x, -0.55, 0.55);
    invalidateScene.current?.();
  }

  return (
    <div
      className="tk-3d-wrap relative size-full"
      role={active ? "img" : undefined}
      tabIndex={active ? 0 : undefined}
      aria-label={
        active
          ? `Model 3D ${alt}. Arahkan kursor, geser, atau gunakan tombol panah untuk memutar.`
          : undefined
      }
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        dragging.current = false;
        tilt.current = { x: 0, y: 0 };
        invalidateScene.current?.();
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onKeyDown={onKeyDown}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        preload={preload}
        className="object-cover transition-opacity duration-500"
        style={{ opacity: ready && active ? 0 : 1 }}
        aria-hidden={ready && active ? true : undefined}
      />

      {active ? (
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: ready ? 1 : 0 }}
          aria-hidden="true"
        >
          <CatalogScene src={src} tilt={tilt} onReady={handleReady} invalidateRef={invalidateScene} />
        </div>
      ) : null}

      {active ? (
        <span className="tk-3d-hint" aria-hidden="true">
          Geser untuk memutar
        </span>
      ) : null}
    </div>
  );
}
