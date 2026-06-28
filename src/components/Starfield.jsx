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
    let blackHole = null;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // ── Real constellation star data ──
    // Each star: [RA_fraction, Dec_fraction, magnitude]
    // RA_fraction = 0..1 across viewport width
    // Dec_fraction = 0..1 across viewport height
    // magnitude = visual brightness (lower = brighter)
    const CONSTELLATION_STARS = {
      // Orion — placed center-left, lower half
      orion: [
        [0.28, 0.42, 0.5],  // Betelgeuse (α Ori, mag 0.5)
        [0.35, 0.42, 0.2],  // Rigel (β Ori, mag 0.2)
        [0.30, 0.45, 1.6],  // Bellatrix (γ Ori)
        [0.33, 0.45, 2.1],  // Saiph (κ Ori)
        [0.31, 0.44, 1.7],  // Mintaka (δ Ori, belt)
        [0.315, 0.443, 1.7], // Alnilam (ε Ori, belt)
        [0.32, 0.446, 2.3], // Alnitak (ζ Ori, belt)
        [0.305, 0.435, 3.4], // nebula region star
      ],
      // Gemini — above-right of Orion
      gemini: [
        [0.36, 0.30, 1.2],  // Pollux (β Gem)
        [0.34, 0.28, 1.6],  // Castor (α Gem)
        [0.35, 0.33, 3.0],
        [0.37, 0.32, 2.9],
        [0.33, 0.31, 3.2],
        [0.355, 0.35, 3.5],
      ],
      // Canis Major — below Orion
      canis_major: [
        [0.30, 0.55, -1.5], // Sirius (α CMa, brightest star!)
        [0.32, 0.58, 1.5],  // Adhara
        [0.28, 0.57, 1.8],  // Wezen
        [0.31, 0.60, 2.0],  // Aludra
        [0.29, 0.56, 3.0],
      ],
      // Canis Minor — left of Gemini
      canis_minor: [
        [0.33, 0.38, 0.4],  // Procyon (α CMi)
        [0.34, 0.39, 2.9],  // Gomeisa
      ],
      // Leo — upper-center area
      leo: [
        [0.50, 0.30, 1.4],  // Regulus (α Leo)
        [0.55, 0.25, 2.0],  // Denebola (β Leo)
        [0.52, 0.27, 2.1],  // Algieba (γ Leo)
        [0.48, 0.28, 2.6],
        [0.51, 0.32, 3.0],
        [0.53, 0.29, 2.4],
        [0.49, 0.26, 3.4],
      ],
      // Ursa Major (Big Dipper) — top-left
      ursa_major: [
        [0.12, 0.12, 1.8],  // Dubhe (α UMa)
        [0.15, 0.11, 2.4],  // Merak (β UMa)
        [0.17, 0.13, 2.4],  // Phecda (γ UMa)
        [0.19, 0.11, 3.3],  // Megrez (δ UMa)
        [0.21, 0.10, 1.8],  // Alioth (ε UMa)
        [0.23, 0.09, 2.1],  // Mizar (ζ UMa)
        [0.25, 0.08, 1.9],  // Alkaid (η UMa)
      ],
      // Cassiopeia — top area, W shape
      cassiopeia: [
        [0.42, 0.08, 2.2],  // Schedar (α Cas)
        [0.44, 0.06, 2.3],  // Caph (β Cas)
        [0.43, 0.09, 2.5],  // Tsih (γ Cas)
        [0.45, 0.07, 2.7],  // Ruchbah (δ Cas)
        [0.46, 0.09, 3.4],  // Segin (ε Cas)
      ],
      // Scorpius — lower-right
      scorpius: [
        [0.62, 0.65, 1.1],  // Antares (α Sco)
        [0.60, 0.62, 2.3],
        [0.64, 0.68, 2.6],
        [0.65, 0.70, 2.9],
        [0.63, 0.67, 3.0],
        [0.61, 0.64, 2.8],
      ],
      // Lyra — upper area
      lyra: [
        [0.58, 0.15, 0.0],  // Vega (α Lyr, mag ~0)
        [0.59, 0.17, 3.3],
        [0.57, 0.16, 3.5],
        [0.585, 0.18, 4.0],
      ],
      // Cygnus
      cygnus: [
        [0.55, 0.10, 1.3],  // Deneb (α Cyg)
        [0.56, 0.13, 2.5],  // Sadr (γ Cyg)
        [0.54, 0.12, 3.1],
        [0.57, 0.11, 3.0],
        [0.555, 0.15, 2.2],  // Albireo (β Cyg)
      ],
    };

    const createStars = () => {
      const s = [];
      const w = canvas.width;
      const h = canvas.height;

      // 1. Constellation stars (accurate positions, proper brightness)
      Object.values(CONSTELLATION_STARS).forEach(constellation => {
        constellation.forEach(([rx, ry, mag]) => {
          // Convert magnitude to visual radius: brighter = bigger
          // mag range: -1.5 (Sirius) to 4.0 (faint)
          const radius = Math.max(0.3, 2.2 - mag * 0.35);
          const alpha = Math.min(1, Math.max(0.4, 1.1 - mag * 0.12));
          // Color temperature: bright stars are slightly blue-white
          const temp = mag < 1 ? 'bright' : (mag < 2.5 ? 'medium' : 'dim');

          s.push({
            x: rx * w, y: ry * h,
            radius, alpha, temp,
            twinkleSpeed: 0.015 + Math.random() * 0.01,
            twinkleOffset: Math.random() * Math.PI * 2,
          });
        });
      });

      // 2. Background field stars (tiny, numerous, realistic density)
      const bgCount = Math.min(350, Math.floor(w * h / 5000));
      for (let i = 0; i < bgCount; i++) {
        s.push({
          x: Math.random() * w,
          y: Math.random() * h,
          radius: Math.random() * 0.5 + 0.15,
          alpha: Math.random() * 0.25 + 0.05,
          temp: 'dim',
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }

      // 3. Milky Way band — dense cluster of tiny dust stars (left side, tilted)
      for (let i = 0; i < 300; i++) {
        const bandX = Math.random() * w * 0.35;
        const bandY = Math.random() * h;
        const tiltedX = bandX + (bandY - h / 2) * 0.18;
        // Gaussian-ish distribution across the band width
        const scatter = (Math.random() + Math.random() + Math.random()) / 3;
        const finalX = tiltedX + (scatter - 0.5) * w * 0.08;

        s.push({
          x: finalX, y: bandY,
          radius: Math.random() * 0.25 + 0.05,
          alpha: Math.random() * 0.08 + 0.01,
          temp: 'milky',
          twinkleSpeed: 0,
          twinkleOffset: 0,
        });
      }

      stars = s;

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
      const u = 1.0 / dist;
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

    // ── Star rendering ──
    const getStarColor = (temp, alpha) => {
      if (temp === 'bright') return `rgba(200, 220, 255, ${alpha})`;   // blue-white
      if (temp === 'medium') return `rgba(240, 235, 220, ${alpha})`;   // warm white
      if (temp === 'milky') return `rgba(190, 185, 200, ${alpha})`;   // pale lavender
      return `rgba(210, 215, 225, ${alpha})`;                          // neutral dim
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
        ctx.fillStyle = getStarColor(star.temp, a);
        ctx.fill();
      });

      drawBlackHole(time);

      // Shooting stars (spawning from all directions)
      if (Math.random() < 0.012) { // Reduced frequency from 0.015 to 0.012 (20% reduction)
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
