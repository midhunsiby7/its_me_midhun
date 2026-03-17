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
      const count = Math.floor((canvas.width * canvas.height) / 4500);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.4 + 0.2,
          alpha: Math.random() * 0.75 + 0.2,
          speed: Math.random() * 0.5 + 0.15,  // faster drift
          twinkleSpeed: Math.random() * 0.012 + 0.005,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }

      blackHole = {
        x: canvas.width * (0.72 + Math.random() * 0.15),
        y: canvas.height * (0.18 + Math.random() * 0.25),
        radius: 20,
        rotationAngle: 0,
        pulsePhase: 0,
      };
    };

    const drawNebula = () => {
      const g1 = ctx.createRadialGradient(
        canvas.width * 0.15, canvas.height * 0.25, 0,
        canvas.width * 0.15, canvas.height * 0.25, canvas.width * 0.35
      );
      g1.addColorStop(0, 'rgba(139, 92, 246, 0.022)');
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const g2 = ctx.createRadialGradient(
        canvas.width * 0.85, canvas.height * 0.75, 0,
        canvas.width * 0.85, canvas.height * 0.75, canvas.width * 0.3
      );
      g2.addColorStop(0, 'rgba(59, 130, 246, 0.018)');
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    // Realistic black hole with spinning accretion disk
    const drawBlackHole = (time) => {
      if (!blackHole) return;
      const bh = blackHole;
      bh.pulsePhase += 0.008;
      bh.rotationAngle += 0.003;
      const pulse = Math.sin(bh.pulsePhase) * 0.12 + 0.88;

      ctx.save();
      ctx.translate(bh.x, bh.y);

      // Gravitational lensing ring (outermost glow)
      const lensGrad = ctx.createRadialGradient(0, 0, bh.radius * 2, 0, 0, bh.radius * 4);
      lensGrad.addColorStop(0, `rgba(139, 92, 246, ${0.03 * pulse})`);
      lensGrad.addColorStop(0.5, `rgba(236, 72, 153, ${0.015 * pulse})`);
      lensGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = lensGrad;
      ctx.beginPath();
      ctx.arc(0, 0, bh.radius * 4, 0, Math.PI * 2);
      ctx.fill();

      // Spinning accretion disk — multiple elliptical rings
      for (let i = 5; i >= 0; i--) {
        const ringR = bh.radius + 8 + i * 6;
        const alpha = (0.035 - i * 0.004) * pulse;
        const hue = 260 + i * 15; // purple to pink gradient

        ctx.save();
        ctx.rotate(bh.rotationAngle + i * 0.15);

        ctx.beginPath();
        ctx.ellipse(0, 0, ringR, ringR * 0.3, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${hue}, 60%, 65%, ${alpha})`;
        ctx.lineWidth = 1.2 - i * 0.1;
        ctx.stroke();

        ctx.restore();
      }

      // Photon sphere — bright ring at event horizon
      ctx.beginPath();
      ctx.arc(0, 0, bh.radius * 1.2, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(200, 160, 255, ${0.06 * pulse})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Event horizon gradient
      const ehGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, bh.radius * 2);
      ehGrad.addColorStop(0, 'rgba(0, 0, 0, 0.92)');
      ehGrad.addColorStop(0.35, 'rgba(2, 2, 8, 0.75)');
      ehGrad.addColorStop(0.65, `rgba(60, 30, 120, ${0.06 * pulse})`);
      ehGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = ehGrad;
      ctx.beginPath();
      ctx.arc(0, 0, bh.radius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Absolute dark core
      ctx.beginPath();
      ctx.arc(0, 0, bh.radius * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.97)';
      ctx.fill();

      ctx.restore();
    };

    // Tech scan lines
    const drawTechElements = (time) => {
      const scanY = (time * 35) % canvas.height;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(canvas.width, scanY);
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.03)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      const gridSize = 140;
      for (let x = gridSize; x < canvas.width; x += gridSize) {
        for (let y = gridSize; y < canvas.height; y += gridSize) {
          const dist = Math.abs(y - scanY);
          if (dist < 80) {
            const alpha = (1 - dist / 80) * 0.05;
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.fill();
          }
        }
      }
    };

    const maybeCreateComet = () => {
      if (comets.length < 2 && Math.random() < 0.0015) {
        const fromLeft = Math.random() > 0.5;
        comets.push({
          x: fromLeft ? -50 : canvas.width + 50,
          y: Math.random() * canvas.height * 0.4,
          speedX: (fromLeft ? 1 : -1) * (Math.random() * 2.5 + 1.5),
          speedY: Math.random() * 0.6 + 0.3,
          tailLength: Math.random() * 70 + 35,
          alpha: 0.5,
          size: Math.random() * 2 + 1.2,
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

      // Stars — faster movement
      stars.forEach((star) => {
        const tw = Math.sin(time * star.twinkleSpeed * 60 + star.twinkleOffset) * 0.35 + 0.65;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 210, 255, ${star.alpha * tw})`;
        ctx.fill();

        if (star.radius > 1) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(139, 92, 246, ${star.alpha * tw * 0.07})`;
          ctx.fill();
        }

        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = -2;
          star.x = Math.random() * canvas.width;
        }
      });

      // Shooting stars
      if (Math.random() < 0.0025) {
        shootingStars.push({
          x: Math.random() * canvas.width, y: 0,
          length: Math.random() * 80 + 40,
          speed: Math.random() * 5 + 3,
          angle: (Math.random() * 30 + 60) * (Math.PI / 180),
          alpha: 1,
        });
      }
      shootingStars = shootingStars.filter((s) => s.alpha > 0);
      shootingStars.forEach((s) => {
        const tailX = s.x - Math.cos(s.angle) * s.length;
        const tailY = s.y - Math.sin(s.angle) * s.length;
        const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${s.alpha})`);
        grad.addColorStop(1, 'rgba(139, 92, 246, 0)');
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.alpha -= 0.007;
      });

      // Comets
      maybeCreateComet();
      comets = comets.filter((c) => c.alpha > 0 && c.x > -120 && c.x < canvas.width + 120);
      comets.forEach((c) => {
        const headGrad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.size * 5);
        headGrad.addColorStop(0, `rgba(6, 182, 212, ${c.alpha * 0.45})`);
        headGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size * 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 240, 255, ${c.alpha})`;
        ctx.fill();

        const tailX = c.x - c.speedX * c.tailLength * 0.5;
        const tailY = c.y - c.speedY * c.tailLength * 0.3;
        const tGrad = ctx.createLinearGradient(c.x, c.y, tailX, tailY);
        tGrad.addColorStop(0, `rgba(6, 182, 212, ${c.alpha * 0.35})`);
        tGrad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = tGrad;
        ctx.lineWidth = c.size * 0.8;
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
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', handleResize); };
  }, []);

  return <canvas ref={canvasRef} className="starfield" />;
}

export default Starfield;
