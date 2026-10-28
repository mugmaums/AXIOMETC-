import React, { useEffect, useRef } from 'react';

/**
 * GeminiSparkBackground
 * A high-fidelity animated gradient mesh background with golden 'sparks' and wooden tones.
 * Inspired by Google Gemini's visual identity but adapted to the Royal Wooden theme.
 */
export const GeminiSparkBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Background gradient colors (Royal Wooden Palette)
    const mahogany = '#4a2c1d';
    const deepWood = '#2d140b';
    const goldAccent = '#d4af37';
    const brightGold = '#fcf29e';

    interface Spark {
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      color: string;
    }

    const sparks: Spark[] = [];

    const createSpark = () => {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 3 + 1;
      const vx = (Math.random() - 0.5) * 0.5;
      const vy = (Math.random() - 0.5) * 0.5;
      const maxLife = Math.random() * 100 + 100;
      sparks.push({ x, y, size, vx, vy, life: maxLife, maxLife, color: Math.random() > 0.5 ? goldAccent : brightGold });
    };

    // Initialize sparks
    for (let i = 0; i < 40; i++) createSpark();

    const draw = () => {
      // 1. Clear with base wood color
      ctx.fillStyle = deepWood;
      ctx.fillRect(0, 0, width, height);

      // 2. Animated Gradient Mesh
      const time = performance.now() * 0.001;
      
      // Layer 1: Mahogany Glow
      const grad1 = ctx.createRadialGradient(
        width * 0.5 + Math.sin(time * 0.5) * width * 0.2,
        height * 0.5 + Math.cos(time * 0.7) * height * 0.2,
        0,
        width * 0.5,
        height * 0.5,
        Math.max(width, height)
      );
      grad1.addColorStop(0, `${mahogany}44`);
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // Layer 2: Gold Shimmer
      const grad2 = ctx.createRadialGradient(
        width * 0.2 + Math.cos(time * 0.3) * width * 0.1,
        height * 0.8 + Math.sin(time * 0.4) * height * 0.1,
        0,
        width * 0.3,
        height * 0.7,
        width * 0.6
      );
      grad2.addColorStop(0, `${goldAccent}22`);
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // 3. Render and Update Sparks
      ctx.globalCompositeOperation = 'lighter';
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life--;

        if (s.life <= 0) {
          sparks.splice(i, 1);
          createSpark();
          continue;
        }

        const opacity = s.life / s.maxLife;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `${s.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();

        // Glow for larger sparks
        if (s.size > 2) {
          ctx.shadowBlur = 10 * opacity;
          ctx.shadowColor = s.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      ctx.globalCompositeOperation = 'source-over';

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-40"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
