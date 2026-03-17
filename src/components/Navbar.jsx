import './Navbar.css';

function Navbar({ activePage, onNavigate }) {
  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'interests', label: 'Interests' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <button className="navbar__logo" onClick={() => onNavigate('home')}>
          <span className="navbar__logo-bracket">&lt;</span>
          <span className="navbar__logo-name">Midhun</span>
          <span className="navbar__logo-bracket">/&gt;</span>
        </button>

        <div className="navbar__links">
          {navLinks.map((link) => (
            <button
              key={link.id}
              className={`navbar__link ${activePage === link.id ? 'navbar__link--active' : ''}`}
              onClick={() => onNavigate(link.id)}
            >
              {link.label}
              {activePage === link.id && <span className="navbar__link-indicator" />}
            </button>
          ))}
          <button className="navbar__cta" onClick={() => onNavigate('contact')}>
            Let's Talk
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
