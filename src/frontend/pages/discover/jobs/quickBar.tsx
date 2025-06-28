import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const JobUpdateAnimation = ({ currentJob, jobs }) => {
  const [previousJob, setPreviousJob] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const compareValues = (oldVal, newVal, field) => {
    const arrayFields = [
      "skills",
      "education",
      "links",
      "experience",
      "certifications",
      "job_titles",
      "emails",
      "contacts",
    ];

    if (arrayFields.includes(field)) {
      const oldArr = oldVal || [];
      const newArr = newVal || [];
      const added = newArr.filter((item) => !oldArr.includes(item));
      const removed = oldArr.filter((item) => !newArr.includes(item));
      return { type: "array", added, removed, current: newArr };
    } else {
      return { type: "value", oldValue: oldVal, newValue: newVal };
    }
  };

  const getFieldName = (field) => {
    const names = {
      skills: "Skills",
      education: "Education",
      links: "Links",
      experience: "Experience",
      certifications: "Certifications",
      job_titles: "Job Titles",
      emails: "Emails",
      contacts: "Contacts",
      description: "Description",
      proficiency_level: "Level",
      trust_score: "Trust Score",
      trust_note: "Trust Note",
      required_match_score: "Match Score",
    };
    return names[field] || field;
  };

  useEffect(() => {
    if (!currentJob || !previousJob || previousJob.id !== currentJob.id) {
      setPreviousJob(currentJob);
      return;
    }

    const changes = [];
    const fieldsToCheck = [
      "skills",
      "education",
      "links",
      "experience",
      "certifications",
      "job_titles",
      "emails",
      "contacts",
      "description",
      "proficiency_level",
      "trust_score",
      "trust_note",
      "required_match_score",
    ];

    fieldsToCheck.forEach((field) => {
      const oldVal = previousJob[field];
      const newVal = currentJob[field];

      const comparison = compareValues(oldVal, newVal, field);

      if (comparison.type === "array") {
        if (comparison.added.length > 0 || comparison.removed.length > 0) {
          changes.push({ field, ...comparison });
        }
      } else {
        if (oldVal !== newVal) {
          changes.push({ field, ...comparison });
        }
      }
    });

    if (changes.length > 0) {
      setUpdates(changes);
      setCurrentIndex(0);

      const timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= changes.length - 1) {
            clearInterval(timer);
            setTimeout(() => setUpdates([]), 1500);
            return prev;
          }
          return prev + 1;
        });
      }, 4000);
    }

    setPreviousJob(currentJob);
  }, [currentJob]);

  if (updates.length === 0) return null;

  const currentUpdate = updates[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        width: "300px",
        background: "#1a1a1a",
        borderRadius: "8px",
        border: "1px solid #333",
        overflow: "hidden",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          padding: "12px",
          borderBottom: "1px solid #333",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: "#fff", fontSize: "13px", fontWeight: "600" }}>
          {getFieldName(currentUpdate?.field)}
        </span>
        <span style={{ color: "#666", fontSize: "11px" }}>
          {currentIndex + 1}/{updates.length}
        </span>
      </div>

      <div
        style={{ minHeight: "120px", overflow: "hidden", position: "relative" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ padding: "16px" }}
          >
            {currentUpdate?.type === "array" ? (
              // Array field updates
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <AnimatePresence>
                  {/* Current items */}
                  {currentUpdate.current.map((item, index) => {
                    const isNew = currentUpdate.added.includes(item);

                    return (
                      <motion.div
                        key={item}
                        layout
                        initial={
                          isNew ? { opacity: 0, x: -20, scale: 0.8 } : false
                        }
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{
                          duration: 0.4,
                          delay: isNew ? index * 0.1 : 0,
                          layout: { duration: 0.3 },
                        }}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          color: "#fff",
                          background: isNew ? "#059669" : "#2a2a2a",
                          border: `1px solid ${isNew ? "#10b981" : "#444"}`,
                        }}
                      >
                        {isNew && (
                          <span
                            style={{ color: "#10b981", marginRight: "6px" }}
                          >
                            +
                          </span>
                        )}
                        {item}
                      </motion.div>
                    );
                  })}

                  {/* Removed items - show removal animation */}
                  {currentUpdate.removed.map((item, index) => (
                    <motion.div
                      key={`removing-${item}`}
                      layout
                      initial={{
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        background: "#2a2a2a",
                      }}
                      animate={[
                        { background: "#dc2626", border: "1px solid #ef4444" },
                        { opacity: 0, x: 20, scale: 0.8 },
                      ]}
                      exit={{
                        opacity: 0,
                        height: 0,
                        marginBottom: 0,
                        paddingTop: 0,
                        paddingBottom: 0,
                      }}
                      transition={{
                        duration: 0.8,
                        delay: index * 0.1,
                        layout: { duration: 0.3 },
                        times: [0, 0.4, 1],
                      }}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        color: "#fff",
                        marginBottom: "6px",
                      }}
                    >
                      <span style={{ color: "#ef4444", marginRight: "6px" }}>
                        -
                      </span>
                      {item}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              // Single value updates
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {/* Old value */}
                <motion.div
                  initial={{ opacity: 1, x: 0 }}
                  animate={{ opacity: 0.3, x: -10 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    color: "#fff",
                    background: "#dc2626",
                    border: "1px solid #ef4444",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      color: "#ef4444",
                      marginRight: "6px",
                      fontSize: "10px",
                    }}
                  >
                    -
                  </span>
                  {String(currentUpdate.oldValue || "None")}
                </motion.div>

                {/* Arrow */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  style={{
                    textAlign: "center",
                    color: "#666",
                    fontSize: "14px",
                  }}
                >
                  ↓
                </motion.div>

                {/* New value */}
                <motion.div
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    color: "#fff",
                    background: "#059669",
                    border: "1px solid #10b981",
                  }}
                >
                  <span
                    style={{
                      color: "#10b981",
                      marginRight: "6px",
                      fontSize: "10px",
                    }}
                  >
                    +
                  </span>
                  {String(currentUpdate.newValue || "None")}
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default JobUpdateAnimation;
