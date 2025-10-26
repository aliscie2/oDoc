import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { FileText, DollarSign, Calendar, User, FileCheck, Coins, Bitcoin } from 'lucide-react';
import styles from './remaining-components.module.css';
export function CryptoEscrow() {
  const paymentMethods = [
    { name: 'USD', icon: <DollarSign size={20} /> },
    { name: 'USDC', icon: <Coins size={20} /> },
    { name: 'Bitcoin', icon: <Bitcoin size={20} /> }
  ];

  const contract = {
    amount: '500 USDC',
    receiver: { name: 'John Smith', role: 'Senior ICP Developer' },
    stakingDuration: '30 days',
    conditions: ['Complete smart contract audit', 'Deploy to mainnet', 'Pass security review']
  };

  return (
    <section className={styles.cryptoSection} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: 'clamp(1rem, 3vh, 2rem) 0' }}>
      <div className="container" style={{ width: '100%' }}>
        <div className={styles.cryptoContent}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3, once: false }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.cryptoHeader} style={{ marginBottom: 'clamp(1rem, 2vh, 1.5rem)' }}>
              <h2 style={{ fontSize: 'clamp(1.25rem, 3.5vw, 1.875rem)', marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>Crypto Agreements</h2>
              <p style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.875rem)', color: 'var(--color-text-secondary)', marginBottom: 'clamp(0.75rem, 1.5vh, 1rem)' }}>
                Transparent blockchain contracts with automated escrow
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'clamp(1.25rem, 3vw, 2rem)', marginBottom: 'clamp(0.75rem, 1.5vh, 1rem)' }}>
                {paymentMethods.map((method, index) => (
                  <motion.div
                    key={method.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 'clamp(2.25rem, 5vw, 2.75rem)',
                        height: 'clamp(2.25rem, 5vw, 2.75rem)',
                        backgroundColor: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border-primary)',
                        borderRadius: '50%',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      {method.icon}
                    </motion.div>
                    <span style={{ fontSize: 'clamp(0.625rem, 1.4vw, 0.7rem)', color: 'var(--color-text-secondary)' }}>{method.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <Card className={styles.cryptoCard} style={{ padding: 'clamp(0.875rem, 2vh, 1.25rem)' }}>
                  <div className={styles.contractHeader} style={{ marginBottom: 'clamp(0.75rem, 1.5vh, 1rem)', paddingBottom: 'clamp(0.5rem, 1vh, 0.75rem)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div className={styles.contractIcon} style={{ width: '2.25rem', height: '2.25rem' }}>
                        <FileText size={16} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.95rem)', color: 'var(--color-text-primary)' }}>Escrow Contract</h3>
                        <p style={{ fontSize: 'clamp(0.625rem, 1.4vw, 0.7rem)', color: 'var(--color-text-secondary)' }}>Smart Agreement</p>
                      </div>
                    </div>
                    <Badge>Active</Badge>
                  </div>

                  <div className={styles.contractGrid} style={{ gap: 'clamp(0.75rem, 1.5vh, 1rem)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.75rem, 1.5vh, 1rem)' }}>
                      <div className={styles.infoBox} style={{ padding: 'clamp(0.65rem, 1.2vh, 0.875rem)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                          <DollarSign size={14} />
                          <span style={{ fontSize: 'clamp(0.625rem, 1.4vw, 0.7rem)', color: 'var(--color-text-secondary)' }}>Amount</span>
                        </div>
                        <p style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)', color: 'var(--color-text-primary)' }}>{contract.amount}</p>
                      </div>

                      <div className={styles.infoBox} style={{ padding: 'clamp(0.65rem, 1.2vh, 0.875rem)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                          <Calendar size={14} />
                          <span style={{ fontSize: 'clamp(0.625rem, 1.4vw, 0.7rem)', color: 'var(--color-text-secondary)' }}>Duration</span>
                        </div>
                        <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', color: 'var(--color-text-primary)' }}>{contract.stakingDuration}</p>
                      </div>

                      <div className={styles.infoBox} style={{ padding: 'clamp(0.65rem, 1.2vh, 0.875rem)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                          <User size={14} />
                          <span style={{ fontSize: 'clamp(0.625rem, 1.4vw, 0.7rem)', color: 'var(--color-text-secondary)' }}>Receiver</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <div style={{ width: '2rem', height: '2rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={14} />
                          </div>
                          <div>
                            <p style={{ fontSize: 'clamp(0.7rem, 1.6vw, 0.8rem)', color: 'var(--color-text-primary)' }}>{contract.receiver.name}</p>
                            <p style={{ fontSize: 'clamp(0.625rem, 1.4vw, 0.7rem)', color: 'var(--color-text-secondary)' }}>{contract.receiver.role}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className={styles.infoBox} style={{ height: '100%', padding: 'clamp(0.65rem, 1.2vh, 0.875rem)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: 'clamp(0.5rem, 1vh, 0.75rem)' }}>
                          <FileCheck size={14} />
                          <span style={{ fontSize: 'clamp(0.625rem, 1.4vw, 0.7rem)', color: 'var(--color-text-secondary)' }}>Conditions</span>
                        </div>
                        
                        <div className={styles.conditions} style={{ gap: 'clamp(0.5rem, 1vh, 0.75rem)', marginBottom: 'clamp(0.75rem, 1.5vh, 1rem)' }}>
                          {contract.conditions.map((condition, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.4, delay: idx * 0.1 }}
                              className={styles.conditionItem}
                              style={{ padding: 'clamp(0.5rem, 1vh, 0.75rem)', gap: '0.5rem' }}
                            >
                              <div className={styles.conditionNumber} style={{ width: '1.35rem', height: '1.35rem', fontSize: '0.65rem' }}>{idx + 1}</div>
                              <p style={{ fontSize: 'clamp(0.7rem, 1.6vw, 0.8rem)', flex: 1 }}>{condition}</p>
                            </motion.div>
                          ))}
                        </div>

                        <div style={{ paddingTop: 'clamp(0.5rem, 1vh, 0.75rem)', borderTop: '1px solid var(--color-border-primary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'clamp(0.625rem, 1.4vw, 0.7rem)' }}>
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