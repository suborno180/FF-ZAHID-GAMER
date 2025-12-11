import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Brand Section */}
        <div className="footer-brand-section">
          <div className="footer-brand">
            <img src="/logo.png" alt="FF ZAHID GAMER" className="footer-logo" />
            <div className="footer-brand-info">
              <h3 className="footer-brand-name">FF ZAHID GAMER</h3>
              <p className="footer-tagline">Your Trusted Free Fire Marketplace</p>
            </div>
          </div>
        </div>

        {/* YouTube Channel Section */}
        <div className="youtube-section">
          <svg className="yt-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
          </svg>
          <div className="yt-info">
            <span className="yt-name">FF ZAHID GAMER</span>
            <span className="yt-subs">226K Subscribers</span>
          </div>
          <span className="yt-subscribe-btn">Subscribe</span>
        </div>

        {/* Social Links */}
        <div className="footer-social-section">
          <a href="https://www.youtube.com/@ZahidGamerFF-" target="_blank" rel="noopener noreferrer" className="social-link">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
            </svg>
          </a>
          <a href="https://www.facebook.com/zahidgamerbd" target="_blank" rel="noopener noreferrer" className="social-link">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
            </svg>
          </a>
          <a href="https://www.facebook.com/people/FF-ZAHID-GAMER/100094445037191/" target="_blank" rel="noopener noreferrer" className="social-link">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
            </svg>
          </a>
        </div>

        {/* Bottom Info */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} FF ZAHID GAMER. All Rights Reserved.
          </p>
          <div className="footer-badges">
            <span className="badge">
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M12 1l3.09 6.26l6.91 1.01l-5 4.87l1.18 6.88l-6.18-3.25l-6.18 3.25l1.18-6.88l-5-4.87l6.91-1.01l3.09-6.26z"/>
              </svg> Secure
            </span>
            <span className="badge">
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M12 22s8-4 8-10v-6l-8-4l-8 4v6c0 6 8 10 8 10z"/>
              </svg> Verified
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;