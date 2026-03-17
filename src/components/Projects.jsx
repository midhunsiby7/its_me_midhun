import './Projects.css';

const projects = [
  {
    title: 'College Canteen Food Ordering App',
    description: 'A fully functional food ordering web application for the college canteen with integrated payment system, Google authentication, order management, and real-time notifications.',
    tech: ['HTML', 'CSS', 'JavaScript', 'Python Flask', 'Google Auth', 'Payment API'],
    gradient: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
    icon: '🍕',
    github: 'https://github.com/midhunsiby7',
  },
  {
    title: 'Arduino Automation Projects',
    description: 'Multiple automation projects built with Arduino Mega including sensor-based systems, motor control, and IoT-enabled devices combining software and hardware expertise.',
    tech: ['Arduino Mega', 'C++', 'Electronics', 'IoT', 'Sensors'],
    gradient: 'linear-gradient(135deg, #06b6d4, #10b981)',
    icon: '🤖',
    github: 'https://github.com/midhunsiby7',
  },
  {
    title: 'Electronics & Hardware Builds',
    description: 'Self-designed inverter circuits, walkman device restorations, and custom electronic assemblies demonstrating deep hardware and electronics knowledge.',
    tech: ['Circuit Design', 'Soldering', 'Power Electronics', 'PCB'],
    gradient: 'linear-gradient(135deg, #ec4899, #f59e0b)',
    icon: '⚡',
    github: null,
  },
];

function Projects() {
  return (
    <div className="projects">
      <div className="section-container">
        <p className="section-label reveal">My Work</p>
        <h2 className="section-title reveal delay-1">
          Featured <span className="gradient-text">Projects</span>
        </h2>
        <div className="projects__grid">
          {projects.map((p, i) => (
            <div key={p.title} className={`projects__card glass-card reveal delay-${Math.min(i + 2, 6)}`}>
              <div className="projects__card-accent" style={{ background: p.gradient }} />
              <div className="projects__card-body">
                <span className="projects__icon">{p.icon}</span>
                <h3 className="projects__title">{p.title}</h3>
                <p className="projects__desc">{p.description}</p>
                <div className="projects__tech">
                  {p.tech.map((t) => <span key={t} className="projects__tech-tag">{t}</span>)}
                </div>
                {p.github && (
                  <a href={p.github} target="_blank" rel="noopener noreferrer" className="projects__link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    <span>View on GitHub</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Projects;
