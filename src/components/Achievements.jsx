import achievementsData from '../../public/data/achievements.json';
import ShowcaseCard from './ShowcaseCard';
import './Achievements.css';

function Achievements() {
  const sorted = [...achievementsData].sort((a, b) => a.order - b.order);

  return (
    <div className="achievements">
      <div className="section-container">
        <div className="section-header">
          <h2 className="section-title">
            Milestones & <span className="text-gradient">Achievements</span>
          </h2>
          <p className="section-subtitle">Highlights from my academic and professional journey</p>
        </div>

        {sorted.length === 0 ? (
          <div className="empty-state glass-card reveal">
            <span className="empty-state__icon">🚀</span>
            <p className="empty-state__text">
              My professional milestones and achievements will appear here as my journey continues.
            </p>
          </div>
        ) : (
          <div className="showcase-grid">
            {sorted.map((ach, index) => (
              <div key={ach.id} className={`reveal delay-${(index % 3) + 1}`}>
                <ShowcaseCard item={ach} type="achievement" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Achievements;
