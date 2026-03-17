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
  const cursorGlowRef = useRef(null);
  const cursorDotRef = useRef(null);
  const pageRef = useRef(null);

  // Page transition handler
  const handleNavigate = useCallback((page) => {
    if (page === activePage || transitioning) return;
    setTransitioning(true);

    // Start exit animation
    setTimeout(() => {
      setDisplayPage(page);
      setActivePage(page);
      // Scroll to top of page content
      if (pageRef.current) pageRef.current.scrollTop = 0;
      setTimeout(() => setTransitioning(false), 50);
    }, 300);
  }, [activePage, transitioning]);

  // Custom cursor effect
  useEffect(() => {
    const glow = cursorGlowRef.current;
    const dot = cursorDotRef.current;
    if (!glow || !dot) return;

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (target.closest('a, button, .glass-card, .skills__tag, .about__trait')) {
        dot.classList.add('cursor-hover');
      }
    };

    const handleMouseOut = () => {
      dot.classList.remove('cursor-hover');
    };

    const animateGlow = () => {
      glowX += (mouseX - glowX) * 0.08;
      glowY += (mouseY - glowY) * 0.08;
      glow.style.left = glowX + 'px';
      glow.style.top = glowY + 'px';
      requestAnimationFrame(animateGlow);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    const rafId = requestAnimationFrame(animateGlow);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Scroll-reveal observer
  useEffect(() => {
    const observe = () => {
      const els = document.querySelectorAll('.reveal, .reveal-scale');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('revealed'); });
      }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
      els.forEach((el) => {
        el.classList.remove('revealed');
        observer.observe(el);
      });
      return observer;
    };

    // Re-observe on page change
    const timer = setTimeout(() => {
      const obs = observe();
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
      <div ref={cursorGlowRef} className="cursor-glow" />
      <div ref={cursorDotRef} className="cursor-dot" />
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
