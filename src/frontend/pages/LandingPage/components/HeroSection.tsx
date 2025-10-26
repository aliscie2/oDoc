import LoginButton from "@/components/MainComponents/topNavBar/loginButton";
import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./HeroSection.module.css";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

interface Message {
  type: "user" | "bot";
  text?: string;
  content?: React.ReactNode;
  botIcon?: string;
}

export function HeroSection() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentScenario, setCurrentScenario] = useState(0);

  const scenarios = [
    {
      userMessage: "Find full-stack developers",
      botIcon: "/job.png",
      botContent: (
        <div>
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>
            Found 3 candidates:
          </p>
          {[
            { name: "Sarah Chen", score: "95% match", avatar: "https://i.pravatar.cc/150?img=47" },
            { name: "Alex Kumar", score: "92% match", avatar: "https://i.pravatar.cc/150?img=12" },
            { name: "Maria Silva", score: "88% match", avatar: "https://i.pravatar.cc/150?img=32" },
          ].map((candidate, idx) => (
            <div key={idx} className={styles.candidateCard}>
              <img src={candidate.avatar} alt={candidate.name} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
              <div className={styles.candidateInfo}>
                <p className={styles.candidateName}>{candidate.name}</p>
              </div>
              <span className={styles.candidateRate}>{candidate.score}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      userMessage: "Find a suitable time to meet Sarah",
      botIcon: "/calendar.png",
      botContent: (
        <Card style={{ padding: "1rem" }}>
          <p style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>Meeting scheduled:</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
            <div>
              <p>Tomorrow 10:00 AM</p>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>with Sarah</p>
            </div>
            <Badge>Confirmed</Badge>
          </div>
        </Card>
      ),
    },
    {
      userMessage: "Make an escrow with John Smith",
      botIcon: "/contract.png",
      botContent: (
        <Card style={{ padding: "1rem" }}>
          <p style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>Escrow contract created:</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>Amount:</span>
              <span style={{ fontSize: "0.875rem" }}>$100 USDC</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>Recipient:</span>
              <span style={{ fontSize: "0.875rem" }}>John Smith</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>Type:</span>
              <span style={{ fontSize: "0.875rem" }}>Escrow</span>
            </div>
          </div>
        </Card>
      ),
    },
  ];

  useEffect(() => {
    const scenario = scenarios[currentScenario];
    
    setMessages([{ type: "user", text: scenario.userMessage }]);
    
    const botTimer = setTimeout(() => {
      setMessages(prev => [...prev, { type: "bot", content: scenario.botContent, botIcon: scenario.botIcon }]);
    }, 800);

    const nextTimer = setTimeout(() => {
      setCurrentScenario((prev) => (prev + 1) % scenarios.length);
    }, 6000);

    return () => {
      clearTimeout(botTimer);
      clearTimeout(nextTimer);
    };
  }, [currentScenario]);

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.grid}>
          <div>
            <h1 className={styles.title}>Your AI Personal Secretary</h1>
            <p className={styles.subtitle}>
              AI-driven job matching that aligns with your skills. Enjoy seamless scheduling and secure agreements with crypto payments.
            </p>
            <div className={styles.buttonGroup}>
              <LoginButton variant="contained" userType="JOB" sx={{ minHeight: "48px", fontSize: "1rem", padding: "0 24px" }}>
                Find Talent
              </LoginButton>
              <LoginButton variant="outlined" userType="TALENT" sx={{ minHeight: "48px", fontSize: "1rem", padding: "0 24px" }}>
                Find Job
              </LoginButton>
            </div>
          </div>

          <div>
            <div className={styles.chatCard}>
              <div className={styles.messages} style={{ minHeight: "350px" }}>
                {messages.map((message, idx) => (
                  <motion.div
                    key={`${currentScenario}-${idx}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={`${styles.messageWrapper} ${message.type === "user" ? styles.user : styles.bot}`}
                  >
                    {message.type === "bot" && (
                      <div className={`${styles.avatar} ${styles.bot}`}>
                        {message.botIcon ? (
                          <img src={message.botIcon} alt="Bot" style={{ width: "70px", height: "70px", objectFit: "contain" }} />
                        ) : (
                          <Bot size={16} />
                        )}
                      </div>
                    )}
                    <div className={`${styles.message} ${message.type === "user" ? styles.user : styles.bot}`}>
                      {message.text && <p>{message.text}</p>}
                      {message.content && <div>{message.content}</div>}
                    </div>
                    {message.type === "user" && (
                      <div className={`${styles.avatar} ${styles.user}`}>
                        <User size={16} />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
