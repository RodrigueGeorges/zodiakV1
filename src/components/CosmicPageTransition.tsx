import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect } from 'react';

function CosmicPageTransition({ children, locationKey }: { children: React.ReactNode; locationKey: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animation étoiles filantes sur transition
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrame: number;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Génère des étoiles filantes
    const shootingStars = Array.from({ length: 3 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.5,
      length: 80 + Math.random() * 40,
      speed: 8 + Math.random() * 4,
      opacity: 1
    }));

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      shootingStars.forEach(star => {
        ctx.save();
        ctx.globalAlpha = star.opacity;
        ctx.strokeStyle = '#F5CBA7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x - star.length, star.y + star.length * 0.3);
        ctx.stroke();
        ctx.restore();
        star.x += star.speed;
        star.y += star.speed * 0.3;
        star.opacity -= 0.02;
        if (star.opacity <= 0) {
          star.x = Math.random() * width * 0.5;
          star.y = Math.random() * height * 0.5;
          star.length = 80 + Math.random() * 40;
          star.speed = 8 + Math.random() * 4;
          star.opacity = 1;
        }
      });
      animationFrame = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [locationKey]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={locationKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        className="relative"
      >
        <canvas
          ref={canvasRef}
          className="fixed inset-0 w-full h-full pointer-events-none z-40"
          style={{ pointerEvents: 'none' }}
        />
        <div className="relative z-50">
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CosmicPageTransition; 