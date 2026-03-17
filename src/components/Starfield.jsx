import { useRef, useEffect } from 'react';
import './Starfield.css';

function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let stars = [];
    let shootingStars = [];
    let comets = [];
    let blackHole = null;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createStars = () => {
      stars = [];
      const count = Math.floor((canvas.width * canvas.height) / 5000);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.3 + 0.2,
          alpha: Math.random() * 0.7 + 0.2,
          speed: Math.random() * 0.2 + 0.03,
          twinkleSpeed: Math.random() * 0.008 + 0.003,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }

      // Create black hole at a random subtle position
      blackHole = {
        x: canvas.width * (0.7 + Math.random() * 0.2),
        y: canvas.height * (0.2 + Math.random() * 0.3),
        radius: 18,
        pulsePhase: 0,
      };
    };

    const drawNebula = () => {
      const g1 = ctx.createRadialGradient(
        canvas.width * 0.15, canvas.height * 0.25, 0,
        canvas.width * 0.15, canvas.height * 0.25, canvas.width * 0.35
      );
      g1.addColorStop(0, 'rgba(139, 92, 246, 0.025)');
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const g2 = ctx.createRadialGradient(
        canvas.width * 0.85, canvas.height * 0.75, 0,
        canvas.width * 0.85, canvas.height * 0.75, canvas.width * 0.3
      );
      g2.addColorStop(0, 'rgba(59, 130, 246, 0.02)');
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    // Draw black hole with accretion disk
    const drawBlackHole = (time) => {
      if (!blackHole) return;
      const bh = blackHole;
      bh.pulsePhase += 0.01;
      const pulse = Math.sin(bh.pulsePhase) * 0.15 + 0.85;

      // Accretion disk rings
      for (let i = 3; i >= 0; i--) {
        const ringR = bh.radius + 12 + i * 8;
        ctx.beginPath();
        ctx.ellipse(bh.x, bh.y, ringR, ringR * 0.35, 0.3, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.04 * pulse * (4 - i)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Event horizon
      const gradient = ctx.createRadialGradient(bh.x, bh.y, 0, bh.x, bh.y, bh.radius * 2.5);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
      gradient.addColorStop(0.4, 'rgba(5, 5, 16, 0.6)');
      gradient.addColorStop(0.7, `rgba(139, 92, 246, ${0.08 * pulse})`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(bh.x, bh.y, bh.radius * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(bh.x, bh.y, bh.radius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
      ctx.fill();
    };

    // Draw subtle tech grid lines
    const drawTechElements = (time) => {
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.015)';
      ctx.lineWidth = 0.5;

      // Horizontal scan lines (very subtle)
      const scanY = (time * 30) % canvas.height;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(canvas.width, scanY);
      ctx.strokeStyle = `rgba(139, 92, 246, 0.04)`;
      ctx.stroke();

      // Subtle circuit-like dots at grid intersections
      const gridSize = 120;
      for (let x = gridSize; x < canvas.width; x += gridSize) {
        for (let y = gridSize; y < canvas.height; y += gridSize) {
          const dist = Math.abs(y - scanY);
          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.06;
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.fill();
          }
        }
      }
    };

    // Create comet
    const maybeCreateComet = () => {
      if (comets.length < 2 && Math.random() < 0.001) {
        const fromLeft = Math.random() > 0.5;
        comets.push({
          x: fromLeft ? -50 : canvas.width + 50,
          y: Math.random() * canvas.height * 0.5,
          speedX: (fromLeft ? 1 : -1) * (Math.random() * 2 + 1.5),
          speedY: Math.random() * 0.8 + 0.3,
          tailLength: Math.random() * 60 + 40,
          alpha: 0.6,
          size: Math.random() * 2 + 1.5,
        });
      }
    };

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.016;

      drawNebula();
      drawTechElements(time);
      drawBlackHole(time);

      // Stars
      stars.forEach((star) => {
        const tw = Math.sin(time * star.twinkleSpeed * 60 + star.twinkleOffset) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 210, 255, ${star.alpha * tw})`;
        ctx.fill();

        if (star.radius > 1) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(139, 92, 246, ${star.alpha * tw * 0.08})`;
          ctx.fill();
        }

        star.y += star.speed * 0.1;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      });

      // Shooting stars
      if (Math.random() < 0.002) {
        shootingStars.push({
          x: Math.random() * canvas.width,
          y: 0,
          length: Math.random() * 80 + 40,
          speed: Math.random() * 4 + 3,
          angle: (Math.random() * 30 + 60) * (Math.PI / 180),
          alpha: 1,
        });
      }
      shootingStars = shootingStars.filter((s) => s.alpha > 0);
      shootingStars.forEach((s) => {
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        const tailX = s.x - Math.cos(s.angle) * s.length;
        const tailY = s.y - Math.sin(s.angle) * s.length;
        const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${s.alpha})`);
        grad.addColorStop(1, 'rgba(139, 92, 246, 0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.alpha -= 0.008;
      });

      // Comets
      maybeCreateComet();
      comets = comets.filter((c) => c.alpha > 0 && c.x > -100 && c.x < canvas.width + 100);
      comets.forEach((c) => {
        // Comet head glow
        const headGrad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.size * 4);
        headGrad.addColorStop(0, `rgba(6, 182, 212, ${c.alpha * 0.5})`);
        headGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Comet core
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 240, 255, ${c.alpha})`;
        ctx.fill();

        // Comet tail
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        const tailX = c.x - c.speedX * c.tailLength * 0.5;
        const tailY = c.y - c.speedY * c.tailLength * 0.3;
        const tGrad = ctx.createLinearGradient(c.x, c.y, tailX, tailY);
        tGrad.addColorStop(0, `rgba(6, 182, 212, ${c.alpha * 0.4})`);
        tGrad.addColorStop(1, 'transparent');
        ctx.strokeStyle = tGrad;
        ctx.lineWidth = c.size;
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        c.x += c.speedX;
        c.y += c.speedY;
        if (c.x < -100 || c.x > canvas.width + 100) c.alpha -= 0.02;
      });

      animationId = requestAnimationFrame(animate);
    };

    resize();
    createStars();
    animate();

    const handleResize = () => { resize(); createStars(); };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="starfield" />;
}

export default Starfield;
