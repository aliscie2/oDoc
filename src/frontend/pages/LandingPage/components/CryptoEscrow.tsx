import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { FileText, DollarSign, Calendar, User, FileCheck, Coins, Bitcoin } from 'lucide-react';
import styles from './remaining-components.module.css';

export function CryptoEscrow() {
  const paymentMethods = [
    { name: 'USD', icon: <DollarSign size={24} /> },
    { name: 'USDC', icon: <Coins size={24} /> },
    { name: 'Bitcoin', icon: <Bitcoin size={24} /> }
  ];

  const contract = {
    amount: '500 USDC',
    receiver: { name: 'John Smith', role: 'Senior ICP Developer' },
    stakingDuration: '30 days',
    conditions: [
      'Complete smart contract audit',
      'Deploy to mainnet',
      'Pass security review'
    ]
  };

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
              <h2 style={{ fontSize: '1.875rem', marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>Crypto Agreements</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                Transparent blockchain contracts with automated escrow
              </p>
              
              {/* Payment Options */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2.5rem', marginBottom: '2rem' }}>
                {paymentMethods.map((method, index) => (
                  <motion.div
                    key={method.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '3rem',
                        height: '3rem',
                        backgroundColor: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border-primary)',
                        borderRadius: '50%',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      {method.icon}
                    </motion.div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{method.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>

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
                          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={16} />
                          </div>
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

                </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
