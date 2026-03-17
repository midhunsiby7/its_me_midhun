import './Skills.css';

const skillCategories = [
  {
    title: 'Languages',
    icon: '{ }',
    color: '#8b5cf6',
    skills: ['Python', 'Java', 'C', 'JavaScript', 'HTML', 'CSS'],
  },
  {
    title: 'Frameworks & Tech',
    icon: '⚡',
    color: '#3b82f6',
    skills: ['React', 'Node.js', 'Flask', 'DBMS'],
  },
  {
    title: 'Tools & Platforms',
    icon: '🛠',
    color: '#06b6d4',
    skills: ['VS Code', 'MySQL', 'Firebase', 'Git', 'Arduino', 'PyCharm', 'VMware', 'MySQL Workbench'],
  },
  {
    title: 'Cloud & DevOps',
    icon: '☁',
    color: '#10b981',
    skills: ['AWS', 'Google Compute Engine', 'Microsoft Azure', 'Cloudflare', 'VPS Hosting'],
  },
  {
    title: 'Operating Systems',
    icon: '🖥',
    color: '#ec4899',
    skills: ['Kali Linux', 'CentOS', 'Ubuntu', 'Windows'],
  },
  {
    title: 'AI & Problem Solving',
    icon: '🧠',
    color: '#f59e0b',
    skills: ['Claude', 'ChatGPT', 'Gemini', 'Logical Reasoning', 'Backend Development'],
  },
];

function Skills() {
  return (
    <section id="skills" className="skills">
      <div className="section-container">
        <p className="section-label reveal">What I Know</p>
        <h2 className="section-title reveal delay-1">
          Skills & <span className="gradient-text">Technologies</span>
        </h2>

        <div className="skills__grid">
          {skillCategories.map((category, index) => (
            <div
              key={category.title}
              className={`skills__card glass-card reveal delay-${Math.min(index + 2, 6)}`}
              style={{ '--card-accent': category.color }}
            >
              <div className="skills__card-header">
                <span className="skills__card-icon">{category.icon}</span>
                <h3 className="skills__card-title">{category.title}</h3>
              </div>
              <div className="skills__tags">
                {category.skills.map((skill) => (
                  <span key={skill} className="skills__tag">{skill}</span>
                ))}
              </div>
              <div className="skills__card-glow"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Skills;
