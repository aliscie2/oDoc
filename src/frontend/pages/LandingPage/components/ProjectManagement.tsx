import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { FileText, CheckCircle2, DollarSign, ClipboardList, Bell, TrendingUp } from 'lucide-react';
import styles from './remaining-components.module.css';

export function ProjectManagement() {
  const [currentContract, setCurrentContract] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [highlightPromises, setHighlightPromises] = useState(false);

  const contracts = [
    {
      title: 'AI Agent Development',
      creator: { name: 'Sarah Chen', role: 'Project Manager', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80' },
      promises: { count: 3, amount: 1500 },
      payments: { count: 1, amount: 500 },
      status: 'Active'
    },
    {
      title: 'ICP Canister Integration',
      creator: { name: 'Alex Rodriguez', role: 'Tech Lead', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e' },
      promises: { count: 2, amount: 2000 },
      payments: { count: 0, amount: 0 },
      status: 'Pending'
    }
  ];

  const features = [
    { icon: <ClipboardList size={18} />, text: 'Smart task allocation' },
    { icon: <DollarSign size={18} />, text: 'Automated payment tracking' },
    { icon: <TrendingUp size={18} />, text: 'Progress analytics' },
    { icon: <Bell size={18} />, text: 'Real-time notifications' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setShowNotification(true);
      setCurrentContract(prev => (prev + 1) % contracts.length);
      
      setTimeout(() => {
        setShowNotification(false);
        setHighlightPromises(true);
        
        setTimeout(() => {
          setHighlightPromises(false);
        }, 2000);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const contract = contracts[currentContract];

  return (
    <section className={styles.projectSection}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.3, once: false }}
          transition={{ duration: 0.6 }}
        >
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.875rem', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Project Management</h2>
            <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)' }}>
              Track progress, manage teams, and automate payments in one place
            </p>
          </div>

          <div className={styles.projectGrid}>
            {/* Main Contract Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentContract}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
              >
                <Card className={styles.projectCard}>
                  {/* Header */}
                  <div className={styles.projectHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-accent)', color: 'var(--color-text-inverse)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.125rem', color: 'var(--color-text-primary)' }}>{contract.title}</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Smart Contract</p>
                      </div>
                    </div>
                    <Badge>{contract.status}</Badge>
                  </div>

                  {/* Creator */}
                  <Card style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: 'var(--color-bg-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img 
                        src={contract.creator.avatar} 
                        alt={contract.creator.name}
                        style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
                      />
                      <div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>{contract.creator.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{contract.creator.role}</p>
                      </div>
                    </div>
                  </Card>

                  {/* Metrics */}
                  <div className={styles.projectMetrics}>
                    <Card className={`${styles.metricCard} ${highlightPromises ? styles.highlight : ''}`}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <CheckCircle2 size={16} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Promises</span>
                      </div>
                      <p style={{ fontSize: '1.5rem', color: 'var(--color-text-primary)' }}>{contract.promises.count}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>${contract.promises.amount} USDC</p>
                    </Card>

                    <Card className={styles.metricCard}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <DollarSign size={16} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Payments</span>
                      </div>
                      <p style={{ fontSize: '1.5rem', color: 'var(--color-text-primary)' }}>{contract.payments.count}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>${contract.payments.amount} USDC</p>
                    </Card>
                  </div>

                  {/* Notification */}
                  <AnimatePresence>
                    {showNotification && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Bell size={16} style={{ color: '#2563eb' }} />
                            <p style={{ fontSize: '0.875rem', color: '#1e3a8a' }}>New promise created in {contract.title}</p>
                          </div>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Features Sidebar */}
            <div>
              <Card style={{ padding: '1.5rem', backgroundColor: 'var(--color-bg-secondary)', boxShadow: 'var(--shadow-lg)' }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Key Features</h3>
                <div className={styles.featuresList}>
                  {features.map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ amount: 0.3, once: false }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      className={styles.featureItem}
                    >
                      <div>{feature.icon}</div>
                      <p style={{ fontSize: '0.875rem' }}>{feature.text}</p>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
