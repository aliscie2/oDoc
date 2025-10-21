import { motion } from 'framer-motion';
import { Mail, Circle } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import styles from './EmailNotifications.module.css';

export function EmailNotifications() {
  const emails = [
    {
      subject: 'AI Developer Position Match',
      preview: 'A new position matching your skills has been posted. Senior AI Developer needed for...',
      time: '2m ago',
      unread: true
    },
    {
      subject: 'Co-founder Opportunity',
      preview: 'Exciting startup opportunity in the Web3 space. Looking for technical co-founder...',
      time: '1h ago',
      unread: true
    }
  ];

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.content}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3, once: false }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.header}>
              <h2 className={styles.title}>Email Alerts</h2>
              <p className={styles.subtitle}>
                Get notified when new opportunities match your profile. Never miss the perfect job or talent again.
              </p>
            </div>

            <Card className={styles.mainCard}>
              {/* Email Icon */}
              <div className={styles.iconContainer}>
                <div className={styles.iconWrapper}>
                  <div className={styles.iconCircle}>
                    <Mail size={24} />
                  </div>
                  <Badge className={styles.notificationBadge}>
                    2
                  </Badge>
                </div>
              </div>

              {/* Email List */}
              <div className={styles.emailList}>
                {emails.map((email, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ amount: 0.3, once: false }}
                    transition={{ duration: 0.4, delay: idx * 0.2 }}
                  >
                    <Card className={`${styles.emailCard} ${email.unread ? styles.unread : styles.read}`}>
                      <div className={styles.emailContent}>
                        {email.unread && (
                          <Circle size={10} className={styles.unreadDot} fill="currentColor" />
                        )}
                        <div className={styles.emailBody}>
                          <div className={styles.emailHeader}>
                            <p className={styles.emailSubject}>{email.subject}</p>
                            <span className={styles.emailTime}>{email.time}</span>
                          </div>
                          <p className={styles.emailPreview}>{email.preview}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
