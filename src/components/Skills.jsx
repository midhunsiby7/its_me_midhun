import { useEffect, useState } from 'react';
import './Skills.css';

const SKILL_COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#ec4899', '#f59e0b'];

function Skills() {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/skills.json`)
      .then(res => res.json())
      .then(setSkills);
  }, []);

  if (!skills.length) return null;

  return (
    <div className="skills">
      <div className="section-container">
        <p className="section-label reveal">What I Know</p>
        <h2 className="section-title reveal delay-1">
          Skills & <span className="gradient-text">Technologies</span>
        </h2>
        <div className="skills__grid">
          {skills.map((cat, i) => (
            <div key={cat.title} className={`skills__card glass-card reveal delay-${Math.min(i + 2, 6)}`} style={{ '--card-accent': SKILL_COLORS[i % SKILL_COLORS.length] }}>
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

