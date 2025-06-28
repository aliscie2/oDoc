import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { formatRelativeTime } from "@/utils/time";

const CalendarFeedback = () => {
  const { calendar } = useSelector((state) => state.calendarState);
  const [previousCalendar, setPreviousCalendar] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const compareCalendars = (oldCalendar, newCalendar) => {
    const changes = [];

    // Check for new events
    const newEvents = newCalendar.events.filter(
      (event) =>
        !oldCalendar.events.some((prevEvent) => prevEvent.id === event.id),
    );
    newEvents.forEach((event) => {
      changes.push({
        type: "added",
        category: "event",
        title: event.title,
        time: formatRelativeTime(event.start_time),
        data: event,
      });
    });

    // Check for removed events
    const removedEvents = oldCalendar.events.filter(
      (event) =>
        !newCalendar.events.some(
          (currentEvent) => currentEvent.id === event.id,
        ),
    );
    removedEvents.forEach((event) => {
      changes.push({
        type: "removed",
        category: "event",
        title: event.title,
        time: formatRelativeTime(event.start_time),
        data: event,
      });
    });

    // Check for updated events
    newCalendar.events.forEach((event) => {
      const prevEvent = oldCalendar.events.find((e) => e.id === event.id);
      if (
        prevEvent &&
        (prevEvent.title !== event.title ||
          prevEvent.start_time !== event.start_time ||
          prevEvent.end_time !== event.end_time ||
          prevEvent.description !== event.description)
      ) {
        changes.push({
          type: "updated",
          category: "event",
          title: event.title,
          time: formatRelativeTime(event.start_time),
          oldData: prevEvent,
          newData: event,
        });
      }
    });

    // Check for new availabilities
    const newAvailabilities = newCalendar.availabilities.filter(
      (avail) =>
        !oldCalendar.availabilities.some(
          (prevAvail) => prevAvail.id === avail.id,
        ),
    );
    newAvailabilities.forEach((avail) => {
      changes.push({
        type: "added",
        category: "availability",
        title: avail.title || "Availability",
        time:
          avail.time_slots.length > 0
            ? formatRelativeTime(avail.time_slots[0].start_time)
            : "",
        data: avail,
      });
    });

    // Check for removed availabilities
    const removedAvailabilities = oldCalendar.availabilities.filter(
      (avail) =>
        !newCalendar.availabilities.some(
          (currentAvail) => currentAvail.id === avail.id,
        ),
    );
    removedAvailabilities.forEach((avail) => {
      changes.push({
        type: "removed",
        category: "availability",
        title: avail.title || "Availability",
        time:
          avail.time_slots.length > 0
            ? formatRelativeTime(avail.time_slots[0].start_time)
            : "",
        data: avail,
      });
    });

    // Check for updated availabilities
    newCalendar.availabilities.forEach((avail) => {
      const prevAvail = oldCalendar.availabilities.find(
        (a) => a.id === avail.id,
      );
      if (
        prevAvail &&
        (prevAvail.title !== avail.title ||
          prevAvail.is_blocked !== avail.is_blocked ||
          JSON.stringify(prevAvail.time_slots) !==
            JSON.stringify(avail.time_slots))
      ) {
        changes.push({
          type: "updated",
          category: "availability",
          title: avail.title || "Availability",
          time:
            avail.time_slots.length > 0
              ? formatRelativeTime(avail.time_slots[0].start_time)
              : "",
          oldData: prevAvail,
          newData: avail,
        });
      }
    });

    return changes;
  };

  useEffect(() => {
    if (!calendar || !previousCalendar || previousCalendar.id !== calendar.id) {
      setPreviousCalendar(calendar);
      return;
    }

    const changes = compareCalendars(previousCalendar, calendar);

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

    setPreviousCalendar(calendar);
  }, [calendar]);

  if (updates.length === 0) return null;

  const currentUpdate = updates[currentIndex];

  const getUpdateColor = (type) => {
    switch (type) {
      case "added":
        return { bg: "#059669", border: "#10b981", text: "#10b981" };
      case "removed":
        return { bg: "#dc2626", border: "#ef4444", text: "#ef4444" };
      case "updated":
        return { bg: "#d97706", border: "#f59e0b", text: "#f59e0b" };
      default:
        return { bg: "#374151", border: "#6b7280", text: "#9ca3af" };
    }
  };

  const getActionText = (type) => {
    switch (type) {
      case "added":
        return "Added";
      case "removed":
        return "Removed";
      case "updated":
        return "Updated";
      default:
        return "";
    }
  };

  const colors = getUpdateColor(currentUpdate.type);

  return (
    <div
      style={{
        width: "300px",
        background: "#1a1a1a",
        borderRadius: "8px",
        border: "1px solid #333",
        overflow: "hidden",
        animation: "slideIn 0.3s ease-out",
      }}
    >
      <style>
        {`
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
          }
        `}
      </style>

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
          {getActionText(currentUpdate.type)} {currentUpdate.category}
        </span>
        <span style={{ color: "#666", fontSize: "11px" }}>
          {currentIndex + 1}/{updates.length}
        </span>
      </div>

      <div
        style={{ minHeight: "120px", overflow: "hidden", position: "relative" }}
      >
        <div
          key={currentIndex}
          style={{
            padding: "16px",
            animation: "fadeInUp 0.3s ease-out",
          }}
        >
          {currentUpdate.type === "updated" ? (
            // Updated item - show old vs new
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {/* Old value */}
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  color: "#fff",
                  background: "#dc2626",
                  border: "1px solid #ef4444",
                  opacity: 0.7,
                  animation: "scaleIn 0.5s ease-out",
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
                {currentUpdate.oldData?.title || "Previous"}
                {currentUpdate.oldData && (
                  <div
                    style={{ fontSize: "10px", opacity: 0.8, marginTop: "2px" }}
                  >
                    {formatRelativeTime(currentUpdate.oldData.start_time)}
                  </div>
                )}
              </div>

              {/* Arrow */}
              <div
                style={{
                  textAlign: "center",
                  color: "#666",
                  fontSize: "14px",
                  animation: "scaleIn 0.3s ease-out 0.3s both",
                }}
              >
                ↓
              </div>

              {/* New value */}
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  color: "#fff",
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  animation: "scaleIn 0.4s ease-out 0.6s both",
                }}
              >
                <span
                  style={{
                    color: colors.text,
                    marginRight: "6px",
                    fontSize: "10px",
                  }}
                >
                  +
                </span>
                {currentUpdate.title}
                {currentUpdate.time && (
                  <div
                    style={{ fontSize: "10px", opacity: 0.8, marginTop: "2px" }}
                  >
                    {currentUpdate.time}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Added/Removed item
            <div
              style={{
                padding: "12px",
                borderRadius: "4px",
                fontSize: "13px",
                color: "#fff",
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                animation: "scaleIn 0.4s ease-out",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span style={{ color: colors.text, fontSize: "12px" }}>
                  {currentUpdate.type === "added" ? "+" : "-"}
                </span>
                <span style={{ fontWeight: "600" }}>{currentUpdate.title}</span>
              </div>
              {currentUpdate.time && (
                <div
                  style={{ fontSize: "11px", opacity: 0.8, marginTop: "4px" }}
                >
                  {currentUpdate.time}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarFeedback;
