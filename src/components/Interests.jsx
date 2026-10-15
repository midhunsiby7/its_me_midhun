import interests from '../../public/data/interests.json';
import './Interests.css';

const INTEREST_COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#ec4899'];

function Interests() {

  return (
    <div className="interests">
      <div className="section-container">
        <p className="section-label reveal">Beyond Code</p>
        <h2 className="section-title reveal delay-1">
          Things That <span className="gradient-text">Excite Me</span>
        </h2>
        <div className="interests__intro reveal delay-2">
          <span className="interests__intro-mark">01</span>
          <p>
            The same curiosity that pulls me toward software also shows up in the things I study,
            repair, and build away from a screen.
          </p>
        </div>
        <div className="interests__grid">
          {interests.map((item, i) => (
            <article key={item.title} className={`interests__card glass-card reveal-scale delay-${Math.min(i + 3, 6)}`} style={{ '--accent': INTEREST_COLORS[i % INTEREST_COLORS.length] }}>
              <div className="interests__icon-wrap">
                <span className="interests__icon">{item.icon}</span>
              </div>
              <span className="interests__index">0{i + 1}</span>
              <h3 className="interests__title">{item.title}</h3>
              <p className="interests__desc">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Interests;
