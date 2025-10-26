import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import LoginButton from "@/components/MainComponents/topNavBar/loginButton";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import styles from "./SystemOverview.module.css";

export function SystemOverview() {
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  const toggleCard = (idx: number) => {
    setExpandedCards(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const services = [
    {
      icon: "/job.png",
      title: "AI Job Match",
      bullets: [
        "Get matched in minutes, not weeks",
        "AI-powered candidate screening",
        "Focus on work, not searching"
      ],
      fullDescription:
        "Stop wasting weeks screening candidates or searching job boards. Get matched with the right people or opportunities in minutes—so you can focus on what actually matters: getting work done.",
      buttonText: "Find Matches Now",
      userType: "JOB",
    },
    {
      icon: "/calendar.png",
      title: "Smart Calendar",
      bullets: [
        "End email ping-pong scheduling",
        "Automated meeting coordination",
        "Reclaim hours every week"
      ],
      fullDescription:
        "End the back-and-forth scheduling nightmare. Reclaim hours of your week by automating meeting coordination—because your time is worth more than playing email ping-pong.",
      buttonText: "Automate Scheduling Now",
      userType: "calendar",
    },
    {
      icon: "/contract.png",
      title: "Crypto Agreements",
      bullets: [
        "Eliminate payment disputes",
        "Automatic, trustless execution",
        "Manage tasks & payments in one place"
      ],
      fullDescription:
        "Eliminate payment disputes and latency. Save your time by managing your team tasks and payment in one single place. Smart contracts ensure you get paid on time, every time—no chasing invoices, no excuses, just automatic, trustless execution.",
      buttonText: "Make An Agreement Now",
      userType: "contracts",
    },
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
          <div className={styles.header}>
            <h2 className={styles.title}>Why choose {window.location.hostname.split('.')[0]}?</h2>
            <p className={styles.subtitle}>
              Streamline your hiring process and reduce costs with our comprehensive solution.
            </p>
          </div>

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
                      style={{
                        width: "36px",
                        height: "36px",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                  <h3 className={styles.serviceTitle}>{service.title}</h3>
                  
                  <div className={styles.description}>
                    <ul className={styles.bulletList}>
                      {service.bullets.map((bullet, bulletIdx) => (
                        <li key={bulletIdx}>{bullet}</li>
                      ))}
                    </ul>
                    
                    {expandedCards[idx] && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={styles.fullDescription}
                      >
                        {service.fullDescription}
                      </motion.p>
                    )}
                    
                    <button
                      onClick={() => toggleCard(idx)}
                      className={styles.readMoreBtn}
                    >
                      {expandedCards[idx] ? (
                        <>
                          Read less <ChevronUp size={14} />
                        </>
                      ) : (
                        <>
                          Read more <ChevronDown size={14} />
                        </>
                      )}
                    </button>
                  </div>
                  
                  <LoginButton
                    variant="outlined"
                    userType={service.userType}
                    sx={{ width: "100%", minHeight: "40px" }}
                  >
                    {service.buttonText}
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
