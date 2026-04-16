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

    const getLensedPos = (x, y, bh) => {
      const dx = x - bh.x;
      const dy = y - bh.y;
      const d2 = dx * dx + dy * dy;
      const d = Math.sqrt(d2);
      
      if (d < bh.radius * 0.95) return null;

      // Extreme 'Interstellar' Schwarzschild Lensing
      const rs = bh.radius * 1.8;
      const deflection = (rs * rs) / (d + 0.1);
      
      // Near-horizon warp factor - create the 'Gargantua' distortion
      const warp = Math.pow(rs / d, 3.2) * 2.2;
      const factor = 1 + (deflection + warp) / d;
      
      return {
        x: bh.x + dx * factor,
        y: bh.y + dy * factor,
        mag: Math.min(4, 1 + (deflection + warp) * 0.2)
      };
    };

    const drawBlackHole = (time) => {
      if (!blackHole) return;
      const bh = blackHole;
      
      const floatX = Math.sin(time * 0.5) * 12;
      const floatY = Math.cos(time * 0.4) * 15;
      bh.x += (bh.targetX + floatX - bh.x) * 0.04;
      bh.y += (bh.targetY + floatY - bh.y) * 0.04;
      
      bh.pulsePhase += 0.015;
      const pulse = Math.sin(bh.pulsePhase) * 0.05 + 0.95;

      ctx.save();
      ctx.translate(bh.x, bh.y);

      // Gargantua Color Palette
      const colors = {
        outer: 'rgba(255, 69, 0, 0.25)', // Red-Orange
        mid: 'rgba(255, 140, 0, 0.45)',  // Dark Orange
        inner: 'rgba(255, 215, 0, 0.8)', // Gold
        photon: 'rgba(255, 255, 255, 0.95)' // White-Hot
      };

      const drawPlasmaDisk = (isBack) => {
        ctx.globalCompositeOperation = 'screen';
        
        // High density filaments for that 'turbulent gas' look
        const layers = 22; 
        const segments = 100;
        
        for (let l = 0; l < layers; l++) {
          const rBase = bh.radius * (2.4 + l * 0.15);
          const hue = 15 + (l % 5) * 6; // Range: 15-45 (Deep Red to Gold)
          const alphaBase = (0.22 - l * 0.008) * pulse;
          
          ctx.beginPath();
          for (let s = 0; s <= segments; s++) {
            // Distribute points around the disk
            const angle = (s / segments) * Math.PI; 
            const flowSpeed = 1.2 + l * 0.05;
            const flowAngle = angle + time * flowSpeed;
            
            const diskX = Math.cos(flowAngle) * rBase;
            const diskZ = Math.sin(flowAngle) * rBase;
            
            let x, y;
            if (isBack) {
              // The Halo (Warped back part)
              // Interstellar logic: back part rises above and below the horizon
              const lensedR = bh.radius + l * 1.6;
              const angleLensed = angle * 2; 
              x = Math.cos(angleLensed) * lensedR;
              y = Math.sin(angleLensed) * lensedR * 1.15; // More circular, slightly vertical stretch for realism            } else {
              // The Main Disk (Front part)
              x = diskX;
              y = diskZ * 0.12; 
            }

            // --- Relativistic Doppler Beaming ---
            // Side rotating toward us (left) is much brighter/whiter
            // Side moving away (right) is dimmer/redder
            const velocityEffect = 1 - (diskX / rBase) * 0.7; // Asymmetry
            const brightness = velocityEffect * alphaBase;
            const tempHue = hue + (velocityEffect > 1 ? 15 : 0); // Whiter on left
            
            ctx.strokeStyle = `hsla(${tempHue}, 95%, ${50 + velocityEffect * 25}%, ${brightness})`;
            ctx.lineWidth = 1.6 - l * 0.05;

            // Add turbulence noise to the path
            const noise = Math.sin(time * 2 + s * 0.5 + l) * 1.5;
            const finalX = x + noise * (isBack ? 0.2 : 1);
            const finalY = y + noise * (isBack ? 1 : 0.2);

            if (s === 0) ctx.moveTo(finalX, finalY);
            else ctx.lineTo(finalX, finalY);

            // Break path into filaments to create the 'streaky' plasma texture
            if (s % 10 === 0) {
              ctx.stroke();
              ctx.beginPath();
              ctx.moveTo(finalX, finalY);
            }
          }
          ctx.stroke();
        }

        // --- Realistic Disk Infall (Sink) ---
        if (!isBack) {
          ctx.save();
          for (let i = 0; i < 8; i++) {
            const rot = (i / 8) * Math.PI * 2 + time * 1.2;
            const rStart = bh.radius * 2.4;
            const rEnd = bh.radius * 0.98;
            
            const grad = ctx.createLinearGradient(
              Math.cos(rot) * rStart, Math.sin(rot) * rStart * 0.1,
              Math.cos(rot + 0.8) * rEnd, Math.sin(rot + 0.8) * rEnd * 0.05
            );
            grad.addColorStop(0, 'rgba(255, 140, 0, 0.15)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(Math.cos(rot) * rStart, Math.sin(rot) * rStart * 0.1);
            ctx.bezierCurveTo(
              Math.cos(rot + 0.4) * rStart * 0.6, Math.sin(rot + 0.4) * rStart * 0.05,
              Math.cos(rot + 0.7) * rEnd, Math.sin(rot + 0.7) * rEnd * 0.02,
              Math.cos(rot + 0.8) * rEnd, Math.sin(rot + 0.8) * rEnd * 0.01
            );
            ctx.stroke();
          }
          ctx.restore();
        }
      };

      // 1. Halo Pass
      drawPlasmaDisk(true);

      // 2. High-Contrast Event Horizon & Photon Sphere
      ctx.globalCompositeOperation = 'source-over';
      
      // Intense Inner Glow (Atmosphere of light at the edge)
      const photonGlow = ctx.createRadialGradient(0, 0, bh.radius * 0.85, 0, 0, bh.radius * 1.3);
      photonGlow.addColorStop(0, '#000000');
      photonGlow.addColorStop(0.32, 'rgba(255, 69, 0, 0.5)'); 
      photonGlow.addColorStop(0.48, 'rgba(255, 255, 255, 0.95)'); // Photon Limit
      photonGlow.addColorStop(0.65, 'rgba(255, 215, 0, 0.4)');
      photonGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = photonGlow;
      ctx.beginPath();
      ctx.arc(0, 0, bh.radius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // The Void (Perfect Black Shadow)
      const voidGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, bh.radius);
      voidGrad.addColorStop(0, '#000000');
      voidGrad.addColorStop(0.9, '#000002');
      voidGrad.addColorStop(1, '#050200'); // Faint warm edge
      ctx.fillStyle = voidGrad;
      ctx.beginPath();
      ctx.arc(0, 0, bh.radius, 0, Math.PI * 2);
      ctx.fill();

      // Sharp Photon Ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.arc(0, 0, bh.radius * 1.01, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Front Disk Pass
      drawPlasmaDisk(false);

      ctx.restore();
    };

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.016;

      // Draw Stars with Heavy Gravitational Lensing
      stars.forEach((star) => {
        const lensed = getLensedPos(star.x, star.y, blackHole);
        if (!lensed) return; 

        const tw = Math.sin(time * star.twinkleSpeed * 60 + star.twinkleOffset) * 0.35 + 0.65;
        const drawX = lensed.x;
        const drawY = lensed.y;
        const drawR = star.radius * lensed.mag;

        ctx.beginPath();
        ctx.arc(drawX, drawY, drawR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 230, 255, ${star.alpha * tw * Math.min(1.8, lensed.mag)})`;
        ctx.fill();

        if (star.radius > 1) {
          ctx.beginPath();
          ctx.arc(drawX, drawY, drawR * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(139, 92, 246, ${star.alpha * tw * 0.05})`;
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
      if (Math.random() < 0.002) {
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
        const lensedT = getLensedPos(s.x - Math.cos(s.angle)*s.length, s.y - Math.sin(s.angle)*s.length, blackHole);
        
        if (lensed && lensedT) {
          const grad = ctx.createLinearGradient(lensed.x, lensed.y, lensedT.x, lensedT.y);
          grad.addColorStop(0, `rgba(255, 255, 255, ${s.alpha})`);
          grad.addColorStop(1, 'rgba(255, 140, 0, 0)');
          ctx.beginPath();
          ctx.moveTo(lensed.x, lensed.y);
          ctx.lineTo(lensedT.x, lensedT.y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
        
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.alpha -= 0.006;
      });

      animationId = requestAnimationFrame(animate);
    };

    resize();
    createStars();
    animate();

    const handleResize = () => { resize(); createStars(); };
    const handleMouseMove = (e) => {
      if (blackHole) {
        const cX = window.innerWidth * 0.8;
        const cY = window.innerHeight * 0.25;
        blackHole.targetX = cX + (e.clientX - window.innerWidth / 2) * 0.04;
        blackHole.targetY = cY + (e.clientY - window.innerHeight / 2) * 0.04;
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
