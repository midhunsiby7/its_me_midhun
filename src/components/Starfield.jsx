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

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
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

    // ── Milky Way haze ──
    const drawMilkyWay = () => {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const grad = ctx.createLinearGradient(0, 0, canvas.width * 0.38, 0);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(0.25, 'rgba(180,170,200,0.008)');
      grad.addColorStop(0.5, 'rgba(200,195,210,0.012)');
      grad.addColorStop(0.75, 'rgba(160,150,180,0.006)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.translate(canvas.width * 0.08, canvas.height / 2);
      ctx.rotate(-0.18);
      ctx.fillRect(-canvas.width * 0.12, -canvas.height * 1.2, canvas.width * 0.38, canvas.height * 2.4);
      ctx.restore();
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
      stars.forEach(star => {
        const lensed = getLensedPos(star.x, star.y, blackHole);
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
    createStars();
    animate();

    const handleResize = () => { resize(); createStars(); };
    const handleMouseMove = (e) => {
      if (blackHole) {
        const cx = window.innerWidth * 0.8;
        const cy = window.innerHeight * 0.25;
        blackHole.targetX = cx + (e.clientX - window.innerWidth / 2) * 0.04;
        blackHole.targetY = cy + (e.clientY - window.innerHeight / 2) * 0.04;
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
