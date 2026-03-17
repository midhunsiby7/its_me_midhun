import schoolLogo from '../assets/school-logo.png';
import collegeLogo from '../assets/college-logo.png';
import './About.css';

function About() {
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
            <p>
              I'm Midhun Siby — a passionate student, developer, and programmer who thrives on
              turning ideas into reality through code. Currently pursuing my{' '}
              <strong>Bachelor of Computer Applications (BCA)</strong> at{' '}
              <strong>BVM Holy Cross College, Cherpunkal</strong>, I bring a unique blend of
              software skills and hardware curiosity to everything I build.
            </p>
            <p>
              Known for my adaptive, minimal, and confident personality, I'm someone who embraces
              challenges, takes risks, and constantly pushes boundaries to achieve what seems
              impossible. My goal is not only to excel in the IT field but to continuously explore
              and master diverse domains of interest.
            </p>
          </div>

          <div className="about__timeline reveal delay-3">
            <h3 className="about__timeline-title">Education</h3>
            <div className="about__timeline-items">
              <div className="about__timeline-item">
                <div className="about__timeline-dot"></div>
                <div className="about__timeline-content glass-card">
                  <div className="about__edu-header">
                    <img src={collegeLogo} alt="BVM Holy Cross College" className="about__edu-logo" />
                    <div>
                      <span className="about__timeline-year">2023 — Present</span>
                      <h4>Bachelor of Computer Applications</h4>
                      <p>BVM Holy Cross College, Cherpunkal</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="about__timeline-item">
                <div className="about__timeline-dot"></div>
                <div className="about__timeline-content glass-card">
                  <div className="about__edu-header">
                    <img src={schoolLogo} alt="St. Antony's Public School" className="about__edu-logo" />
                    <div>
                      <span className="about__timeline-year">Completed</span>
                      <h4>Higher Secondary & Schooling</h4>
                      <p>St. Antony's Public School, Anakkal</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="about__traits reveal delay-4">
          {['Adaptive', 'Minimal', 'Confident', 'Risk-taker', 'Problem Solver'].map((trait) => (
            <span key={trait} className="about__trait glass-card">{trait}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default About;
