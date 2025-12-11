import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Shield,
  Youtube,
  Facebook,
} from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const [subscriberCount, setSubscriberCount] = useState('226K');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriberCount = async () => {
      try {
        const API_KEY = 'AIzaSyDGD-2p3UO51mU4f7ADewVOsLKn-ubGFU0';
        const CHANNEL_ID = 'UCxvYGbWqE5q8Y0Z8kZJZ0ZQ'; // Extract from your channel URL if needed
        
        // Try to get channel ID from username
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=statistics&forUsername=ZahidGamerFF&key=${API_KEY}`
        );
        
        if (!response.ok) {
          // If username doesn't work, try with the channel URL handle
          const handleResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=@ZahidGamerFF-&type=channel&key=${API_KEY}`
          );
          
          if (handleResponse.ok) {
            const handleData = await handleResponse.json();
            if (handleData.items && handleData.items.length > 0) {
              const channelId = handleData.items[0].snippet.channelId;
              
              // Now fetch the statistics
              const statsResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${API_KEY}`
              );
              
              if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                if (statsData.items && statsData.items.length > 0) {
                  const count = parseInt(statsData.items[0].statistics.subscriberCount);
                  setSubscriberCount(formatSubscriberCount(count));
                }
              }
            }
          }
        } else {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            const count = parseInt(data.items[0].statistics.subscriberCount);
            setSubscriberCount(formatSubscriberCount(count));
          }
        }
      } catch (error) {
        console.error('Error fetching subscriber count:', error);
        setSubscriberCount('226K'); // Fallback
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriberCount();
    // Refresh every 5 minutes
    const interval = setInterval(fetchSubscriberCount, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatSubscriberCount = (count: number): string => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(0) + 'K';
    }
    return count.toString();
  };
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
        <a
          href="https://www.youtube.com/@ZahidGamerFF-"
          target="_blank"
          rel="noopener noreferrer"
          className="youtube-section"
        >
          <Youtube className="yt-icon" />
          <div className="yt-info">
            <span className="yt-name">FF ZAHID GAMER</span>
            <span className="yt-subs">{loading ? 'Loading...' : `${subscriberCount} Subscribers`}</span>
          </div>
          <span className="yt-subscribe-btn">Subscribe</span>
        </a>

        {/* Social Links */}
        <div className="footer-social-section">
          <a href="https://www.youtube.com/@ZahidGamerFF-" target="_blank" rel="noopener noreferrer" className="social-link">
            <Youtube size={20} />
          </a>
          <a href="https://www.facebook.com/zahidgamerbd" target="_blank" rel="noopener noreferrer" className="social-link">
            <Facebook size={20} />
          </a>
          <a href="https://www.facebook.com/people/FF-ZAHID-GAMER/100094445037191/" target="_blank" rel="noopener noreferrer" className="social-link">
            <Facebook size={20} />
          </a>
        </div>

        {/* Bottom Info */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} FF ZAHID GAMER. All Rights Reserved.
          </p>
          <div className="footer-badges">
            <span className="badge">
              <Shield size={14} /> Secure
            </span>
            <span className="badge">
              <Sparkles size={14} /> Verified
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

