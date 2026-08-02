import { useEffect, useState } from 'react';
import './Interests.css';

const INTEREST_COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#ec4899'];

function Interests() {
  const [interests, setInterests] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/interests.json`)
      .then(res => res.json())
      .then(setInterests);
  }, []);

  if (!interests.length) return null;

  return (
    <div className="interests">
      <div className="section-container">
        <p className="section-label reveal">Beyond Code</p>
        <h2 className="section-title reveal delay-1">
          Things That <span className="gradient-text">Excite Me</span>
        </h2>
        <div className="interests__grid">
          {interests.map((item, i) => (
            <div key={item.title} className={`interests__card glass-card reveal-scale delay-${Math.min(i + 2, 6)}`} style={{ '--accent': INTEREST_COLORS[i % INTEREST_COLORS.length] }}>
              <div className="interests__icon-wrap">
                <span className="interests__icon">{item.icon}</span>
              </div>
              <h3 className="interests__title">{item.title}</h3>
              <p className="interests__desc">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Interests;

