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

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

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
          speed: Math.random() * 0.5 + 0.15,
          twinkleSpeed: Math.random() * 0.012 + 0.005,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }

      blackHole = {
        x: canvas.width * 0.8,
        y: canvas.height * 0.25,
        targetX: canvas.width * 0.8,
        targetY: canvas.height * 0.25,
        radius: 24,
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

    const getLensedPos = (x, y, bh) => {
      const dx = x - bh.x;
      const dy = y - bh.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      
      // Event horizon shadow zone
      if (d < bh.radius * 0.85) return null;

      // Gravitational lensing math - deflect light around the mass
      // Based on simplified lensing: theta = 4GM / rc^2
      // We simulate this by offsetting the lookup coordinate
      const strength = (bh.radius * bh.radius * 1.8) / (d + 0.1);
      const factor = 1 + strength / d;
      
      return {
        x: bh.x + dx * factor,
        y: bh.y + dy * factor,
        mag: Math.min(2.5, 1 + strength * 0.05) // Brighten lensed stars
      };
    };

    const drawBlackHole = (time) => {
      if (!blackHole) return;
      const bh = blackHole;
      
      // Smooth movement towards mouse/default target
      bh.x += (bh.targetX - bh.x) * 0.02;
      bh.y += (bh.targetY - bh.y) * 0.02;
      
      bh.pulsePhase += 0.01;
      bh.rotationAngle += 0.015;
      const pulse = Math.sin(bh.pulsePhase) * 0.1 + 0.9;

      ctx.save();
      ctx.translate(bh.x, bh.y);

      // 1. Gravitational lensing glow (faint outer haze)
      const outerGlow = ctx.createRadialGradient(0, 0, bh.radius, 0, 0, bh.radius * 6);
      outerGlow.addColorStop(0, 'rgba(139, 92, 246, 0.08)');
      outerGlow.addColorStop(0.4, 'rgba(59, 130, 246, 0.03)');
      outerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(0, 0, bh.radius * 6, 0, Math.PI * 2);
      ctx.fill();

      // 2. Accretion Disk - Back Part (Lensed over the top and bottom)
      // This is the classic "Interstellar" look where the back of the disk 
      // is visible as a ring around the vertical axis.
      ctx.save();
      const diskLayers = 8;
      for (let i = 0; i < diskLayers; i++) {
        const r = bh.radius * 2.2 + i * 4;
        const alpha = (0.25 - i * 0.03) * pulse;
        const hue = 260 + i * 10;
        
        ctx.strokeStyle = `hsla(${hue}, 80%, 75%, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        
        // Top lensed arc
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 1.1, 0, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
        
        // Bottom lensed arc
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 1.1, 0, Math.PI * 0.1, Math.PI * 0.9);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Photon Sphere (Inner bright ring)
      const photonGrad = ctx.createRadialGradient(0, 0, bh.radius * 0.9, 0, 0, bh.radius * 1.1);
      photonGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      photonGrad.addColorStop(0.5, 'rgba(200, 180, 255, 0.8)');
      photonGrad.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.strokeStyle = photonGrad;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, bh.radius * 1.05, 0, Math.PI * 2);
      ctx.stroke();

      // 4. Dark Core (Event Horizon)
      ctx.beginPath();
      ctx.arc(0, 0, bh.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#010105';
      ctx.fill();

      // 5. Accretion Disk - Front Part
      // This part passes in front of the black hole
      ctx.save();
      for (let i = 0; i < diskLayers; i++) {
        const r = bh.radius * 2.4 + i * 6;
        const alpha = (0.4 - i * 0.04) * pulse;
        const hue = 260 + i * 12;
        
        // Relativistic Beaming - render left side brighter (moving towards observer)
        const grad = ctx.createLinearGradient(-r, 0, r, 0);
        grad.addColorStop(0, `hsla(${hue}, 90%, 80%, ${alpha * 1.5})`);
        grad.addColorStop(0.5, `hsla(${hue}, 80%, 70%, ${alpha})`);
        grad.addColorStop(1, `hsla(${hue}, 70%, 50%, ${alpha * 0.3})`);
        
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.5 - i * 0.2;
        
        ctx.beginPath();
        // Just the front arc
        ctx.ellipse(0, 0, r, r * 0.15, bh.rotationAngle * 0.1, Math.PI * 0, Math.PI * 1);
        ctx.stroke();
      }
      ctx.restore();

      ctx.restore();
    };

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
      
      // Draw Stars with Gravitational Lensing
      stars.forEach((star) => {
        const lensed = getLensedPos(star.x, star.y, blackHole);
        if (!lensed) return; // Star is behind event horizon

        const tw = Math.sin(time * star.twinkleSpeed * 60 + star.twinkleOffset) * 0.35 + 0.65;
        const drawX = lensed.x;
        const drawY = lensed.y;
        const drawR = star.radius * lensed.mag;

        ctx.beginPath();
        ctx.arc(drawX, drawY, drawR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 210, 255, ${star.alpha * tw * Math.min(1.5, lensed.mag)})`;
        ctx.fill();

        if (star.radius > 1) {
          ctx.beginPath();
          ctx.arc(drawX, drawY, drawR * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(139, 92, 246, ${star.alpha * tw * 0.07})`;
          ctx.fill();
        }

        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = -2;
          star.x = Math.random() * canvas.width;
        }
      });

      drawBlackHole(time);

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
        const lensed = getLensedPos(s.x, s.y, blackHole);
        const lensedTailX = getLensedPos(s.x - Math.cos(s.angle) * s.length, s.y - Math.sin(s.angle) * s.length, blackHole);
        
        if (lensed && lensedTailX) {
          const grad = ctx.createLinearGradient(lensed.x, lensed.y, lensedTailX.x, lensedTailX.y);
          grad.addColorStop(0, `rgba(255, 255, 255, ${s.alpha})`);
          grad.addColorStop(1, 'rgba(139, 92, 246, 0)');
          ctx.beginPath();
          ctx.moveTo(lensed.x, lensed.y);
          ctx.lineTo(lensedTailX.x, lensedTailX.y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.alpha -= 0.007;
      });

      // Comets
      maybeCreateComet();
      comets = comets.filter((c) => c.alpha > 0 && c.x > -120 && c.x < canvas.width + 120);
      comets.forEach((c) => {
        const lensed = getLensedPos(c.x, c.y, blackHole);
        if (!lensed) return;

        const headGrad = ctx.createRadialGradient(lensed.x, lensed.y, 0, lensed.x, lensed.y, c.size * 5);
        headGrad.addColorStop(0, `rgba(6, 182, 212, ${c.alpha * 0.45})`);
        headGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(lensed.x, lensed.y, c.size * 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(lensed.x, lensed.y, c.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 240, 255, ${c.alpha})`;
        ctx.fill();

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
    const handleMouseMove = (e) => {
      if (blackHole) {
        // Subtle drift toward mouse, but stay in the general area
        const centerX = window.innerWidth * 0.8;
        const centerY = window.innerHeight * 0.25;
        blackHole.targetX = centerX + (e.clientX - window.innerWidth / 2) * 0.05;
        blackHole.targetY = centerY + (e.clientY - window.innerHeight / 2) * 0.05;
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    return () => { 
      cancelAnimationFrame(animationId); 
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="starfield" />;
}

export default Starfield;
