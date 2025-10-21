import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { FileText, DollarSign, Calendar, User, FileCheck } from 'lucide-react';
import styles from './remaining-components.module.css';

export function CryptoEscrow() {
  const [activeContract, setActiveContract] = useState(0);

  const contracts = [
    {
      amount: '500 USDC',
      receiver: { name: 'John Smith', role: 'Senior ICP Developer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d' },
      stakingDuration: '30 days',
      conditions: [
        'Complete smart contract audit',
        'Deploy to mainnet',
        'Pass security review'
      ]
    },
    {
      amount: '1,200 USDC',
      receiver: { name: 'Sarah Johnson', role: 'UI/UX Designer', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80' },
      stakingDuration: '45 days',
      conditions: [
        'Deliver final design mockups',
        'Complete user testing',
        'Handoff to development'
      ]
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveContract(prev => (prev + 1) % contracts.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const contract = contracts[activeContract];

  return (
    <section className={styles.cryptoSection}>
      <div className="container">
        <div className={styles.cryptoContent}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3, once: false }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.cryptoHeader}>
              <h2 style={{ fontSize: '1.875rem', marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>Secure Escrow Agreements</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                Transparent blockchain contracts with automated escrow
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeContract}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card className={styles.cryptoCard}>
                  {/* Contract Header */}
                  <div className={styles.contractHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className={styles.contractIcon}>
                        <FileText size={18} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}>Escrow Contract</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Smart Agreement</p>
                      </div>
                    </div>
                    <Badge>Active</Badge>
                  </div>

                  <div className={styles.contractGrid}>
                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {/* Amount */}
                      <div className={styles.infoBox}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <DollarSign size={16} />
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Amount</span>
                        </div>
                        <p style={{ fontSize: '1.5rem', color: 'var(--color-text-primary)' }}>{contract.amount}</p>
                      </div>

                      {/* Duration */}
                      <div className={styles.infoBox}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <Calendar size={16} />
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Duration</span>
                        </div>
                        <p style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>{contract.stakingDuration}</p>
                      </div>

                      {/* Receiver */}
                      <div className={styles.infoBox}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <User size={16} />
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Receiver</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <img 
                            src={contract.receiver.avatar} 
                            alt={contract.receiver.name}
                            style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
                          />
                          <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>{contract.receiver.name}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{contract.receiver.role}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Conditions */}
                    <div>
                      <div className={styles.infoBox} style={{ height: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                          <FileCheck size={16} />
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Conditions</span>
                        </div>
                        
                        <div className={styles.conditions}>
                          {contract.conditions.map((condition, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.4, delay: idx * 0.1 }}
                              className={styles.conditionItem}
                            >
                              <div className={styles.conditionNumber}>
                                {idx + 1}
                              </div>
                              <p style={{ fontSize: '0.875rem', flex: 1 }}>{condition}</p>
                            </motion.div>
                          ))}
                        </div>

                        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border-primary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                            <span style={{ color: 'var(--color-text-secondary)' }}>Release:</span>
                            <span style={{ color: 'var(--color-text-primary)' }}>All {contract.conditions.length} required</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className={styles.progressDots}>
                    {contracts.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveContract(idx)}
                        className={`${styles.progressDot} ${idx === activeContract ? styles.active : styles.inactive}`}
                      />
                    ))}
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
