import { motion } from 'framer-motion';
import { DollarSign, Lock, Shield, Star } from 'lucide-react';
import { Card } from './ui/card';
import styles from './remaining-components.module.css';

export function AgreementProofs() {
  const proofs = [
    {
      icon: <DollarSign size={28} />,
      title: 'Proof of Existence',
      description: 'Deposit funds before making promises'
    },
    {
      icon: <Lock size={28} />,
      title: 'Proof of Stake',
      description: 'Build trust with upfront staking'
    },
    {
      icon: <Shield size={28} />,
      title: 'Proof of Cap',
      description: 'Smart limits prevent oversized commitments'
    },
    {
      icon: <Star size={28} />,
      title: 'Proof of Reputation',
      description: 'Your track record shows transparently'
    }
  ];

  return (
    <section className={styles.proofsSection}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.3, once: false }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.proofsHeader}>
            <h2 style={{ fontSize: '1.875rem', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Agreement Proofs</h2>
            <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)' }}>Built-in trust mechanisms for secure collaboration</p>
          </div>

          <div className={styles.proofsGrid}>
            {proofs.map((proof, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.3, once: false }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card className={styles.proofCard}>
                  <div style={{ marginBottom: '1rem' }}>
                    {proof.icon}
                  </div>
                  <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>{proof.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{proof.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
