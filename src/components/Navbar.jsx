import { useState } from 'react';
import certificatesData from '../../public/data/certificates.json';
import achievementsData from '../../public/data/achievements.json';
import './Navbar.css';

function Navbar({ activePage, onNavigate }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' }
  ];

  if (certificatesData.length > 0) {
    navLinks.push({ id: 'certificates', label: 'Certificates' });
  }

  if (achievementsData.length > 0) {
    navLinks.push({ id: 'achievements', label: 'Achievements' });
  }

  navLinks.push({ id: 'interests', label: 'Interests' });


  const handleNav = (id) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <button onClick={() => handleNav('home')} className="navbar__logo">
          &lt;Midhun<span className="navbar__logo-b">/&gt;</span> <span style={{fontSize: '10px', opacity: 0.3}}>v7.1</span>
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
