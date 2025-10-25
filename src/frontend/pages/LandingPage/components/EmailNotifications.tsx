import { motion } from 'framer-motion';
import { Mail, Bell } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import styles from './EmailNotifications.module.css';

export function EmailNotifications() {
  const notifications = [
    {
      subject: 'AI Developer Position Match',
      preview: 'Senior AI Developer needed for blockchain startup',
      time: '2m ago',
      type: 'job'
    },
    {
      subject: 'Co-founder Opportunity',
      preview: 'Technical co-founder for Web3 platform',
      time: '1h ago',
      type: 'opportunity'
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
              <h2 className={styles.title}>Instant Alerts</h2>
              <p className={styles.subtitle}>
                Get notified when opportunities match your profile
              </p>
            </div>

            <Card className={styles.mainCard}>
              <div className={styles.cardHeader}>
                <div className={styles.headerRow}>
                  <div className={styles.iconBadge}>
                    <Bell size={16} />
                    <span>Notifications</span>
                  </div>
                  <Badge variant="destructive" className={styles.countBadge}>
                    {notifications.length}
                  </Badge>
                </div>
              </div>

              <div className={styles.notificationsList}>
                {notifications.map((notification, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ amount: 0.3, once: false }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                  >
                    <Card className={styles.notificationCard}>
                      <div className={styles.notificationContent}>
                        <Mail size={16} className={styles.notificationIcon} />
                        <div className={styles.notificationBody}>
                          <div className={styles.notificationHeader}>
                            <p className={styles.notificationSubject}>{notification.subject}</p>
                            <span className={styles.notificationTime}>{notification.time}</span>
                          </div>
                          <p className={styles.notificationPreview}>{notification.preview}</p>
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
