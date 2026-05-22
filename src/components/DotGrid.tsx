"use client";

import React, { useRef, useEffect, useCallback, useMemo } from "react";

interface Dot {
  cx: number;
  cy: number;
  xOffset: number;
  yOffset: number;
  vx: number;
  vy: number;
}

export interface DotGridProps {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  activeColor?: string;
  proximity?: number;
  speedTrigger?: number;
  shockRadius?: number;
  shockStrength?: number;
  maxSpeed?: number;
  resistance?: number;
  returnDuration?: number;
  className?: string;
  style?: React.CSSProperties;
}

function hexToRgb(hex: string) {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return { r: 82, g: 39, b: 255 }; // fallback
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16),
  };
}

const DotGrid: React.FC<DotGridProps> = ({
  dotSize = 6,
  gap = 28,
  baseColor = "#312e81", // deep indigo
  activeColor = "#a78bfa", // bright violet
  proximity = 120,
  speedTrigger = 50,
  shockRadius = 180,
  shockStrength = 8,
  className = "",
  style,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const pointerRef = useRef({
    x: -9999,
    y: -9999,
    vx: 0,
    vy: 0,
    speed: 0,
    lastTime: 0,
    lastX: -9999,
    lastY: -9999,
  });

  const baseRgb = useMemo(() => hexToRgb(baseColor), [baseColor]);
  const activeRgb = useMemo(() => hexToRgb(activeColor), [activeColor]);

  // Generate grid points
  const buildGrid = useCallback(() => {
    const wrap = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const { width, height } = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    const cell = dotSize + gap;
    const cols = Math.floor((width + gap) / cell);
    const rows = Math.floor((height + gap) / cell);

    const gridW = cell * cols - gap;
    const gridH = cell * rows - gap;

    const extraX = width - gridW;
    const extraY = height - gridH;

    const startX = extraX / 2 + dotSize / 2;
    const startY = extraY / 2 + dotSize / 2;

    const dots: Dot[] = [];
    // Keep existing offsets & velocities if we rebuild due to resize
    const prevDots = dotsRef.current;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cx = startX + x * cell;
        const cy = startY + y * cell;

        // Try to find a matching previous dot to preserve its motion state
        let xOffset = 0;
        let yOffset = 0;
        let vx = 0;
        let vy = 0;

        const matchingPrev = prevDots.find(
          (pd) => Math.abs(pd.cx - cx) < cell / 2 && Math.abs(pd.cy - cy) < cell / 2
        );
        if (matchingPrev) {
          xOffset = matchingPrev.xOffset;
          yOffset = matchingPrev.yOffset;
          vx = matchingPrev.vx;
          vy = matchingPrev.vy;
        }

        dots.push({ cx, cy, xOffset, yOffset, vx, vy });
      }
    }
    dotsRef.current = dots;
  }, [dotSize, gap]);

  // Main drawing and physics loop
  useEffect(() => {
    let rafId: number;
    const proxSq = proximity * proximity;
    const springK = 0.05; // Spring stiffness
    const friction = 0.85; // Damping/friction factor

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear with support for scaling
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, width, height);

      const { x: px, y: py } = pointerRef.current;

      for (const dot of dotsRef.current) {
        // Physics update: spring pull back to base center (cx, cy)
        const ax = -springK * dot.xOffset;
        const ay = -springK * dot.yOffset;

        dot.vx = (dot.vx + ax) * friction;
        dot.vy = (dot.vy + ay) * friction;

        dot.xOffset += dot.vx;
        dot.yOffset += dot.vy;

        // Render dot
        const ox = dot.cx + dot.xOffset;
        const oy = dot.cy + dot.yOffset;

        // Proximity calculation for color shift
        const dx = dot.cx - px;
        const dy = dot.cy - py;
        const dsq = dx * dx + dy * dy;

        let style = baseColor;
        if (dsq <= proxSq) {
          const dist = Math.sqrt(dsq);
          const t = 1 - dist / proximity;
          const r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
          const g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
          const b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);
          style = `rgb(${r},${g},${b})`;
        }

        ctx.beginPath();
        ctx.arc(ox, oy, dotSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = style;
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafId);
  }, [proximity, baseColor, activeColor, baseRgb, activeRgb, dotSize]);

  // ResizeObserver to fill container on window resize
  useEffect(() => {
    buildGrid();
    if (typeof window === "undefined") return;

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => buildGrid());
      if (wrapperRef.current) {
        ro.observe(wrapperRef.current);
      }
    } else {
      window.addEventListener("resize", buildGrid);
    }
    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", buildGrid);
    };
  }, [buildGrid]);

  // Pointer movement & click physics interactions
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      const now = performance.now();
      const pr = pointerRef.current;

      const dt = pr.lastTime ? now - pr.lastTime : 16;
      const dx = clientX - pr.lastX;
      const dy = clientY - pr.lastY;

      const vx = dt > 0 ? (dx / dt) * 16 : 0;
      const vy = dt > 0 ? (dy / dt) * 16 : 0;
      const speed = Math.hypot(vx, vy);

      pr.x = clientX;
      pr.y = clientY;
      pr.vx = vx;
      pr.vy = vy;
      pr.speed = speed;
      pr.lastTime = now;
      pr.lastX = clientX;
      pr.lastY = clientY;

      // Mouse repulsion & velocity transfer force
      if (speed > speedTrigger) {
        for (const dot of dotsRef.current) {
          const dX = dot.cx - clientX;
          const dY = dot.cy - clientY;
          const dist = Math.hypot(dX, dY);

          if (dist < proximity) {
            const factor = 1 - dist / proximity;
            // Push away vector (normalized)
            const rx = dist > 0 ? dX / dist : 0;
            const ry = dist > 0 ? dY / dist : 0;

            // Direct push force + mouse motion drag
            const push = factor * 1.5;
            const drag = factor * speed * 0.05;

            dot.vx += rx * push + (vx / (speed || 1)) * drag;
            dot.vy += ry * push + (vy / (speed || 1)) * drag;
          }
        }
      }
    };

    const handleClick = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Shockwave blast from click
      for (const dot of dotsRef.current) {
        const dX = dot.cx - clickX;
        const dY = dot.cy - clickY;
        const dist = Math.hypot(dX, dY);

        if (dist < shockRadius) {
          const factor = 1 - dist / shockRadius;
          const rx = dist > 0 ? dX / dist : 0;
          const ry = dist > 0 ? dY / dist : 0;

          const blastForce = factor * shockStrength;
          dot.vx += rx * blastForce;
          dot.vy += ry * blastForce;
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
    };
  }, [proximity, speedTrigger, shockRadius, shockStrength]);

  return (
    <div
      ref={wrapperRef}
      className={`w-full h-full relative overflow-hidden ${className}`}
      style={style}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block pointer-events-none"
      />
    </div>
  );
};

export default DotGrid;
