import './ShowcaseCard.css';

function ShowcaseCard({ item, type }) {
  const { title, description, image, category, featured } = item;
  
  // Map fields dynamically to support both schema types
  const subtitle = item.issuer || item.organization || item.platform;
  const dateStr = item.issueDate || item.date || item.year;
  const primaryUrl = item.credentialUrl || item.link;
  const secondaryUrl = item.verificationUrl;
  const iconFallback = type === 'certificate' ? '📜' : '🏆';
  
  return (
    <div className={`showcase-card glass-card ${featured ? 'showcase-card--featured' : ''}`}>
      <div className="showcase-card__header">
        <div className="showcase-card__visual">
          {image ? (
            <img 
              src={`${import.meta.env.BASE_URL}${image.startsWith('/') ? image.slice(1) : image}`} 
              alt={title} 
              className="showcase-card__image" 
            />
          ) : (
            <span className="showcase-card__icon">{iconFallback}</span>
          )}
        </div>
        <div className="showcase-card__meta">
          <h3 className="showcase-card__title">{title}</h3>
          <p className="showcase-card__subtitle">{subtitle}</p>
          <div className="showcase-card__badges">
            {dateStr && <span className="showcase-card__badge showcase-card__badge--date">{dateStr}</span>}
            {category && <span className="showcase-card__badge showcase-card__badge--category">{category}</span>}
            {item.level && <span className="showcase-card__badge showcase-card__badge--level">{item.level}</span>}
            {item.type && <span className="showcase-card__badge showcase-card__badge--type">{item.type}</span>}
          </div>
        </div>
      </div>
      
      {description && <p className="showcase-card__description">{description}</p>}
      
      {item.skills && item.skills.length > 0 && (
        <div className="showcase-card__skills">
          {item.skills.map(skill => (
            <span key={skill} className="showcase-card__skill">{skill}</span>
          ))}
        </div>
      )}

      {(primaryUrl || secondaryUrl) && (
        <div className="showcase-card__actions">
          {primaryUrl && (
            <a href={primaryUrl} target="_blank" rel="noopener noreferrer" className="showcase-card__btn">
              {type === 'certificate' ? 'View Certificate' : 'View Details'}
            </a>
          )}
          {secondaryUrl && (
            <a href={secondaryUrl} target="_blank" rel="noopener noreferrer" className="showcase-card__btn showcase-card__btn--secondary">
              Verify
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default ShowcaseCard;
