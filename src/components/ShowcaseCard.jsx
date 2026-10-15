import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import './ShowcaseCard.css';

function ShowcaseCard({ item, type }) {
  const { title, description, image, category, featured } = item;
  const [isImageOpen, setIsImageOpen] = useState(false);
  
  // Map fields dynamically to support both schema types
  const subtitle = item.issuer || item.organization || item.platform;
  const dateStr = item.issueDate || item.date || item.year;
  const primaryUrl = item.credentialUrl || item.link;
  const secondaryUrl = item.verificationUrl;
  const iconFallback = type === 'certificate' ? '📜' : '🏆';
  const imageSrc = image
    ? `${import.meta.env.BASE_URL}${image.startsWith('/') ? image.slice(1) : image}`
    : '';

  useEffect(() => {
    if (!isImageOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsImageOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isImageOpen]);
  
  return (
    <div className={`showcase-card glass-card showcase-card--${type} ${featured ? 'showcase-card--featured' : ''}`}>
      <div className="showcase-card__header">
        <div className="showcase-card__media-container">
          {image ? (
            type === 'certificate' ? (
              <button
                type="button"
                className="showcase-card__image-button"
                onClick={() => setIsImageOpen(true)}
                aria-label={`Open ${title} for a closer look`}
              >
                <img src={imageSrc} alt={title} className="showcase-card__image" />
                <span className="showcase-card__image-hint">Tap to enlarge</span>
              </button>
            ) : (
              <img src={imageSrc} alt={title} className="showcase-card__image" />
            )
          ) : (
            <span className="showcase-card__icon">{iconFallback}</span>
          )}
        </div>
        <div className="showcase-card__meta">
          <h3 className="showcase-card__title">{title}</h3>
          <p className="showcase-card__subtitle">{subtitle}</p>
          <div className="showcase-card__badges">
            {dateStr && <span className="showcase-card__badge showcase-card__badge--date">{dateStr}</span>}
            {category && <span className="showcase-card__badge showcase-card__badge--cat">{category}</span>}
            {item.level && <span className="showcase-card__badge showcase-card__badge--lvl">{item.level}</span>}
            {item.type && <span className="showcase-card__badge showcase-card__badge--typ">{item.type}</span>}
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

      {isImageOpen && createPortal(
        <div
          className="certificate-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} certificate preview`}
          onClick={() => setIsImageOpen(false)}
        >
          <div
            className="certificate-lightbox__content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="certificate-lightbox__close"
              onClick={() => setIsImageOpen(false)}
              aria-label="Close certificate preview"
            >
              ×
            </button>
            <img
              src={imageSrc}
              alt={title}
              className="certificate-lightbox__image"
              onClick={() => setIsImageOpen(false)}
            />
            <p className="certificate-lightbox__caption">{title}</p>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

export default ShowcaseCard;
