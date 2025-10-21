import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { User, Bot } from 'lucide-react';
import styles from './SmartCalendar.module.css';

export function SmartCalendar() {
  const [phase, setPhase] = useState<'availability' | 'meeting'>('availability');

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(prev => prev === 'availability' ? 'meeting' : 'availability');
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
              <h2 className={styles.title}>Smart Calendar</h2>
              <p className={styles.subtitle}>
                Chat with your calendar to set availability and schedule meetings naturally
              </p>
            </div>

            <Card className={styles.chatCard}>
              {/* Chat Interface */}
              <div className={styles.messages}>
                <AnimatePresence mode="wait">
                  {phase === 'availability' ? (
                    <motion.div
                      key="availability"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4 }}
                    >
                      {/* User Message */}
                      <div className={`${styles.messageRow} ${styles.user}`}>
                        <div className={`${styles.message} ${styles.user}`}>
                          <p>Set me available Mon-Wed 9 AM - 1 PM</p>
                        </div>
                        <div className={`${styles.avatar} ${styles.user}`}>
                          <User size={16} />
                        </div>
                      </div>

                      {/* Bot Response */}
                      <div className={`${styles.messageRow} ${styles.bot}`}>
                        <div className={`${styles.avatar} ${styles.bot}`}>
                          <Bot size={16} />
                        </div>
                        <div style={{ maxWidth: '85%' }}>
                          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>Your availability has been set:</p>
                          {['Monday', 'Tuesday', 'Wednesday'].map((day, idx) => (
                            <Card key={idx} className={styles.timeSlot}>
                              <div className={styles.timeSlotContent}>
                                <span className={styles.timeSlotDay}>{day}</span>
                                <span className={styles.timeSlotHours}>9 AM - 1 PM</span>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="meeting"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4 }}
                    >
                      {/* User Message */}
                      <div className={`${styles.messageRow} ${styles.user}`}>
                        <div className={`${styles.message} ${styles.user}`}>
                          <p>Find me a good time to meet Sarah tomorrow</p>
                        </div>
                        <div className={`${styles.avatar} ${styles.user}`}>
                          <User size={16} />
                        </div>
                      </div>

                      {/* Bot Response */}
                      <div className={`${styles.messageRow} ${styles.bot}`}>
                        <div className={`${styles.avatar} ${styles.bot}`}>
                          <Bot size={16} />
                        </div>
                        <div style={{ maxWidth: '85%' }}>
                          <Card style={{ padding: '1rem', backgroundColor: 'var(--color-bg-secondary)' }}>
                            <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Meeting scheduled:</p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                              <div>
                                <p>Tomorrow • 10:00 AM</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Meeting with Sarah</p>
                              </div>
                              <Badge>Confirmed</Badge>
                            </div>
                          </Card>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
