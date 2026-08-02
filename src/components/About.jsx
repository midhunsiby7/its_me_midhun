import { useEffect, useState } from 'react';
import './About.css';

function About() {
  const [profile, setProfile] = useState(null);
  const [education, setEducation] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.BASE_URL}data/profile.json`).then(res => res.json()),
      fetch(`${import.meta.env.BASE_URL}data/education.json`).then(res => res.json())
    ]).then(([profileData, eduData]) => {
      setProfile(profileData);
      setEducation(eduData);
    });
  }, []);

  if (!profile || !education) return null;

  return (
    <div className="about">
      <div className="section-container">
        <p className="section-label reveal">About Me</p>
        <h2 className="section-title reveal delay-1">
          Embracing Challenges,<br />
          <span className="gradient-text">Pushing Boundaries</span>
        </h2>

        <div className="about__grid">
          <div className="about__bio reveal delay-2">
            {profile.bio.map((paragraph, index) => (
              <p key={index} dangerouslySetInnerHTML={{ __html: paragraph.replace(/Midhun Siby|Bachelor of Computer Applications \(BCA\)|BVM Holy Cross College, Cherpunkal/g, '<strong>$&</strong>') }} />
            ))}
          </div>

          <div className="about__timeline reveal delay-3">
            <h3 className="about__timeline-title">Education</h3>
            <div className="about__timeline-items">
              {education.map((edu, index) => (
                <div key={index} className="about__timeline-item">
                  <div className="about__timeline-dot"></div>
                  <div className="about__timeline-content glass-card">
                    <div className="about__edu-header">
                      <img src={`${import.meta.env.BASE_URL}${edu.logo.replace('/images/', 'images/')}`} alt={edu.institution} className="about__edu-logo" />
                      <div>
                        <span className="about__timeline-year">{edu.year}</span>
                        <h4>{edu.title}</h4>
                        <p><a href={edu.link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.3)', textUnderlineOffset: '4px' }}>{edu.institution}</a></p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="about__traits reveal delay-4">
          {profile.traits.map((trait) => (
            <span key={trait} className="about__trait glass-card">{trait}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default About;
