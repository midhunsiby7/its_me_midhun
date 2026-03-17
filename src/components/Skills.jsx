import './Skills.css';

const skillCategories = [
  { title: 'Languages', icon: '{ }', color: '#8b5cf6', skills: ['Python', 'Java', 'C', 'JavaScript', 'HTML', 'CSS'] },
  { title: 'Frameworks & Tech', icon: '⚡', color: '#3b82f6', skills: ['React', 'Node.js', 'Flask', 'DBMS'] },
  { title: 'Tools & Platforms', icon: '🛠', color: '#06b6d4', skills: ['VS Code', 'MySQL', 'Firebase', 'Git', 'Arduino', 'PyCharm', 'VMware', 'MySQL Workbench'] },
  { title: 'Cloud & DevOps', icon: '☁', color: '#10b981', skills: ['AWS', 'Google Compute Engine', 'Microsoft Azure', 'Cloudflare', 'VPS Hosting'] },
  { title: 'Operating Systems', icon: '🖥', color: '#ec4899', skills: ['Kali Linux', 'CentOS', 'Ubuntu', 'Windows'] },
  { title: 'AI & Problem Solving', icon: '🧠', color: '#f59e0b', skills: ['Claude', 'ChatGPT', 'Gemini', 'Logical Reasoning', 'Backend Development'] },
];

function Skills() {
  return (
    <div className="skills">
      <div className="section-container">
        <p className="section-label reveal">What I Know</p>
        <h2 className="section-title reveal delay-1">
          Skills & <span className="gradient-text">Technologies</span>
        </h2>
        <div className="skills__grid">
          {skillCategories.map((cat, i) => (
            <div key={cat.title} className={`skills__card glass-card reveal delay-${Math.min(i + 2, 6)}`} style={{ '--card-accent': cat.color }}>
              <div className="skills__card-header">
                <span className="skills__card-icon">{cat.icon}</span>
                <h3 className="skills__card-title">{cat.title}</h3>
              </div>
              <div className="skills__tags">
                {cat.skills.map((s) => (
                  <span key={s} className="skills__tag">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Skills;
