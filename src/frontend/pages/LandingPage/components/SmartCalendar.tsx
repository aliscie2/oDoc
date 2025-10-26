import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { User, Bot, Calendar, Clock } from 'lucide-react';
import styles from './SmartCalendar.module.css';

export function SmartCalendar() {
  const [activeTab, setActiveTab] = useState<'availability' | 'meeting'>('availability');

  const scenarios = {
    availability: {
      user: "Set me available Mon-Wed 9 AM - 1 PM",
      bot: ['Monday', 'Tuesday', 'Wednesday'].map(day => ({ day, time: '9 AM - 1 PM' }))
    },
    meeting: {
      user: "Find me a good time to meet Sarah tomorrow",
      bot: { date: 'Tomorrow', time: '10:00 AM', with: 'Sarah' }
    }
  };

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

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <button
                onClick={() => setActiveTab('availability')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border-primary)',
                  backgroundColor: activeTab === 'availability' ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                  color: activeTab === 'availability' ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Calendar size={16} />
                Set Availability
              </button>
              <button
                onClick={() => setActiveTab('meeting')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border-primary)',
                  backgroundColor: activeTab === 'meeting' ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                  color: activeTab === 'meeting' ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Clock size={16} />
                Schedule Meeting
              </button>
            </div>

            <Card className={styles.chatCard}>
              <div className={styles.messages}>
                <div className={`${styles.messageRow} ${styles.user}`}>
                  <div className={`${styles.message} ${styles.user}`}>
                    <p>{scenarios[activeTab].user}</p>
                  </div>
                  <div className={`${styles.avatar} ${styles.user}`}>
                    <User size={16} />
                  </div>
                </div>

                <div className={`${styles.messageRow} ${styles.bot}`}>
                  <div className={`${styles.avatar} ${styles.bot}`}>
                    <Bot size={16} />
                  </div>
                  <div style={{ maxWidth: '85%' }}>
                    {activeTab === 'availability' ? (
                      <>
                        <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
                          Your availability has been set:
                        </p>
                        {scenarios.availability.bot.map((slot, idx) => (
                          <Card key={idx} className={styles.timeSlot}>
                            <div className={styles.timeSlotContent}>
                              <span className={styles.timeSlotDay}>{slot.day}</span>
                              <span className={styles.timeSlotHours}>{slot.time}</span>
                            </div>
                          </Card>
                        ))}
                      </>
                    ) : (
                      <Card style={{ padding: '1rem', backgroundColor: 'var(--color-bg-secondary)' }}>
                        <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Meeting scheduled:</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <div>
                            <p style={{ fontSize: '0.875rem' }}>{scenarios.meeting.bot.date} • {scenarios.meeting.bot.time}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                              Meeting with {scenarios.meeting.bot.with}
                            </p>
                          </div>
                          <Badge>Confirmed</Badge>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
