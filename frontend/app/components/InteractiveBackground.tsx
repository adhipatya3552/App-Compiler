"use client";

import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  life: number;
  maxLife: number;
}

interface FlowLine {
  x: number;
  y: number;
  angle: number;
  speed: number;
  length: number;
  alpha: number;
  color: string;
  width: number;
}

const COLORS = [
  "139, 92, 246",   // violet
  "59, 130, 246",   // blue
  "99, 102, 241",   // indigo
  "167, 139, 250",  // light violet
];

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const animFrameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const flowLinesRef = useRef<FlowLine[]>([]);
  const timeRef = useRef(0);

  const createParticle = useCallback((w: number, h: number, nearMouse = false): Particle => {
    const colorStr = COLORS[Math.floor(Math.random() * COLORS.length)];
    const mx = mouse.current.x;
    const my = mouse.current.y;

    let x: number, y: number;
    if (nearMouse && mx > 0 && my > 0) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 120 + 20;
      x = mx + Math.cos(angle) * dist;
      y = my + Math.sin(angle) * dist;
    } else {
      x = Math.random() * w;
      y = Math.random() * h;
    }

    const maxLife = 120 + Math.random() * 180;
    return {
      x,
      y,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6 - 0.15,
      size: Math.random() * 2.5 + 0.5,
      baseSize: Math.random() * 2.5 + 0.5,
      color: colorStr,
      alpha: 0,
      baseAlpha: Math.random() * 0.55 + 0.15,
      life: 0,
      maxLife,
    };
  }, []);

  const createFlowLine = useCallback((w: number, h: number): FlowLine => {
    const colorStr = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.4 + 0.1,
      length: Math.random() * 60 + 30,
      alpha: Math.random() * 0.12 + 0.03,
      color: colorStr,
      width: Math.random() * 0.8 + 0.2,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    };
    resize();

    // Init particles
    const PARTICLE_COUNT = 120;
    const FLOW_COUNT = 60;
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () =>
      createParticle(canvas.width, canvas.height)
    );
    flowLinesRef.current = Array.from({ length: FLOW_COUNT }, () =>
      createFlowLine(canvas.width, canvas.height)
    );

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const mx = mouse.current.x;
      const my = mouse.current.y;
      const t = timeRef.current;

      // Deep clear with very subtle trail
      ctx.fillStyle = "rgba(8, 8, 12, 0.18)";
      ctx.fillRect(0, 0, w, h);

      timeRef.current += 0.008;

      // ── Flow lines (slow aurora streaks) ──────────────────────────────
      flowLinesRef.current.forEach((fl) => {
        // Steer gently toward/away mouse
        const dx = mx - fl.x;
        const dy = my - fl.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const influence = Math.max(0, 1 - dist / 350);
        fl.angle += (Math.atan2(dy, dx) - fl.angle) * influence * 0.012;
        fl.angle += Math.sin(t + fl.x * 0.01) * 0.015;

        fl.x += Math.cos(fl.angle) * fl.speed;
        fl.y += Math.sin(fl.angle) * fl.speed;

        // Wrap around
        if (fl.x < -fl.length) fl.x = w + fl.length;
        if (fl.x > w + fl.length) fl.x = -fl.length;
        if (fl.y < -fl.length) fl.y = h + fl.length;
        if (fl.y > h + fl.length) fl.y = -fl.length;

        const tailX = fl.x - Math.cos(fl.angle) * fl.length;
        const tailY = fl.y - Math.sin(fl.angle) * fl.length;
        const boostAlpha = fl.alpha + influence * 0.18;

        const grad = ctx.createLinearGradient(tailX, tailY, fl.x, fl.y);
        grad.addColorStop(0, `rgba(${fl.color}, 0)`);
        grad.addColorStop(1, `rgba(${fl.color}, ${boostAlpha})`);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(fl.x, fl.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = fl.width * (1 + influence * 2);
        ctx.stroke();
        ctx.restore();
      });

      // ── Particles ─────────────────────────────────────────────────────
      const toRemove: number[] = [];
      particlesRef.current.forEach((p, i) => {
        p.life++;
        const progress = p.life / p.maxLife;
        // Fade in/out
        p.alpha =
          progress < 0.1
            ? (progress / 0.1) * p.baseAlpha
            : progress > 0.8
            ? ((1 - progress) / 0.2) * p.baseAlpha
            : p.baseAlpha;

        // Mouse repulsion / attraction
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < 180) {
          const force = ((180 - dist) / 180) * 0.35;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
          p.size = p.baseSize * (1 + (1 - dist / 180) * 1.8);
        } else {
          p.size += (p.baseSize - p.size) * 0.05;
        }

        // Gentle noise drift
        p.vx += Math.sin(t * 1.2 + p.y * 0.005) * 0.012;
        p.vy += Math.cos(t * 0.9 + p.x * 0.005) * 0.012;

        // Damping
        p.vx *= 0.96;
        p.vy *= 0.96;

        p.x += p.vx;
        p.y += p.vy;

        if (p.life >= p.maxLife) {
          toRemove.push(i);
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.1, p.size), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.shadowColor = `rgba(${p.color}, ${p.alpha * 0.6})`;
        ctx.shadowBlur = p.size * 3;
        ctx.fill();
        ctx.restore();
      });

      // Remove dead particles and spawn replacements (including near mouse)
      toRemove.reverse().forEach((idx) => {
        particlesRef.current.splice(idx, 1);
      });

      // Keep particle count stable; bias spawning near mouse when active
      const deficit = PARTICLE_COUNT - particlesRef.current.length;
      for (let i = 0; i < deficit; i++) {
        const nearMouse = mx > 0 && Math.random() < 0.4;
        particlesRef.current.push(createParticle(w, h, nearMouse));
      }

      // ── Mouse glow ripple ─────────────────────────────────────────────
      if (mx > 0 && mx < w && my > 0 && my < h) {
        const rippleR = 180 + Math.sin(t * 3) * 20;
        const grd = ctx.createRadialGradient(mx, my, 0, mx, my, rippleR);
        grd.addColorStop(0, "rgba(139, 92, 246, 0.10)");
        grd.addColorStop(0.4, "rgba(59, 130, 246, 0.04)");
        grd.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grd;
        ctx.fillRect(mx - rippleR, my - rippleR, rippleR * 2, rippleR * 2);

        // Inner bright core
        const innerGrd = ctx.createRadialGradient(mx, my, 0, mx, my, 40);
        innerGrd.addColorStop(0, "rgba(167, 139, 250, 0.18)");
        innerGrd.addColorStop(1, "rgba(167, 139, 250, 0)");
        ctx.fillStyle = innerGrd;
        ctx.fillRect(mx - 40, my - 40, 80, 80);
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    const onMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY + window.scrollY };
    };
    const onMouseLeave = () => {
      mouse.current = { x: -9999, y: -9999 };
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", resize);
    };
  }, [createParticle, createFlowLine]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
