import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, DollarSign, Briefcase, Award } from 'lucide-react';
import styles from './LiveStatistics.module.css';

interface Stat {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
}

export function LiveStatistics() {
  const [hasAnimated, setHasAnimated] = useState(false);

  const stats: Stat[] = [
    { icon: <Users size={28} />, label: 'Total Users', value: 12450 },
    { icon: <UserCheck size={28} />, label: 'Active Users', value: 8920 },
    { icon: <DollarSign size={28} />, label: 'Total Deposits', value: 2500000, suffix: ' USDC' },
    { icon: <Briefcase size={28} />, label: 'Jobs Posted', value: 3680 },
    { icon: <Award size={28} />, label: 'Talents', value: 5240 }
  ];

  useEffect(() => {
    setHasAnimated(true);
  }, []);

  return (
    <section className={styles.section}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.3, once: false }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={styles.title}>
            Live Statistics
          </h2>
          
          <div className={styles.grid}>
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ amount: 0.3, once: false }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={styles.statCard}
              >
                <div className={styles.iconWrapper}>{stat.icon}</div>
                <div className={styles.value}>
                  {hasAnimated && (
                    <CountUp end={stat.value} duration={2} suffix={stat.suffix} />
                  )}
                </div>
                <p className={styles.label}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CountUp({ end, duration, suffix = '' }: { end: number; duration: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / (duration * 1000);

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <>{count.toLocaleString()}{suffix}</>;
}
