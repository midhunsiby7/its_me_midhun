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
  const cursorRef = useRef(null);
  const glowRef = useRef(null);
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

  // Spacecraft cursor
  useEffect(() => {
    const craft = cursorRef.current;
    const glow = glowRef.current;
    if (!craft || !glow) return;

    let mx = 0, my = 0, gx = 0, gy = 0;
    let angle = 0, prevX = 0, prevY = 0;

    const move = (e) => {
      mx = e.clientX;
      my = e.clientY;
      // Calculate rotation based on movement direction
      const dx = mx - prevX;
      const dy = my - prevY;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      }
      prevX = mx;
      prevY = my;
      craft.style.left = mx + 'px';
      craft.style.top = my + 'px';
      craft.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    };

    const animGlow = () => {
      gx += (mx - gx) * 0.07;
      gy += (my - gy) * 0.07;
      glow.style.left = gx + 'px';
      glow.style.top = gy + 'px';
      requestAnimationFrame(animGlow);
    };

    document.addEventListener('mousemove', move);
    const raf = requestAnimationFrame(animGlow);

    return () => {
      document.removeEventListener('mousemove', move);
      cancelAnimationFrame(raf);
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
      {/* Spacecraft SVG cursor */}
      <svg ref={cursorRef} className="cursor-spacecraft" width="28" height="28" viewBox="0 0 32 32" fill="none">
        <path d="M16 2 L20 12 L26 14 L20 16 L22 26 L16 20 L10 26 L12 16 L6 14 L12 12 Z" fill="rgba(139, 92, 246, 0.7)" stroke="rgba(139, 92, 246, 0.9)" strokeWidth="0.5"/>
        <path d="M16 5 L18 12 L16 18 L14 12 Z" fill="rgba(200, 180, 255, 0.5)"/>
        {/* Engine trail */}
        <ellipse cx="16" cy="24" rx="3" ry="5" fill="rgba(6, 182, 212, 0.25)"/>
        <ellipse cx="16" cy="22" rx="1.5" ry="2.5" fill="rgba(139, 92, 246, 0.35)"/>
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
