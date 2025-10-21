import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Users, UserCheck, DollarSign, Briefcase, Award } from 'lucide-react';
import styles from './JobMatchingFlow.module.css';

interface Job {
  id: string;
  user_id: string;
  job_titles: string[];
  skills: string[];
  category: { Job: null } | { Talent: null };
  description: string;
}

interface User {
  id: string;
  name: string;
  photo: Uint8Array | number[] | string; // Can be blob URL string after castingActor conversion
}

interface OpportunityWithUser {
  job: Job;
  user: User | null;
  photoUrl: string;
}

function TypingText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return <span>{displayedText}<span className={styles.cursor}>|</span></span>;
}

export function JobMatchingFlow() {
  const [currentQuery, setCurrentQuery] = useState(0);
  const queries = [
    "Senior React developer with 5+ years",
    "Marketing manager in tech",
    "Rust backend Job in ICP ecosystem"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuery(prev => (prev + 1) % queries.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const [stats, setStats] = useState([
    { icon: <Users size={14} />, label: 'Users', value: '1.25K' },
    { icon: <UserCheck size={14} />, label: 'Active', value: '342' },
    { icon: <DollarSign size={14} />, label: 'Value', value: '$45K' },
    { icon: <Briefcase size={14} />, label: 'Jobs', value: '89' },
    { icon: <Award size={14} />, label: 'Talents', value: '456' }
  ]);

  const [opportunities, setOpportunities] = useState<OpportunityWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { backendActor, getCkUSDCActor } = await import('@/utils/backendUtils');
        const getckUsdcBalance = (await import('@/utils/getBalance')).default;
        const { canisterId } = await import('$/declarations/backend');
        
        const actor = await getCkUSDCActor();
        const response = await backendActor.get_sns_status();
        
        if ('Ok' in response) {
          const data = response.Ok;
          const balance = await getckUsdcBalance(actor, canisterId);
          
          setStats([
            { icon: <Users size={14} />, label: 'Users', value: Math.floor(data.number_users).toLocaleString() },
            { icon: <UserCheck size={14} />, label: 'Active', value: Math.floor(data.active_users).toLocaleString() },
            { icon: <DollarSign size={14} />, label: 'Value', value: `${Math.floor(Number(balance) / 1000000).toLocaleString()}` },
            { icon: <Briefcase size={14} />, label: 'Jobs', value: Math.floor(data.jobs_count).toLocaleString() },
            { icon: <Award size={14} />, label: 'Talents', value: Math.floor(data.talents_count).toLocaleString() }
          ]);

          // Combine latest jobs and talents
          const allOpportunities: Job[] = [...data.latest_jobs, ...data.latest_talents];
          
          // Fetch user data for each opportunity
          const opportunitiesWithUsers = await Promise.all(
            allOpportunities.map(async (job) => {
              try {
                const userResponse = await backendActor.get_user(job.user_id);
                let user: User | null = null;
                let photoUrl = '';
                
                if ('Ok' in userResponse) {
                  user = userResponse.Ok;
                  // Photo is already converted to blob URL by castingActor proxy
                  photoUrl = typeof user.photo === 'string' ? user.photo : '';
                }
                
                return { job, user, photoUrl };
              } catch (error) {
                console.error(`Failed to fetch user ${job.user_id}:`, error);
                return { job, user: null, photoUrl: '' };
              }
            })
          );
          
          setOpportunities(opportunitiesWithUsers);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();

    // Cleanup function to revoke object URLs
    return () => {
      opportunities.forEach(opp => {
        if (opp.photoUrl) {
          URL.revokeObjectURL(opp.photoUrl);
        }
      });
    };
  }, []);

  // Duplicate opportunities for infinite scroll effect
  const displayOpportunities = useMemo(() => {
    if (opportunities.length === 0) return [];
    return [...opportunities, ...opportunities];
  }, [opportunities]);

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
            AI Job Matching Flow
          </h2>

          <div className={styles.grid}>
            {/* Left Panel - STEP 1: ASK */}
            <div>
              <div className={styles.columnHeader}>
                <h3 className={styles.stepTitle}>STEP 1: ASK</h3>
                <p className={styles.stepDescription}>Tell us what you&apos;re looking for</p>
              </div>

              <Card className={styles.queryCard}>
                <div>
                  <div className={styles.queryBox}>
                    <p className={styles.queryText}>
                      <TypingText text={queries[currentQuery]} />
                    </p>
                  </div>

                  <div className={styles.indicators}>
                    {queries.map((_, idx) => (
                      <div 
                        key={idx}
                        className={`${styles.indicator} ${idx === currentQuery ? styles.active : styles.inactive}`}
                      />
                    ))}
                  </div>
                </div>
              </Card>

              <div className={styles.statsContainer}>
                <p className={styles.statsLabel}>Platform Stats</p>
                <div className={styles.statsGrid}>
                  {stats.map((stat, idx) => (
                    <Badge key={idx} variant="outline">
                      <span style={{ marginRight: '0.25rem' }}>{stat.icon}</span>
                      {stat.label}: {stat.value}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel - STEP 2: GET RESULTS */}
            <div>
              <div className={styles.columnHeader}>
                <h3 className={styles.stepTitle}>STEP 2: GET RESULTS</h3>
                <p className={styles.stepDescription}>AI finds the best matches</p>
              </div>

              <div className={styles.opportunitiesList}>
                {isLoading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    Loading opportunities...
                  </div>
                ) : displayOpportunities.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    No opportunities available yet
                  </div>
                ) : (
                  <div className={styles.scrollContainer}>
                    {displayOpportunities.map((opp, idx) => (
                      <Card key={`${opp.job.id}-${idx}`} className={styles.opportunityCard}>
                        <div className={styles.opportunityHeader}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                            {opp.photoUrl ? (
                              <img 
                                src={opp.photoUrl} 
                                alt={opp.user?.name || 'User'}
                                style={{ 
                                  width: '40px', 
                                  height: '40px', 
                                  borderRadius: '50%', 
                                  objectFit: 'cover',
                                  flexShrink: 0
                                }}
                              />
                            ) : (
                              <div style={{ 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '50%', 
                                backgroundColor: 'var(--color-bg-tertiary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                fontSize: '1.25rem',
                                fontWeight: 600,
                                color: 'var(--color-text-secondary)'
                              }}>
                                {opp.user?.name?.charAt(0).toUpperCase() || '?'}
                              </div>
                            )}
                            <div className={styles.opportunityInfo}>
                              <p className={styles.opportunityTitle}>
                                {(opp.job.job_titles[0] || 'Untitled Position').length > 30 
                                  ? `${opp.job.job_titles[0].substring(0, 30)}...` 
                                  : opp.job.job_titles[0] || 'Untitled Position'}
                              </p>
                              {opp.job.description && (
                                <p style={{ 
                                  fontSize: '0.75rem', 
                                  color: 'var(--color-text-tertiary)',
                                  marginTop: '0.25rem',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {opp.job.description.length > 50 
                                    ? `${opp.job.description.substring(0, 50)}...` 
                                    : opp.job.description}
                                </p>
                              )}
                              <div className={styles.skillsContainer}>
                                {opp.job.skills.slice(0, 3).map((skill, skillIdx) => (
                                  <Badge key={`${skill}-${skillIdx}`} variant="secondary">
                                    {skill.length > 15 ? `${skill.substring(0, 15)}...` : skill}
                                  </Badge>
                                ))}
                                {opp.job.skills.length > 3 && (
                                  <Badge variant="secondary">
                                    +{opp.job.skills.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge>
                            {'Job' in opp.job.category ? 'Job' : 'Talent'}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
