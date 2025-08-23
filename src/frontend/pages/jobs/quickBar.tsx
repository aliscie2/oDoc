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
    }
    return { type: "value", oldValue: oldVal, newValue: newVal };
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

    const changes = fieldsToCheck
      .map((field) => {
        const comparison = compareValues(
          previousJob[field],
          currentJob[field],
          field,
        );
        return comparison.type === "array"
          ? comparison.added.length > 0 || comparison.removed.length > 0
            ? { field, ...comparison }
            : null
          : previousJob[field] !== currentJob[field]
            ? { field, ...comparison }
            : null;
      })
      .filter(Boolean);

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
      }, 3000);
    }

    setPreviousJob(currentJob);
  }, [currentJob]);

  if (updates.length === 0) return null;

  const currentUpdate = updates[currentIndex];

  // Safety check to prevent undefined access during re-rendering pressure
  if (!currentUpdate) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -5 }}
      style={{
        position: "fixed",
        top: "80px",
        right: "16px",
        width: "300px",
        maxWidth: "calc(100vw - 32px)",
        maxHeight: "calc(100vh - 120px)",
        backdropFilter: "blur(8px)",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "8px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: "500", opacity: 0.9 }}>
          {getFieldName(currentUpdate?.field)}
        </span>
        <span style={{ fontSize: "12px", opacity: 0.6 }}>
          {currentIndex + 1}/{updates.length}
        </span>
      </div>

      <div style={{ padding: "16px", minHeight: "80px" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {currentUpdate?.type === "array" ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <AnimatePresence>
                  {currentUpdate?.current?.map((item, index) => {
                    const isNew = currentUpdate?.added?.includes(item);
                    return (
                      <motion.div
                        key={item}
                        layout
                        initial={
                          isNew ? { opacity: 0, x: -10, scale: 0.95 } : false
                        }
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{
                          duration: 0.3,
                          delay: isNew ? index * 0.05 : 0,
                        }}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          backgroundColor: isNew
                            ? "rgba(34, 197, 94, 0.2)"
                            : "rgba(255, 255, 255, 0.1)",
                          border: `1px solid ${isNew ? "rgba(34, 197, 94, 0.4)" : "rgba(255, 255, 255, 0.2)"}`,
                          color: isNew ? "#22c55e" : "inherit",
                        }}
                      >
                        {isNew && (
                          <span
                            style={{ color: "#22c55e", marginRight: "6px" }}
                          >
                            +
                          </span>
                        )}
                        {item}
                      </motion.div>
                    );
                  })}

                  {currentUpdate?.removed?.map((item, index) => (
                    <motion.div
                      key={`removing-${item}`}
                      layout
                      initial={{ opacity: 1, x: 0, scale: 1 }}
                      animate={[
                        { backgroundColor: "rgba(239, 68, 68, 0.2)" },
                        { opacity: 0, x: 10, scale: 0.95 },
                      ]}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{
                        duration: 0.6,
                        delay: index * 0.05,
                        times: [0, 0.3, 1],
                      }}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        border: "1px solid rgba(239, 68, 68, 0.4)",
                        color: "#ef4444",
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
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0.6 }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    backgroundColor: "rgba(239, 68, 68, 0.2)",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    color: "#ef4444",
                  }}
                >
                  <span style={{ color: "#ef4444", marginRight: "6px" }}>
                    -
                  </span>
                  {String(currentUpdate?.oldValue || "None")}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    backgroundColor: "rgba(34, 197, 94, 0.2)",
                    border: "1px solid rgba(34, 197, 94, 0.4)",
                    color: "#22c55e",
                  }}
                >
                  <span style={{ color: "#22c55e", marginRight: "6px" }}>
                    +
                  </span>
                  {String(currentUpdate?.newValue || "None")}
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
