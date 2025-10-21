import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import LoginButton from '@/components/MainComponents/topNavBar/loginButton';
import { ImageWithFallback } from './figma/ImageWithFallback';
import styles from './SystemOverview.module.css';

export function SystemOverview() {
  const services = [
    {
      icon: '/job.png',
      title: 'AI Job Match',
      description: 'AI-powered matching connects you with opportunities that perfectly align with your skills',
      userType: '/'
    },
    {
      icon: '/calendar.png',
      title: 'Smart Calendar',
      description: 'Smart scheduling system coordinates interviews and meetings at optimal times',
      userType: 'calendar'
    },
    {
      icon: '/contract.png',
      title: 'Crypto Agreements',
      description: 'Secure platform handles projects, teams, tasks, payments, and contract management',
      userType: 'contracts'
    }
  ];

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
            We offer an A to Z system
          </h2>
          
          <div className={styles.servicesContainer}>
            {services.map((service, idx) => (
              <div key={idx} className={styles.serviceWrapper}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ amount: 0.3, once: false }}
                  transition={{ duration: 0.6, delay: idx * 0.2 }}
                  className={styles.serviceCard}
                >
                  <div className={styles.icon}>
                    <ImageWithFallback 
                      src={service.icon}
                      alt={service.title}
                      style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                    />
                  </div>
                  <h3 className={styles.serviceTitle}>{service.title}</h3>
                  <p className={styles.description}>{service.description}</p>
                  <LoginButton variant="outlined" userType={service.userType} sx={{ width: '100%', minHeight: '40px' }}>
                    Try it now
                  </LoginButton>
                </motion.div>
                
                {idx < services.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ amount: 0.3, once: false }}
                    transition={{ duration: 0.4, delay: idx * 0.2 + 0.3 }}
                    className={styles.arrow}
                  >
                    <ArrowRight size={24} />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
