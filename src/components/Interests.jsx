import './Interests.css';

const interests = [
  { title: 'Astrophysics', description: 'Fascinated by the cosmos — black holes, quantum mechanics, and the mysteries of the universe.', icon: '🔭', color: '#8b5cf6' },
  { title: 'Electronics & Hardware', description: 'Building inverter circuits, restoring walkman devices, and experimenting with custom PCBs.', icon: '🔌', color: '#3b82f6' },
  { title: 'Vehicle Mechanics', description: 'Understanding the engineering behind vehicles — engines, transmission systems, and mechanics.', icon: '🏎', color: '#06b6d4' },
  { title: 'Physics & Science', description: 'Deep curiosity for the laws that govern our universe, from sub-atomic particles to cosmic scales.', icon: '⚛', color: '#ec4899' },
];

function Interests() {
  return (
    <div className="interests">
      <div className="section-container">
        <p className="section-label reveal">Beyond Code</p>
        <h2 className="section-title reveal delay-1">
          Things That <span className="gradient-text">Excite Me</span>
        </h2>
        <div className="interests__grid">
          {interests.map((item, i) => (
            <div key={item.title} className={`interests__card glass-card reveal-scale delay-${Math.min(i + 2, 6)}`} style={{ '--accent': item.color }}>
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
