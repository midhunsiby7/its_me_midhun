import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import Starfield from './components/Starfield';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Interests from './components/Interests';
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
    let craftX = mouseX, craftY = mouseY;
    let craftAngle = 0;
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
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    document.addEventListener('mousemove', onMove);

    const loop = () => {
      // Smooth follow — spacecraft lags behind cursor
      const dx = mouseX - craftX;
      const dy = mouseY - craftY;
      craftX += dx * 0.08;
      craftY += dy * 0.08;

      // Rotate towards movement direction
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 2) {
        const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        // Smooth angle interpolation
        let angleDiff = targetAngle - craftAngle;
        if (angleDiff > 180) angleDiff -= 360;
        if (angleDiff < -180) angleDiff += 360;
        craftAngle += angleDiff * 0.1;
      }

      craft.style.left = craftX + 'px';
      craft.style.top = craftY + 'px';
      craft.style.transform = `translate(-50%, -50%) rotate(${craftAngle}deg)`;

      // Glow follows even slower
      glowX += (mouseX - glowX) * 0.04;
      glowY += (mouseY - glowY) * 0.04;
      glow.style.left = glowX + 'px';
      glow.style.top = glowY + 'px';

      // Emit trail particles when moving
      if (dist > 3) {
        const angleRad = (craftAngle - 90) * (Math.PI / 180);
        // Engine position (behind the spacecraft)
        const engineX = craftX - Math.cos(angleRad) * 14;
        const engineY = craftY - Math.sin(angleRad) * 14;
        particles.push({
          x: engineX + (Math.random() - 0.5) * 4,
          y: engineY + (Math.random() - 0.5) * 4,
          vx: -Math.cos(angleRad) * (Math.random() * 1.5 + 0.5),
          vy: -Math.sin(angleRad) * (Math.random() * 1.5 + 0.5),
          alpha: 0.6,
          size: Math.random() * 2.5 + 1,
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
        p.alpha -= 0.02;
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
      case 'contact': return <Contact onNavigate={handleNavigate} />;
      default: return <Hero onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="app">
      <Starfield />
      <div ref={glowRef} className="cursor-glow" />
      {/* Realistic spacecraft SVG cursor — larger and detailed */}
      <svg ref={craftRef} className="cursor-spacecraft" width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Main fuselage */}
        <path d="M18 2 C18 2 22 10 23 16 L24 28 L22 32 L18 36 L14 32 L12 28 L13 16 C14 10 18 2 18 2Z" fill="rgba(180, 160, 220, 0.6)" stroke="rgba(139, 92, 246, 0.8)" strokeWidth="0.6"/>
        {/* Cockpit window */}
        <ellipse cx="18" cy="12" rx="3" ry="4" fill="rgba(6, 182, 212, 0.35)" stroke="rgba(6, 182, 212, 0.5)" strokeWidth="0.4"/>
        <ellipse cx="18" cy="11" rx="1.5" ry="2" fill="rgba(100, 220, 255, 0.25)"/>
        {/* Left wing */}
        <path d="M12 22 L4 30 L6 32 L12 28Z" fill="rgba(139, 92, 246, 0.5)" stroke="rgba(139, 92, 246, 0.6)" strokeWidth="0.4"/>
        {/* Right wing */}
        <path d="M24 22 L32 30 L30 32 L24 28Z" fill="rgba(139, 92, 246, 0.5)" stroke="rgba(139, 92, 246, 0.6)" strokeWidth="0.4"/>
        {/* Center stripe */}
        <path d="M18 6 L18 30" stroke="rgba(200, 180, 255, 0.2)" strokeWidth="0.8"/>
        {/* Engine glow — left */}
        <ellipse cx="15" cy="35" rx="2.5" ry="4" fill="rgba(6, 182, 212, 0.2)"/>
        <ellipse cx="15" cy="34" rx="1.2" ry="2.5" fill="rgba(139, 92, 246, 0.25)"/>
        {/* Engine glow — right */}
        <ellipse cx="21" cy="35" rx="2.5" ry="4" fill="rgba(6, 182, 212, 0.2)"/>
        <ellipse cx="21" cy="34" rx="1.2" ry="2.5" fill="rgba(139, 92, 246, 0.25)"/>
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
