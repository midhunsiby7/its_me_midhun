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
      const d2 = dx * dx + dy * dy;
      const d = Math.sqrt(d2);
      
      // Infinite redshift at event horizon - star disappears
      if (d < bh.radius * 0.92) return null;

      // Extreme Gravitational Lensing - closer to the math of Schwarzschild metrics
      // Light is bent more aggressively as it approaches the horizon shadow
      const rs = bh.radius * 1.65;
      const deflection = (rs * rs) / (d + 0.1);
      
      // Near-horizon warp factor
      const warp = Math.pow(rs / d, 2.5) * 1.8;
      const factor = 1 + (deflection + warp) / d;
      
      return {
        x: bh.x + dx * factor,
        y: bh.y + dy * factor,
        mag: Math.min(3.5, 1 + (deflection + warp) * 0.15)
      };
    };

    const drawBlackHole = (time) => {
      if (!blackHole) return;
      const bh = blackHole;
      
      const floatX = Math.sin(time * 0.45) * 10;
      const floatY = Math.cos(time * 0.35) * 15;
      bh.x += (bh.targetX + floatX - bh.x) * 0.05;
      bh.y += (bh.targetY + floatY - bh.y) * 0.05;
      
      bh.pulsePhase += 0.012;
      const pulse = Math.sin(bh.pulsePhase) * 0.06 + 0.94;

      ctx.save();
      ctx.translate(bh.x, bh.y);

      const drawPlasmaDisk = (isBack) => {
        ctx.globalCompositeOperation = 'screen';
        const layers = 18; // More layers for 'fire' intensity
        const segments = 120;
        
        for (let l = 0; l < layers; l++) {
          const rBase = bh.radius * (2.2 + l * 0.18);
          const alphaBase = (0.3 - l * 0.014) * pulse;
          const hue = 260 + (l % 6) * 4;
          
          ctx.beginPath();
          for (let s = 0; s <= segments; s++) {
            const angle = (s / segments) * Math.PI;
            const flowAngle = angle + time * 1.2; // Faster flow
            const diskX = Math.cos(flowAngle) * rBase;
            const diskZ = Math.sin(flowAngle) * rBase;
            
            let x, y;
            if (isBack) {
              const lensedR = bh.radius * 1.05 + l * 1.4;
              x = Math.cos(angle * 2) * lensedR;
              y = Math.sin(angle * 2) * lensedR * 2.4; 
            } else {
              x = diskX;
              y = diskZ * 0.15;
            }

            const beam = 1 - (diskX / rBase) * 0.65; 
            const alpha = alphaBase * beam * (isBack ? 0.35 : 1);
            
            ctx.strokeStyle = `hsla(${hue}, 85%, 75%, ${alpha})`;
            ctx.lineWidth = 1.4;
            
            if (s === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);

            if (s % 12 === 0) {
              ctx.stroke();
              ctx.beginPath();
              ctx.moveTo(x, y);
            }
          }
          ctx.stroke();
        }

        // --- Disk Infall (Plasma diving into the hole) ---
        if (!isBack) {
          ctx.save();
          for (let i = 0; i < 6; i++) {
            const rStart = bh.radius * 2.2;
            const rEnd = bh.radius * 0.95;
            const alpha = 0.15 * pulse;
            const angle = (i / 6) * Math.PI * 2 + time * 1.5;
            
            const grad = ctx.createLinearGradient(
              Math.cos(angle) * rStart, Math.sin(angle) * rStart * 0.1,
              Math.cos(angle) * rEnd, Math.sin(angle) * rEnd * 0.1
            );
            grad.addColorStop(0, `rgba(139, 92, 246, ${alpha})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * rStart, Math.sin(angle) * rStart * 0.1);
            ctx.bezierCurveTo(
              Math.cos(angle + 0.5) * rStart * 0.5, Math.sin(angle + 0.5) * rStart * 0.05,
              Math.cos(angle + 1) * rEnd, Math.sin(angle + 1) * rEnd * 0.02,
              Math.cos(angle + 1.2) * rEnd, Math.sin(angle + 1.2) * rEnd * 0.01
            );
            ctx.stroke();
          }
          ctx.restore();
        }
      };

      // Pass 1: Halo
      drawPlasmaDisk(true);

      // Pass 2: Photon Sphere & Drift (Intense fire at the edge)
      ctx.globalCompositeOperation = 'source-over';
      
      // Outer soft ring (glow)
      const photonGlow = ctx.createRadialGradient(0, 0, bh.radius * 0.9, 0, 0, bh.radius * 1.25);
      photonGlow.addColorStop(0, 'rgba(2, 2, 20, 1)'); // Dark core transition
      photonGlow.addColorStop(0.35, 'rgba(139, 92, 246, 0.4)');
      photonGlow.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
      photonGlow.addColorStop(0.65, 'rgba(139, 92, 246, 0.3)');
      photonGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = photonGlow;
      ctx.beginPath();
      ctx.arc(0, 0, bh.radius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // Sharp Photon Ring (The limit of light)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(0, 0, bh.radius * 1.02, 0, Math.PI * 2);
      ctx.stroke();

      // Pass 3: Bottomless Shadow (Event Horizon)
      const shadowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, bh.radius);
      shadowGrad.addColorStop(0, '#000002'); // Purest black
      shadowGrad.addColorStop(0.85, '#000005');
      shadowGrad.addColorStop(1, '#05051a'); // Deep cosmic blue-black edge
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, bh.radius, 0, Math.PI * 2);
      ctx.fill();

      // Pass 4: Front Disk
      ctx.globalCompositeOperation = 'screen';
      drawPlasmaDisk(false);

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
