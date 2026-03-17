import { useState } from 'react';
import './Navbar.css';

function Navbar({ activePage, onNavigate }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'interests', label: 'Interests' },
  ];

  const handleNav = (id) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <button className="navbar__logo" onClick={() => handleNav('home')}>
          <span className="navbar__logo-b">&lt;</span>
          <span className="navbar__logo-n">Midhun</span>
          <span className="navbar__logo-b">/&gt;</span>
        </button>

        {/* Hamburger */}
        <button className={`navbar__hamburger ${mobileOpen ? 'navbar__hamburger--open' : ''}`} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
          <span></span><span></span><span></span>
        </button>

        <div className={`navbar__links ${mobileOpen ? 'navbar__links--open' : ''}`}>
          {navLinks.map((link) => (
            <button
              key={link.id}
              className={`navbar__link ${activePage === link.id ? 'navbar__link--active' : ''}`}
              onClick={() => handleNav(link.id)}
            >
              {link.label}
              {activePage === link.id && <span className="navbar__indicator" />}
            </button>
          ))}
          <button className="navbar__cta" onClick={() => handleNav('contact')}>
            Let's Talk
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
