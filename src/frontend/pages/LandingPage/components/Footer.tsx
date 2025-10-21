import { Github, Twitter, Youtube } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import styles from './remaining-components.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerGrid}>
          {/* Left - Brand */}
          <div>
            <div className={styles.footerBrand}>
              <ImageWithFallback 
                src="/logo.png"
                alt="oDoc Logo"
                className={styles.footerLogo}
              />
              <span style={{ fontSize: '1.125rem' }}>oDoc</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#a3a3a3' }}>
              AI-powered job matching • Smart contracts • Team management
            </p>
          </div>

          {/* Middle - Resources */}
          <div>
            <h3 style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>Resources</h3>
            <ul className={styles.footerLinks}>
              <li>
                <a href="/white_paper" className={styles.footerLink}>
                  White Paper
                </a>
              </li>
            </ul>
          </div>

          {/* Right - Community */}
          <div>
            <h3 style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>Follow Us</h3>
            <div className={styles.footerSocial}>
              <a href="https://github.com/aliscie2/oDoc" target="_blank" rel="noopener noreferrer" className={styles.footerSocialIcon}>
                <Github size={18} />
              </a>
              <a href="https://x.com/odoc_ic" target="_blank" rel="noopener noreferrer" className={styles.footerSocialIcon}>
                <Twitter size={18} />
              </a>
              <a href="https://www.youtube.com/@odoc_ic" target="_blank" rel="noopener noreferrer" className={styles.footerSocialIcon}>
                <Youtube size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className={styles.footerBottom}>
          <p className={styles.footerCopyright}>
            © {new Date().getFullYear()} oDoc.app. All rights reserved.
          </p>
          <a href="/privacy" className={styles.footerLink}>
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
