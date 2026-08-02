import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import Starfield from './components/Starfield';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Interests from './components/Interests';
import Certificates from './components/Certificates';
import Achievements from './components/Achievements';
import Contact from './components/Contact';

function App() {
  const [activePage, setActivePage] = useState('home');
  const [transitioning, setTransitioning] = useState(false);
  const [displayPage, setDisplayPage] = useState('home');
  const craftRef = useRef(null);
  const glowRef = useRef(null);
  const trailsRef = useRef([]);
  const pageRef = useRef(null);

  const handleNavigate = useCallback((page) => {
    if (page === activePage || transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setDisplayPage(page);
      setActivePage(page);
      if (pageRef.current) pageRef.current.scrollTop = 0;
      setTimeout(() => setTransitioning(false), 50);
    }, 250);
  }, [activePage, transitioning]);

  // Realistic spacecraft cursor with trailing lag and engine particles
  useEffect(() => {
    const craft = craftRef.current;
    const glow = glowRef.current;
    if (!craft || !glow) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let lastMouseX = mouseX, lastMouseY = mouseY;
    let craftX = mouseX, craftY = mouseY;
    let vx = 0, vy = 0;
    let craftAngle = 0;
    let trailAngle = 0;
    let glowX = mouseX, glowY = mouseY;

    // Trail particles
    const trailCanvas = document.createElement('canvas');
    trailCanvas.className = 'cursor-trail-canvas';
    trailCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9998;';
    document.body.appendChild(trailCanvas);
    const tCtx = trailCanvas.getContext('2d');

    const resizeTrail = () => {
      trailCanvas.width = window.innerWidth;
      trailCanvas.height = window.innerHeight;
    };
    resizeTrail();
    window.addEventListener('resize', resizeTrail);

    let particles = [];

    const onMove = (e) => {
      lastMouseX = mouseX;
      lastMouseY = mouseY;
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      const dx = mouseX - lastMouseX;
      const dy = mouseY - lastMouseY;
      if (Math.sqrt(dx * dx + dy * dy) > 1.5) {
        trailAngle = Math.atan2(dy, dx);
      }
    };
    document.addEventListener('mousemove', onMove);

    const loop = () => {
      // Spacecraft trails consistently BEHIND the direction of mouse movement
      const trailDistance = 55; // Fixed space between cursor and Endurance
      const targetX = mouseX - Math.cos(trailAngle) * trailDistance;
      const targetY = mouseY - Math.sin(trailAngle) * trailDistance;

      // Realistic, slow spring physics for a heavy, massive spacecraft feel
      const ax = (targetX - craftX) * 0.007; // Very soft spring
      const ay = (targetY - craftY) * 0.007;
      vx += ax;
      vy += ay;
      vx *= 0.93; // High friction so it floats smoothly
      vy *= 0.93;
      
      craftX += vx;
      craftY += vy;

      // Rotate naturally towards the current velocity vector
      const speed = Math.sqrt(vx * vx + vy * vy);
      if (speed > 0.1) {
        const targetAngle = Math.atan2(vy, vx) * (180 / Math.PI) + 90;
        let angleDiff = targetAngle - craftAngle;
        
        // Normalize angle to prevent 360-degree 'teleport' spins
        while (angleDiff > 180) angleDiff -= 360;
        while (angleDiff < -180) angleDiff += 360;
        
        craftAngle += angleDiff * 0.05; // Very slow, graceful rotation easing
      } else {
        // Very subtle idle floating rotation when still
        craftAngle += Math.sin(Date.now() * 0.001) * 0.1;
      }

      craft.style.left = craftX + 'px';
      craft.style.top = craftY + 'px';
      craft.style.transform = `translate(-50%, -50%) rotate(${craftAngle}deg)`;

      // Glow follows the native cursor smoothly
      glowX += (mouseX - glowX) * 0.15;
      glowY += (mouseY - glowY) * 0.15;
      glow.style.left = glowX + 'px';
      glow.style.top = glowY + 'px';

      // Emit trail particles based on speed
      if (speed > 1.2) {
        const angleRad = (craftAngle - 90) * (Math.PI / 180);
        // Engine position (behind the Endurance ring, radius ~24)
        const engineX = craftX - Math.cos(angleRad) * 22;
        const engineY = craftY - Math.sin(angleRad) * 22;
        
        // Add particle with slight randomness
        particles.push({
          x: engineX + (Math.random() - 0.5) * 6,
          y: engineY + (Math.random() - 0.5) * 6,
          vx: -Math.cos(angleRad) * (Math.random() * 2 + 1) + (Math.random() - 0.5) * 0.5,
          vy: -Math.sin(angleRad) * (Math.random() * 2 + 1) + (Math.random() - 0.5) * 0.5,
          alpha: 0.7,
          size: Math.random() * 3 + 1.5,
          color: Math.random() > 0.5 ? '139, 92, 246' : '6, 182, 212',
        });
      }

      // Draw trail particles
      tCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
      particles = particles.filter(p => p.alpha > 0.01);
      particles.forEach(p => {
        tCtx.beginPath();
        tCtx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2);
        tCtx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        tCtx.fill();
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.015;
        p.size *= 0.98;
      });

      requestAnimationFrame(loop);
    };

    const raf = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', resizeTrail);
      cancelAnimationFrame(raf);
      if (trailCanvas.parentNode) trailCanvas.parentNode.removeChild(trailCanvas);
    };
  }, []);

  // Scroll reveal
  useEffect(() => {
    const timer = setTimeout(() => {
      const els = document.querySelectorAll('.reveal, .reveal-scale');
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('revealed'); });
      }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });
      els.forEach((el) => { el.classList.remove('revealed'); obs.observe(el); });
      return () => obs.disconnect();
    }, 100);
    return () => clearTimeout(timer);
  }, [displayPage]);

  const renderPage = () => {
    switch (displayPage) {
      case 'home': return <Hero onNavigate={handleNavigate} />;
      case 'about': return <About />;
      case 'skills': return <Skills />;
      case 'projects': return <Projects />;
      case 'interests': return <Interests />;
      case 'certificates': return <Certificates />;
      case 'achievements': return <Achievements />;
      case 'contact': return <Contact onNavigate={handleNavigate} />;
      default: return <Hero onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="app">
      <Starfield />
      <div ref={glowRef} className="cursor-glow" />
      {/* Endurance Spacecraft SVG (Interstellar) */}
      <svg ref={craftRef} className="cursor-spacecraft" width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 0px 4px rgba(255,255,255,0.2))' }}>
        {/* Central Hub */}
        <circle cx="28" cy="28" r="4" fill="rgba(200, 200, 210, 0.9)" />
        <circle cx="28" cy="28" r="2" fill="rgba(100, 100, 110, 0.8)" />
        
        {/* Connection Spokes */}
        <line x1="28" y1="12" x2="28" y2="44" stroke="rgba(160, 160, 175, 0.7)" strokeWidth="1.5" />
        <line x1="12" y1="28" x2="44" y2="28" stroke="rgba(160, 160, 175, 0.7)" strokeWidth="1.5" />
        
        {/* Main Ring */}
        <circle cx="28" cy="28" r="16" stroke="rgba(140, 140, 155, 0.8)" strokeWidth="1.5" />
        
        {/* 12 Ring Modules */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30) * (Math.PI / 180);
          const x = 28 + Math.cos(angle) * 16;
          const y = 28 + Math.sin(angle) * 16;
          const rot = i * 30 + 90; // Align module tangent to the ring
          return (
            <g key={i} transform={`rotate(${rot} ${x} ${y})`}>
              <rect x={x - 3.5} y={y - 2.5} width="7" height="5" rx="0.5" fill="rgba(230, 230, 245, 0.95)" stroke="rgba(80, 80, 95, 0.8)" strokeWidth="0.5" />
              <line x1={x - 1} y1={y - 2.5} x2={x - 1} y2={y + 2.5} stroke="rgba(80, 80, 95, 0.5)" strokeWidth="0.5" />
              <line x1={x + 1} y1={y - 2.5} x2={x + 1} y2={y + 2.5} stroke="rgba(80, 80, 95, 0.5)" strokeWidth="0.5" />
            </g>
          );
        })}
        
        {/* Subtle Engine Glow at the bottom rear module */}
        <ellipse cx="28" cy="46" rx="3.5" ry="5" fill="rgba(6, 182, 212, 0.3)" filter="blur(1px)" />
        <ellipse cx="28" cy="45" rx="1.5" ry="3" fill="rgba(139, 92, 246, 0.4)" />
      </svg>
      <Navbar activePage={activePage} onNavigate={handleNavigate} />
      <div className="page-wrapper" ref={pageRef}>
        <div className={`page-content ${transitioning ? 'page-exit' : 'page-active'}`}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

export default App;
