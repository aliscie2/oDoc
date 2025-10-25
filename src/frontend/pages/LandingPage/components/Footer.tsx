import { ImageWithFallback } from './figma/ImageWithFallback';
import styles from './remaining-components.module.css';
import LoginButton from '@/components/MainComponents/topNavBar/loginButton';

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

          {/* Affiliate Program */}
          <div>
            <h3 style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>Affiliate Program</h3>
            <p style={{ fontSize: '0.875rem', color: '#a3a3a3', marginBottom: '0.75rem' }}>
              Early partners earn 50% commission on all referrals
            </p>
            <LoginButton
              variant="outlined"
              userType={"AFFILIATE"}
              sx={{ 
                width: "100%", 
                minHeight: "40px",
                color: "#ffffff",
                borderColor: "#ffffff",
                "&:hover": {
                  borderColor: "#e5e5e5",
                  backgroundColor: "rgba(255, 255, 255, 0.1)"
                }
              }}
            >
              Try it now
            </LoginButton>
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
