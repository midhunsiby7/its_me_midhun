import certificatesData from '../../public/data/certificates.json';
import ShowcaseCard from './ShowcaseCard';
import './Certificates.css';

function Certificates() {
  const sorted = [...certificatesData].sort((a, b) => a.order - b.order);

  return (
    <div className="certificates">
      <div className="section-container">
        <div className="section-header">
          <h2 className="section-title">
            Professional <span className="text-gradient">Certificates</span>
          </h2>
          <p className="section-subtitle">My continued learning and verified credentials</p>
        </div>

        {sorted.length === 0 ? (
          <div className="empty-state glass-card reveal">
            <span className="empty-state__icon">🎓</span>
            <p className="empty-state__text">
              I'm continuously learning and earning new certifications. This section will grow over time.
            </p>
          </div>
        ) : (
          <div className="showcase-grid">
            {sorted.map((cert, index) => (
              <div key={cert.id} className={`reveal delay-${(index % 3) + 1}`}>
                <ShowcaseCard item={cert} type="certificate" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Certificates;
