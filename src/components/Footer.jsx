import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__left">
          <span className="footer__logo">
            <span style={{ color: 'var(--accent-purple)' }}>&lt;</span>
            Midhun Siby
            <span style={{ color: 'var(--accent-purple)' }}>/&gt;</span>
          </span>
        </div>
        <p className="footer__copy">
          © {new Date().getFullYear()} Midhun Siby. Built with React & ❤️
        </p>
        <div className="footer__links">
          <a href="https://github.com/midhunsiby7" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/midhun-siby-bb6010377/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="mailto:midhunsibi123@gmail.com">Email</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
