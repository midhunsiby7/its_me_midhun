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
      const scale = 0.55;
      texture.width = Math.max(1, Math.floor(canvas.width * scale));
      texture.height = Math.max(1, Math.floor(canvas.height * scale));
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
      const equatorialToGalactic = [
        [-0.0548755604, -0.8734370902, -0.4838350155],
        [0.4941094279, -0.4448296300, 0.7469822445],
        [-0.8676661490, -0.1980763734, 0.4559837762],
      ];

      const galacticToScreen = (longitude, latitude) => {
        const cosLat = Math.cos(latitude);
        const galacticVector = [
          cosLat * Math.cos(longitude),
          cosLat * Math.sin(longitude),
          Math.sin(latitude),
        ];
        const equatorialVector = equatorialToGalactic[0].map((_, row) => (
          equatorialToGalactic[0][row] * galacticVector[0]
          + equatorialToGalactic[1][row] * galacticVector[1]
          + equatorialToGalactic[2][row] * galacticVector[2]
        ));
        const ra = Math.atan2(equatorialVector[1], equatorialVector[0]);
        const dec = Math.asin(equatorialVector[2]);
        const lambda = Math.atan2(Math.sin(ra - Math.PI), Math.cos(ra - Math.PI));
        const denominator = Math.sqrt(1 + Math.cos(dec) * Math.cos(lambda / 2));
        const projectedX = (2 * Math.cos(dec) * Math.sin(lambda / 2)) / denominator;
        const projectedY = Math.sin(dec) / denominator;

        return {
          x: w * 0.5 + projectedX * w * 0.235,
          y: h * 0.5 - projectedY * h * 0.46,
        };
      };

      const drawSoftPoint = (x, y, radius, alpha, color) => {
        if (x < -radius || x > w + radius || y < -radius || y > h + radius) return;
        const gradient = textureCtx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(${color}, ${alpha})`);
        gradient.addColorStop(1, `rgba(${color}, 0)`);
        textureCtx.fillStyle = gradient;
        textureCtx.beginPath();
        textureCtx.arc(x, y, radius, 0, Math.PI * 2);
        textureCtx.fill();
      };

      // The Galactic plane is rendered from l/b coordinates, then projected
      // with the same Hammer-Aitoff orientation as the catalog stars.
      textureCtx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 2600; i += 1) {
        const longitude = random() * Math.PI * 2;
        const latitude = (random() + random() + random() - 1.5) * (Math.PI / 18);
        const point = galacticToScreen(longitude, latitude);
        const leftBias = clamp(1.25 - point.x / w, 0.35, 1);
        const centerRichness = 0.7 + 0.3 * Math.cos(longitude) ** 2;
        const alpha = (0.002 + random() * 0.009) * leftBias * centerRichness;
        const radius = 0.35 + random() * 1.6;
        drawSoftPoint(point.x, point.y, radius, alpha, random() > 0.18 ? '205, 214, 226' : '224, 218, 204');
      }

      // A second, finer pass creates grain without adding identifiable stars.
      for (let i = 0; i < 4200; i += 1) {
        const longitude = random() * Math.PI * 2;
        const latitude = (random() + random() - 1) * (Math.PI / 30);
        const point = galacticToScreen(longitude, latitude);
        const leftBias = clamp(1.2 - point.x / w, 0.25, 1);
        const alpha = (0.001 + random() * 0.004) * leftBias;
        drawSoftPoint(point.x, point.y, 0.2 + random() * 0.55, alpha, '190, 202, 218');
      }

      // Irregular dust lanes are dark, translucent paths rather than stripes.
      textureCtx.globalCompositeOperation = 'source-over';
      textureCtx.filter = 'blur(2px)';
      for (let lane = 0; lane < 11; lane += 1) {
        const startLongitude = random() * Math.PI * 2;
        const width = (0.16 + random() * 0.3) * Math.PI;
        const points = [];
        for (let step = 0; step <= 16; step += 1) {
          const longitude = startLongitude + (step / 16) * width;
          const latitude = ((random() - 0.5) * 0.045) + Math.sin(step * 0.8 + lane) * 0.018;
          points.push(galacticToScreen(longitude, latitude));
        }
        textureCtx.beginPath();
        textureCtx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i += 1) {
          textureCtx.lineTo(points[i].x, points[i].y);
        }
        textureCtx.strokeStyle = `rgba(3, 6, 12, ${0.08 + random() * 0.12})`;
        textureCtx.lineWidth = h * (0.008 + random() * 0.018);
        textureCtx.stroke();
      }

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
      ctx.drawImage(milkyWayTexture, 0, 0, canvas.width, canvas.height);
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
