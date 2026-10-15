import { useRef, useEffect } from 'react';
import constellationStars from '../data/constellationStars.json';
import './Starfield.css';

function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let stars = [];
    let shootingStars = [];
    let shootingStarCooldown = 0;
    let blackHole = null;
    let milkyWayTexture = null;
    let pointer = null;
    let pointerActive = false;
    let pointerInfluence = 0;
    const pointerEnabled = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createMilkyWayTexture = () => {
      const texture = document.createElement('canvas');
      texture.width = canvas.width;
      texture.height = canvas.height;
      const textureCtx = texture.getContext('2d');
      const w = texture.width;
      const h = texture.height;
      const random = (() => {
        let seed = 17;
        return () => {
          seed = (seed * 1664525 + 1013904223) % 4294967296;
          return seed / 4294967296;
        };
      })();

      textureCtx.save();
      textureCtx.translate(w * 0.13, h * 0.54);
      textureCtx.rotate(-0.2);
      textureCtx.globalCompositeOperation = 'screen';

      const band = textureCtx.createLinearGradient(-w * 0.08, 0, w * 0.58, 0);
      band.addColorStop(0, 'rgba(210, 218, 232, 0)');
      band.addColorStop(0.18, 'rgba(210, 218, 232, 0.012)');
      band.addColorStop(0.5, 'rgba(220, 224, 232, 0.026)');
      band.addColorStop(0.8, 'rgba(195, 204, 222, 0.012)');
      band.addColorStop(1, 'rgba(190, 200, 220, 0)');
      textureCtx.fillStyle = band;
      textureCtx.filter = 'blur(24px)';
      textureCtx.fillRect(-w * 0.1, -h * 0.95, w * 0.68, h * 1.9);

      textureCtx.filter = 'blur(11px)';
      for (let i = 0; i < 18; i += 1) {
        const y = (random() - 0.5) * h * 1.45;
        const width = w * (0.24 + random() * 0.28);
        const x = -w * 0.12 + random() * w * 0.35;
        textureCtx.beginPath();
        textureCtx.moveTo(x, y);
        textureCtx.bezierCurveTo(
          x + width * 0.25, y + (random() - 0.5) * h * 0.08,
          x + width * 0.7, y + (random() - 0.5) * h * 0.12,
          x + width, y + (random() - 0.5) * h * 0.08
        );
        textureCtx.strokeStyle = `rgba(222, 226, 232, ${0.008 + random() * 0.014})`;
        textureCtx.lineWidth = h * (0.008 + random() * 0.018);
        textureCtx.stroke();
      }

      textureCtx.globalCompositeOperation = 'destination-out';
      textureCtx.filter = 'blur(10px)';
      for (let i = 0; i < 7; i += 1) {
        const y = (random() - 0.5) * h * 1.25;
        const width = w * (0.18 + random() * 0.28);
        const x = -w * 0.08 + random() * w * 0.28;
        textureCtx.beginPath();
        textureCtx.moveTo(x, y);
        textureCtx.bezierCurveTo(
          x + width * 0.3, y + (random() - 0.5) * h * 0.06,
          x + width * 0.65, y + (random() - 0.5) * h * 0.1,
          x + width, y + (random() - 0.5) * h * 0.06
        );
        textureCtx.strokeStyle = `rgba(0, 0, 0, ${0.12 + random() * 0.16})`;
        textureCtx.lineWidth = h * (0.012 + random() * 0.018);
        textureCtx.stroke();
      }

      textureCtx.restore();
      milkyWayTexture = texture;
    };

    // ── Real constellation star data ──
    // Coordinates use HYG J2000 right ascension and declination.
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const getStarColor = (colorIndex) => {
      if (colorIndex <= 0) return '200, 220, 255';
      if (colorIndex < 0.45) return '235, 240, 255';
      if (colorIndex < 0.9) return '255, 250, 235';
      if (colorIndex < 1.35) return '255, 225, 190';
      return '255, 205, 170';
    };

    // Hammer-Aitoff projection keeps one coherent, full-sky J2000 layout.
    const projectStar = (star, w, h) => {
      const ra = (star.ra * Math.PI) / 12;
      const dec = (star.dec * Math.PI) / 180;
      const centerRa = Math.PI;
      const lambda = Math.atan2(Math.sin(ra - centerRa), Math.cos(ra - centerRa));
      const denominator = Math.sqrt(1 + Math.cos(dec) * Math.cos(lambda / 2));
      const x = (2 * Math.cos(dec) * Math.sin(lambda / 2)) / denominator;
      const y = Math.sin(dec) / denominator;

      return {
        x: w * 0.5 + x * w * 0.235,
        y: h * 0.5 - y * h * 0.46,
      };
    };

    const createStars = () => {
      const w = canvas.width;
      const h = canvas.height;

      stars = constellationStars.map((star) => {
        const position = projectStar(star, w, h);
        const magnitude = Number(star.magnitude);
        const radius = clamp(0.55 + (4.2 - magnitude) * 0.16, 0.45, 1.25);
        const alpha = clamp(0.38 + (4.5 - magnitude) * 0.12, 0.38, 0.92);

        return {
          ...position,
          radius,
          alpha,
          color: getStarColor(Number(star.colorIndex ?? 0.45)),
          twinkleSpeed: 0.008 + Math.random() * 0.008,
          twinkleOffset: Math.random() * Math.PI * 2,
        };
      });

      blackHole = {
        x: w * 0.8, y: h * 0.25,
        targetX: w * 0.8, targetY: h * 0.25,
        radius: Math.min(w, h) * 0.04, // responsive sizing
        pulsePhase: 0,
      };
    };

    // ── Static, low-contrast Milky Way texture ──
    const drawMilkyWay = () => {
      if (!milkyWayTexture) return;
      ctx.drawImage(milkyWayTexture, 0, 0);
    };

    // ── Geodesic-based gravitational lensing ──
    // Based on Schwarzschild metric: d²u/dφ² = 3/2·Rs·u² - u
    // Simplified for real-time: strong deflection near Rs, natural falloff
    const getLensedPos = (x, y, bh) => {
      const dx = x - bh.x;
      const dy = y - bh.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Inside the shadow — absorbed
      if (dist < bh.radius * 1.05) return null;

      // Schwarzschild-inspired deflection
      const rs = bh.radius * 2.0;
      // From the geodesic ODE: deflection ≈ Rs/b + 15π/16 * (Rs/b)² + ...
      const impact = dist / rs;
      const deflection = rs / (dist * impact) * (1 + 0.9375 / impact);
      const factor = 1 + deflection;

      return {
        x: bh.x + dx * factor,
        y: bh.y + dy * factor,
        mag: Math.min(2.5, 1 + deflection * 0.8),
      };
    };

    // ── Accretion disk (Gargantua-style: thick filled arcs wrapping the shadow) ──
    const drawAccretionDisk = (bh, time, pass) => {
      const r = bh.radius;
      ctx.save();
      ctx.translate(bh.x, bh.y);
      ctx.globalCompositeOperation = 'screen';

      if (pass === 'back') {
        // ── Lensed back-disk: wraps over the TOP of the shadow ──
        // Using filled arcs for a thicker, smoother Gargantua look
        for (let l = 0; l < 15; l++) {
          const t = l / 15;
          const arcWidth = r * (1.8 + t * 0.8);
          const arcHeight = r * (1.1 + t * 1.5);
          const holeWidth = r * (1.1 + t * 0.2); // Inner cutout to leave the shadow
          const holeHeight = r * (0.9 + t * 0.2);

          const alpha = 0.05 - t * 0.03;
          const hue = 30 - t * 15;

          ctx.beginPath();
          // Outer curve (top half)
          ctx.ellipse(0, -r * 0.05, arcWidth, arcHeight, 0, Math.PI, 0);
          // Inner curve (cutout for the shadow) going backwards
          ctx.ellipse(0, -r * 0.05, holeWidth, holeHeight, 0, 0, Math.PI, true);
          ctx.closePath();

          const g = ctx.createLinearGradient(-arcWidth, 0, arcWidth, 0);
          g.addColorStop(0, `hsla(${hue + 10}, 95%, 85%, ${alpha * 1.5})`);
          g.addColorStop(0.3, `hsla(${hue + 5}, 90%, 75%, ${alpha * 1.2})`);
          g.addColorStop(0.5, `hsla(${hue}, 85%, 65%, ${alpha})`);
          g.addColorStop(0.7, `hsla(${hue - 5}, 80%, 55%, ${alpha * 0.6})`);
          g.addColorStop(1, `hsla(${hue - 10}, 75%, 45%, ${alpha * 0.2})`);

          ctx.fillStyle = g;
          ctx.fill();
        }

        // ── Dimmer lensed arc BELOW the shadow ──
        for (let l = 0; l < 10; l++) {
          const t = l / 10;
          const arcWidth = r * (1.6 + t * 0.6);
          const arcHeight = r * (0.9 + t * 1.0);
          const holeWidth = r * (1.0 + t * 0.1);
          const holeHeight = r * (0.8 + t * 0.1);

          const alpha = 0.02 - t * 0.015;
          const hue = 25 - t * 10;

          ctx.beginPath();
          // Outer curve (bottom half)
          ctx.ellipse(0, r * 0.05, arcWidth, arcHeight, 0, 0, Math.PI);
          // Inner curve (cutout) going backwards
          ctx.ellipse(0, r * 0.05, holeWidth, holeHeight, 0, Math.PI, 0, true);
          ctx.closePath();

          const g = ctx.createLinearGradient(-arcWidth, 0, arcWidth, 0);
          g.addColorStop(0, `hsla(${hue + 5}, 90%, 75%, ${alpha * 1.3})`);
          g.addColorStop(0.5, `hsla(${hue}, 85%, 65%, ${alpha})`);
          g.addColorStop(1, `hsla(${hue - 5}, 80%, 50%, ${alpha * 0.3})`);

          ctx.fillStyle = g;
          ctx.fill();
        }

      } else if (pass === 'front') {
        // ── Main horizontal accretion disk ──
        for (let l = 0; l < 15; l++) {
          const rDisk = r * (1.8 + l * 0.3);
          const t = l / 15;
          const hue = 25 - t * 15;
          const alpha = (0.09 - t * 0.05);

          // Doppler beaming: left side brighter
          const g = ctx.createLinearGradient(-rDisk, 0, rDisk, 0);
          g.addColorStop(0, `hsla(${hue + 15}, 98%, 88%, ${alpha * 2.0})`);
          g.addColorStop(0.2, `hsla(${hue + 10}, 95%, 80%, ${alpha * 1.5})`);
          g.addColorStop(0.5, `hsla(${hue}, 90%, 70%, ${alpha})`);
          g.addColorStop(0.8, `hsla(${hue - 5}, 85%, 55%, ${alpha * 0.4})`);
          g.addColorStop(1, `hsla(${hue - 10}, 80%, 40%, ${alpha * 0.1})`);

          ctx.beginPath();
          ctx.ellipse(0, 0, rDisk, rDisk * 0.08, 0, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }

        // Inner bright glow connecting disk to shadow smoothly
        const innerG = ctx.createRadialGradient(0, 0, r * 1.1, 0, 0, r * 2.2);
        innerG.addColorStop(0, 'hsla(35, 95%, 85%, 0.08)');
        innerG.addColorStop(0.4, 'hsla(28, 90%, 75%, 0.04)');
        innerG.addColorStop(1, 'hsla(20, 80%, 55%, 0)');
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 2.2, r * 0.18, 0, 0, Math.PI * 2);
        ctx.fillStyle = innerG;
        ctx.fill();
      }
      ctx.restore();
    };

    // ── Black hole core (reduced opacity) ──
    const drawBlackHole = (time) => {
      if (!blackHole) return;
      const bh = blackHole;

      // Gentle floating
      const fx = Math.sin(time * 0.5) * 10;
      const fy = Math.cos(time * 0.38) * 14;
      bh.x += (bh.targetX + fx - bh.x) * 0.035;
      bh.y += (bh.targetY + fy - bh.y) * 0.035;
      bh.pulsePhase += 0.012;

      // Pass 1: Back halo
      drawAccretionDisk(bh, time, 'back');

      // Pass 2: Photon sphere + event horizon
      ctx.save();
      ctx.translate(bh.x, bh.y);
      ctx.globalCompositeOperation = 'source-over';

      // Subtle photon sphere glow (reduced opacity)
      const pg = ctx.createRadialGradient(0, 0, bh.radius * 0.9, 0, 0, bh.radius * 1.3);
      pg.addColorStop(0, '#000000');
      pg.addColorStop(0.35, 'rgba(255, 100, 20, 0.12)');
      pg.addColorStop(0.50, 'rgba(255, 220, 150, 0.25)');
      pg.addColorStop(0.65, 'rgba(255, 150, 50, 0.08)');
      pg.addColorStop(1, 'transparent');
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.arc(0, 0, bh.radius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Event horizon — the void
      const vg = ctx.createRadialGradient(0, 0, 0, 0, 0, bh.radius);
      vg.addColorStop(0, '#000000');
      vg.addColorStop(0.92, '#000001');
      vg.addColorStop(1, '#060300');
      ctx.fillStyle = vg;
      ctx.beginPath();
      ctx.arc(0, 0, bh.radius, 0, Math.PI * 2);
      ctx.fill();

      // Thin photon ring (subtle)
      ctx.strokeStyle = 'rgba(255, 220, 160, 0.2)';
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.arc(0, 0, bh.radius * 1.02, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      // Pass 3: Front disk
      drawAccretionDisk(bh, time, 'front');
    };

    // ── Animation loop ──
    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.016;

      drawMilkyWay();

      // Draw stars with gravitational lensing
      const pointerDx = pointer ? pointer.x - blackHole.x : 0;
      const pointerDy = pointer ? pointer.y - blackHole.y : 0;
      const pointerDistance = Math.sqrt(pointerDx * pointerDx + pointerDy * pointerDy);
      const pointerRadius = Math.max(140, Math.min(canvas.width, canvas.height) * 0.2);
      const pointerTarget = pointerEnabled && pointerActive
        ? clamp(1 - pointerDistance / pointerRadius, 0, 1) ** 2
        : 0;
      pointerInfluence += (pointerTarget - pointerInfluence) * 0.08;

      stars.forEach(star => {
        let starX = star.x;
        let starY = star.y;
        if (pointerEnabled && pointer && blackHole && pointerInfluence > 0.001) {
          const starDx = star.x - blackHole.x;
          const starDy = star.y - blackHole.y;
          const starDistance = Math.sqrt(starDx * starDx + starDy * starDy);
          const starRadius = Math.max(180, Math.min(canvas.width, canvas.height) * 0.26);
          const starInfluence = clamp(1 - starDistance / starRadius, 0, 1);
          const influence = pointerInfluence * starInfluence * starInfluence;
          const movement = Math.min(2.2, pointerDistance * 0.012) * influence;

          starX += (pointerDx / Math.max(pointerDistance, 1)) * movement;
          starY += (pointerDy / Math.max(pointerDistance, 1)) * movement;
        }

        const lensed = getLensedPos(starX, starY, blackHole);
        if (!lensed) return;

        const tw = star.twinkleSpeed > 0
          ? Math.sin(time * star.twinkleSpeed * 60 + star.twinkleOffset) * 0.3 + 0.7
          : 1;
        const r = star.radius * lensed.mag;
        const a = star.alpha * tw * Math.min(1.5, lensed.mag);

        ctx.beginPath();
        ctx.arc(lensed.x, lensed.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${star.color}, ${a})`;
        ctx.fill();
      });

      drawBlackHole(time);

      // Shooting stars (spawning from all directions)
      shootingStarCooldown = Math.max(0, shootingStarCooldown - 1);
      if (shootingStars.length === 0 && shootingStarCooldown === 0 && Math.random() < 0.004) {
        const side = Math.floor(Math.random() * 4);
        let x, y, vx, vy;
        const speed = Math.random() * 3 + 2;

        if (side === 0) { // top
          x = Math.random() * canvas.width; y = -10;
          const a = (Math.random() * 140 + 20) * (Math.PI / 180);
          vx = Math.cos(a) * speed; vy = Math.sin(a) * speed;
        } else if (side === 1) { // right
          x = canvas.width + 10; y = Math.random() * canvas.height;
          const a = (Math.random() * 140 + 110) * (Math.PI / 180);
          vx = Math.cos(a) * speed; vy = Math.sin(a) * speed;
        } else if (side === 2) { // bottom
          x = Math.random() * canvas.width; y = canvas.height + 10;
          const a = (Math.random() * 140 + 200) * (Math.PI / 180);
          vx = Math.cos(a) * speed; vy = Math.sin(a) * speed;
        } else { // left
          x = -10; y = Math.random() * canvas.height;
          const a = (Math.random() * 140 - 70) * (Math.PI / 180);
          vx = Math.cos(a) * speed; vy = Math.sin(a) * speed;
        }

        shootingStars.push({
          x, y, vx, vy,
          alpha: 1,
          history: [] // For curved gravity trails
        });
        shootingStarCooldown = Math.floor(Math.random() * 240) + 240;
      }

      shootingStars = shootingStars.filter(s => s.alpha > 0);
      shootingStars.forEach(s => {
        // Physical gravity deflection from the black hole
        const dx = blackHole.x - s.x;
        const dy = blackHole.y - s.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        // Apply gravitational pull if close, but not inside
        if (dist > blackHole.radius * 0.8) {
          const force = (blackHole.radius * 90) / Math.max(distSq, 100);
          s.vx += (dx / dist) * force;
          s.vy += (dy / dist) * force;
        } else {
          s.alpha -= 0.1; // Fade fast if sucked in
        }

        // Track history for drawing
        s.history.unshift({ x: s.x, y: s.y });
        if (s.history.length > 25) s.history.pop();

        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= 0.006;

        // Draw curved, lensed trail
        if (s.history.length > 1) {
          ctx.beginPath();
          let firstLensed = null;
          let lastLensed = null;

          for (let i = 0; i < s.history.length; i++) {
            const pt = getLensedPos(s.history[i].x, s.history[i].y, blackHole);
            if (pt) {
              if (!firstLensed) firstLensed = pt;
              if (i === 0) ctx.moveTo(pt.x, pt.y);
              else ctx.lineTo(pt.x, pt.y);
              lastLensed = pt;
            }
          }

          if (firstLensed && lastLensed) {
            const g = ctx.createLinearGradient(firstLensed.x, firstLensed.y, lastLensed.x, lastLensed.y);
            g.addColorStop(0, `rgba(255,255,255,${s.alpha})`);
            g.addColorStop(1, 'rgba(255,200,100,0)');
            ctx.strokeStyle = g;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    resize();
    createMilkyWayTexture();
    createStars();
    animate();

    const handleResize = () => {
      resize();
      createMilkyWayTexture();
      createStars();
    };
    const handleMouseMove = (e) => {
      if (pointerEnabled) {
        pointer = { x: e.clientX, y: e.clientY };
        pointerActive = true;
      }
    };
    const handleMouseLeave = () => { pointerActive = false; };

    window.addEventListener('resize', handleResize);
    if (pointerEnabled) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseleave', handleMouseLeave);
    }
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (pointerEnabled) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="starfield" />;
}

export default Starfield;
