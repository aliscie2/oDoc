import { motion } from 'framer-motion';
import { MessageCircle, Twitter, Hash, Youtube, Instagram, Music, Linkedin } from 'lucide-react';
import styles from './remaining-components.module.css';

export function SocialMedia() {
  const platforms = [
    { name: 'Telegram', icon: <MessageCircle size={20} />, link: 'https://t.me/odoc_ic' },
    { name: 'X', icon: <Twitter size={20} />, link: 'https://x.com/odoc_ic' },
    { name: 'Discord', icon: <Hash size={20} />, link: 'https://discord.gg/HbaFQXDD' },
    { name: 'YouTube', icon: <Youtube size={20} />, link: 'https://www.youtube.com/@odoc_ic' },
    { name: 'Instagram', icon: <Instagram size={20} />, link: 'https://www.instagram.com/odoc_ic' },
    { name: 'TikTok', icon: <Music size={20} />, link: 'https://www.tiktok.com/@odoc.app' },
    { name: 'LinkedIn', icon: <Linkedin size={20} />, link: 'https://www.linkedin.com/company/odocic' }
  ];

  return (
    <section className={styles.socialSection}>
      <div className="container">
        <div className={styles.socialContent}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3, once: false }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.socialHeader}>
              <h2 style={{ fontSize: '1.875rem', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Join Our Community</h2>
              <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)' }}>Connect with us on your favorite platform</p>
            </div>

            <div className={styles.socialGrid}>
              {platforms.map((platform, idx) => (
                <motion.a
                  key={idx}
                  href={platform.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ amount: 0.3, once: false }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  whileHover={{ scale: 1.1, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className={styles.socialIcon}
                >
                  {platform.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
